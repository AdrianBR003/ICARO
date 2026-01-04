package com.icaro.icarobackend.service.orcid;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.icaro.icarobackend.dto.orcid.OrcidPreviewDTO;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class OrcidService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // Inyectamos el bean específico que creaste en OrcidClient
    public OrcidService(@Qualifier("orcidRestTemplate") RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public OrcidPreviewDTO fetchOrcidData(String orcidId) {

        String relativeUrl = "/" + orcidId + "/record";

        // --- LOG DE DEPURACIÓN ---
        log.info("---- INICIO PETICIÓN ORCID ----");
        log.info("Buscando ID: {}", orcidId);
        log.info("URL Relativa: {}", relativeUrl);
        // -------------------------

        try {
            var response = restTemplate.getForObject(relativeUrl, String.class);

            // --- LOG DE ÉXITO ---
            log.info("Respuesta recibida. Longitud: {}", response != null ? response.length() : "NULL");
            // --------------------

            JsonNode root = objectMapper.readTree(response);
            return mapToDto(orcidId, root);

        } catch (HttpClientErrorException.NotFound e) {
            log.error("ERROR 404: No encontrado en ORCID");
            throw new RuntimeException("Investigador no encontrado en ORCID");
        } catch (Exception e) {
            // --- LOG DE ERROR DETALLADO ---
            log.error("ERROR GRAVE conectando con ORCID: ", e);
            throw new RuntimeException("Error al obtener datos de ORCID: " + e.getMessage());
        }
    }

    // Mapeo manual del JSON complejo de ORCID a nuestro DTO simple
    private OrcidPreviewDTO mapToDto(String orcidId, JsonNode root) {
        OrcidPreviewDTO dto = new OrcidPreviewDTO();
        dto.setOrcidId(orcidId);

        // 1. Datos Personales (Navegación segura por el árbol JSON)
        JsonNode person = root.path("person");
        dto.setFirstName(person.path("name").path("given-names").path("value").asText(null));
        dto.setLastName(person.path("name").path("family-name").path("value").asText(null));
        dto.setBiography(person.path("biography").path("content").asText(null));

        // Emails
        JsonNode emails = person.path("emails").path("email");
        if (emails.isArray() && !emails.isEmpty()) {
            dto.setEmail(emails.get(0).path("email").asText(null));
        }

        // 2. Publicaciones (Works)
        List<OrcidPreviewDTO.OrcidWorkDTO> works = new ArrayList<>();
        JsonNode worksGroups = root.path("activities-summary").path("works").path("group");

        if (worksGroups.isArray()) {
            for (JsonNode group : worksGroups) {
                // ORCID agrupa duplicados. Tomamos el primer resumen del grupo.
                JsonNode workSummary = group.path("work-summary").get(0);
                if (workSummary != null) {
                    OrcidPreviewDTO.OrcidWorkDTO workDto = new OrcidPreviewDTO.OrcidWorkDTO();

                    workDto.setTitle(workSummary.path("title").path("title").path("value").asText("Sin título"));
                    workDto.setType(workSummary.path("type").asText("UNKNOWN"));

                    // La fecha es compleja, a veces es año, a veces fecha completa
                    workDto.setYear(workSummary.path("publication-date").path("year").path("value").asText(null));
                    workDto.setPutCode(workSummary.path("put-code").asText());

                    works.add(workDto);
                }
            }
        }
        dto.setWorks(works);
        return dto;
    }
}