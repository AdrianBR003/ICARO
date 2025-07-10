package com.icaro.icarobackend.service;

import com.icaro.icarobackend.model.Investigator;
import com.icaro.icarobackend.repository.InvestigatorRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class InvestigatorService {

    InvestigatorRepository investigatorRepository;
    OrcidService orcidService;

    public InvestigatorService(InvestigatorRepository investigatorRepository, OrcidService orcidService) {
        this.investigatorRepository = investigatorRepository;
        this.orcidService = orcidService;
    }

    public Investigator saveFetchInvestigator(String orcid){
        return investigatorRepository.findById(orcid)
                .orElseGet(() -> {
                            log.info("Saving investigator with orcid {}", orcid);
                            Investigator inv = orcidService.fetchInvestigator(orcid);
                            log.info("Saving investigator with orcid {}", orcid);
                            return investigatorRepository.save(inv);
                });
    }

}
