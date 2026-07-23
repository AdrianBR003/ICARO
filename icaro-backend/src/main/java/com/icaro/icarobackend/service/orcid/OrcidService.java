package com.icaro.icarobackend.service.orcid;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.icaro.icarobackend.dto.orcid.OrcidCheckDTO;
import com.icaro.icarobackend.dto.orcid.OrcidImportDTO;
import com.icaro.icarobackend.dto.orcid.OrcidPreviewDTO;
import com.icaro.icarobackend.model.Investigator;
import com.icaro.icarobackend.model.Work;
import com.icaro.icarobackend.repository.InvestigatorRepository;
import com.icaro.icarobackend.repository.WorkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class OrcidService {

    @Autowired
    private WorkRepository workRepository;

    @Autowired
    private InvestigatorRepository investigatorRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String ORCID_API_BASE = "https://pub.orcid.org/v3.0";

    // 1. FETCHING: OBTENER DATOS DE ORCID (API EXTERNA)

    public OrcidPreviewDTO getPreview(String orcidId) {
        String url = ORCID_API_BASE + "/" + orcidId + "/record";

        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());

            OrcidPreviewDTO dto = new OrcidPreviewDTO();
            dto.setOrcidId(orcidId);

            // A. Datos Personales
            JsonNode nameNode = root.path("person").path("name");
            dto.setFirstName(getNodeText(nameNode, "given-names", "value"));
            dto.setLastName(getNodeText(nameNode, "family-name", "value"));

            JsonNode bioNode = root.path("person").path("biography");
            dto.setBiography(getNodeText(bioNode, "content"));

            JsonNode emailsNode = root.path("person").path("emails").path("email");
            if (emailsNode.isArray() && emailsNode.size() > 0) {
                dto.setEmail(emailsNode.get(0).path("email").asText());
            }

            // B. Works (Investigaciones)
            List<OrcidPreviewDTO.OrcidWorkDTO> works = new ArrayList<>();
            JsonNode activities = root.path("activities-summary").path("works").path("group");

            if (activities.isArray()) {
                for (JsonNode group : activities) {
                    JsonNode workSummary = group.path("work-summary");
                    if (workSummary.isArray() && workSummary.size() > 0) {
                        JsonNode w = workSummary.get(0);
                        String title = w.path("title").path("title").path("value").asText();
                        String year = w.path("publication-date").path("year").path("value").asText();
                        String type = w.path("type").asText();
                        String putCode = w.path("put-code").asText();
                        works.add(new OrcidPreviewDTO.OrcidWorkDTO(title, year, type, putCode));
                    }
                }
            }
            dto.setWorks(works);
            return dto;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error conectando con ORCID: " + e.getMessage());
        }
    }

    private String getNodeText(JsonNode node, String... path) {
        JsonNode current = node;
        for (String p : path) current = current.path(p);
        return current.isMissingNode() || current.isNull() ? null : current.asText();
    }

    // 2. CHECKING: VERIFICACIÓN DE DUPLICADOS (STRICT + LEVENSHTEIN)

    public OrcidCheckDTO.Response checkDuplicates(OrcidCheckDTO.Request request) {
        System.out.println("--- CHECK DUPLICADOS (MODO ESTRICTO) ---");

        List<OrcidCheckDTO.AnalyzedWork> analyzedList = new ArrayList<>();

        for (int i = 0; i < request.getWorks().size(); i++) {
            OrcidCheckDTO.OrcidWorkItem item = request.getWorks().get(i);

            boolean isDuplicate = false;
            String reason = null;
            String existingId = null;

            // A. Por PutCode (Prioridad 1)
            if (item.getPutCode() != null && !item.getPutCode().isEmpty()) {
                Optional<Work> byCode = workRepository.findByPutCode(item.getPutCode());
                if (byCode.isPresent()) {
                    isDuplicate = true;
                    reason = "ID ORCID (PutCode) coincidente";
                    existingId = byCode.get().getId();
                }
            }

            // B. Comparación Interna (Auto-duplicados en la misma lista)
            if (!isDuplicate && item.getTitle() != null) {
                for (int j = 0; j < i; j++) {
                    OrcidCheckDTO.AnalyzedWork previousItem = analyzedList.get(j);
                    if (isSameWork(item.getTitle(), previousItem.getTitle())) {
                        isDuplicate = true;
                        reason = "Duplicado interno en esta lista";
                        break;
                    }
                }
            }

            // C. Por Título en BBDD (Algoritmo Levenshtein)
            if (!isDuplicate && item.getTitle() != null && item.getTitle().length() > 3) {

                String searchHint = item.getTitle().trim();
                if (searchHint.length() > 15) searchHint = searchHint.substring(0, 15);
                String safeRegex = Pattern.quote(searchHint);

                List<Work> candidates = workRepository.findByTitleContainingRegex(safeRegex);

                for (Work candidate : candidates) {
                    if (isSameWork(item.getTitle(), candidate.getTitle())) {
                        isDuplicate = true;
                        reason = "Título similar en BBDD";
                        existingId = candidate.getId();
                        break;
                    }
                }
            }

            analyzedList.add(new OrcidCheckDTO.AnalyzedWork(
                    item.getPutCode(),
                    item.getTitle(),
                    item.getYear(),
                    item.getType(),
                    isDuplicate,
                    reason,
                    existingId
            ));
        }
        return new OrcidCheckDTO.Response(analyzedList);
    }

    // --- Helpers Algorítmicos ---

    private boolean isSameWork(String titleA, String titleB) {
        if (titleA == null || titleB == null) return false;
        String normA = aggressiveNormalize(titleA);
        String normB = aggressiveNormalize(titleB);

        if (normA.equals(normB)) return true;

        int distance = calculateLevenshteinDistance(normA, normB);
        int maxLength = Math.max(normA.length(), normB.length());
        double threshold = maxLength * 0.15;

        return distance <= threshold;
    }

    private String aggressiveNormalize(String input) {
        if (input == null) return "";
        return input.toLowerCase().replaceAll("[^a-z0-9]", "");
    }

    private int calculateLevenshteinDistance(String x, String y) {
        if (x.isEmpty()) return y.length();
        if (y.isEmpty()) return x.length();
        int[][] dp = new int[x.length() + 1][y.length() + 1];
        for (int i = 0; i <= x.length(); i++) {
            for (int j = 0; j <= y.length(); j++) {
                if (i == 0) dp[i][j] = j;
                else if (j == 0) dp[i][j] = i;
                else {
                    dp[i][j] = min(
                            dp[i - 1][j - 1] + (x.charAt(i - 1) == y.charAt(j - 1) ? 0 : 1),
                            dp[i - 1][j] + 1,
                            dp[i][j - 1] + 1
                    );
                }
            }
        }
        return dp[x.length()][y.length()];
    }

    private int min(int... numbers) {
        return java.util.Arrays.stream(numbers).min().orElse(Integer.MAX_VALUE);
    }

    // 3. IMPORTING: GUARDAR DATOS EN MONGO

    public void importInvestigator(OrcidImportDTO dto) {
        System.out.println("Importando perfil para: " + dto.getOrcidId());

        // 1. Guardar Persona
        Investigator person = (Investigator) investigatorRepository.findByOrcid(dto.getOrcidId())
                .orElse(new Investigator());

        // Construimos el nombre completo para usarlo luego en los participantes
        String fullName = (dto.getFirstName() + " " + dto.getLastName()).trim();

        person.setOrcid(dto.getOrcidId());
        person.setGivenNames(fullName);
        person.setRole(dto.getRole());
        person.setOffice(dto.getOffice());
        person.setEmail(dto.getEmail());
        person.setPhone(dto.getPhone());
        person.setBiography(dto.getBiography());

        investigatorRepository.save(person);

        // 2. Guardar Works Seleccionados
        if (dto.getWorks() != null && !dto.getWorks().isEmpty()) {
            List<Work> worksToSave = new ArrayList<>();

            for (OrcidImportDTO.ImportWorkItem item : dto.getWorks()) {
                Work work = workRepository.findByPutCode(item.getPutCode())
                        .orElse(new Work());

                // Vinculación por IDs de ORCID (Dueños)
                work.setOrcidOwner(dto.getOrcidId());
                if (work.getOwnerOrcids() == null) work.setOwnerOrcids(new ArrayList<>());
                if (!work.getOwnerOrcids().contains(dto.getOrcidId())) {
                    work.getOwnerOrcids().add(dto.getOrcidId());
                }

                if (work.getParticipants() == null) {
                    work.setParticipants(new ArrayList<>());
                }
                if (!work.getParticipants().contains(fullName)) {
                    work.getParticipants().add(fullName);
                }
                // -------------------------------------------------------

                work.setTitle(item.getTitle());
                work.setPutCode(item.getPutCode());

                if (item.getYear() != null) {
                    try {
                        int y = Integer.parseInt(item.getYear());
                        if (work.getProjectDate() == null) {
                            work.setProjectDate(LocalDate.of(y, 1, 1));
                        }
                    } catch (NumberFormatException ignored) {}
                }
                worksToSave.add(work);
            }
            workRepository.saveAll(worksToSave);
        }
    }
}