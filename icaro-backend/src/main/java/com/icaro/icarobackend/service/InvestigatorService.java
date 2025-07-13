package com.icaro.icarobackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.icaro.icarobackend.model.Investigator;
import com.icaro.icarobackend.model.Work;
import com.icaro.icarobackend.repository.InvestigatorRepository;
import com.icaro.icarobackend.repository.WorkRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class InvestigatorService {

    private final InvestigatorRepository investigatorRepository;
    private final OrcidService orcidService;
    private final WorkRepository workRepository;

    public InvestigatorService(InvestigatorRepository investigatorRepository, OrcidService orcidService, WorkRepository workRepository) {
        this.investigatorRepository = investigatorRepository;
        this.orcidService = orcidService;
        this.workRepository = workRepository;
    }

    public List<Investigator> getAllInvestigator(){
        log.info("getAllInvestigator");
        return investigatorRepository.findAll();
    }

    /**
     * 1) Fetch Investigator from ORCID and save.
     * 2) Fetch the /record summary, use external-ids to detect duplicates.
     * 3) Merge ownerOrcids and participants for existing works.
     * 4) Insert truly new works with initial owner & participant.
     */
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

                //  - externalIds
                for (String ext : summary.getExternalIds()) {
                    if (!existing.getExternalIds().contains(ext)) {
                        existing.getExternalIds().add(ext);
                        updated = true;
                    }
                }

                if (updated) {
                    workRepository.save(existing);
                    log.info("Merged data into work '{}'", existing.getTitle());
                }
            } else {
                Work toSave = Work.builder()
                        .putCode(summary.getPutCode())
                        .title(summary.getTitle())
                        .type(summary.getType())
                        .externalIds(new ArrayList<>(summary.getExternalIds()))
                        .ownerOrcids(new ArrayList<>(List.of(orcid)))
                        .participants(new ArrayList<>(List.of(fullName)))
                        .build();

                workRepository.save(toSave);
                log.info("Inserted new work '{}' for ORCID {}", toSave.getTitle(), orcid);
            }
        }

        return inv;
    }

    private String normalize(String text) {
        if (text == null) return "";
        String n = Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^\\p{Alnum} ]+", "")
                .toLowerCase()
                .trim();
        return n;
    }

}
