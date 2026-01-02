package com.icaro.icarobackend.service;

import com.icaro.icarobackend.model.Work;
import com.icaro.icarobackend.model.Investigator;
import com.icaro.icarobackend.repository.WorkRepository;
import com.icaro.icarobackend.repository.InvestigatorRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class InvestigatorService {

    private final InvestigatorRepository investigatorRepository;
    private final OrcidService orcidService;
    private final WorkRepository workRepository;

    public InvestigatorService(InvestigatorRepository investigatorRepository,
                               OrcidService orcidService,
                               WorkRepository workRepository) {
        this.investigatorRepository = investigatorRepository;
        this.orcidService = orcidService;
        this.workRepository = workRepository;
    }

    public Page<Investigator> getInvestigatorsPaged(String query, Pageable pageable) {
        if (query != null && !query.trim().isEmpty()) {
            // Buscamos lo mismo en nombre O apellido
            return investigatorRepository.findByGivenNamesContainingIgnoreCaseOrFamilyNameContainingIgnoreCase(
                    query, query, pageable);
        }
        return investigatorRepository.findAll(pageable);
    }

    public List<Investigator> getAllInvestigator(){
        log.info("getAllInvestigator");
        return investigatorRepository.findAll();
    }

    public Investigator saveInvestigator(Investigator investigator) {
        return investigatorRepository.save(investigator);
    }

    public Investigator syncAndMergeInvestigator(String orcid) {
        Investigator inv = orcidService.fetchInvestigator(orcid);
        investigatorRepository.save(inv);

        List<Work> summaries = orcidService.fetchWorks(orcid);
        for (Work summary : summaries) {
            String normTitle = normalize(summary.getTitle());
            Optional<Work> existingOpt = workRepository.findAll().stream()
                    .filter(w -> normalize(w.getTitle()).equals(normTitle))
                    .findFirst();

            String fullName = inv.getGivenNames() + " " + inv.getFamilyName();

            if (existingOpt.isPresent()) {
                Work existing = existingOpt.get();
                boolean updated = false;

                log.info("Duplicate work: '{}' for ORCID {}", existing.getTitle(), orcid);

                if (!existing.getOwnerOrcids().contains(orcid)) {
                    existing.getOwnerOrcids().add(orcid);
                    updated = true;
                }

                if (!existing.getParticipants().contains(fullName)) {
                    existing.getParticipants().add(fullName);
                    updated = true;
                }

                for (String ext : summary.getExternalIds()) {
                    if (!existing.getExternalIds().contains(ext)) {
                        existing.getExternalIds().add(ext);
                        updated = true;
                    }
                }

                // actualizar projectDate si cambia
                LocalDate newDate = summary.getProjectDate();
                if (newDate != null && !newDate.equals(existing.getProjectDate())) {
                    existing.setProjectDate(newDate);
                    updated = true;
                }

                if (updated) {
                    workRepository.save(existing);
                    log.info("Merged data into work '{}'", existing.getTitle());
                }
            } else {
                Work toSave = Work.builder()
                        .id(summary.getId())
                        .title(summary.getTitle())
                        .tags(summary.getTags())
                        .externalIds(new ArrayList<>(summary.getExternalIds()))
                        .ownerOrcids(new ArrayList<>(List.of(orcid)))
                        .participants(new ArrayList<>(List.of(fullName)))
                        .projectDate(summary.getProjectDate()) // fecha del proyecto
                        .build();

                workRepository.save(toSave);
                log.info("Inserted new work '{}' for ORCID {}", toSave.getTitle(), orcid);
            }
        }

        return inv;
    }

    public Optional<Investigator> findInvestigatorbyOID(String oid){
        log.info("findInvestigatorbyOID");
        return this.investigatorRepository.findById(oid);
    }

    public void deleteInvestigator(String orcid) {
        investigatorRepository.deleteById(orcid);
    }

    private String normalize(String text) {
        if (text == null) return "";
        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^\\p{Alnum} ]+", "")
                .toLowerCase()
                .trim();
    }
}
