package com.icaro.icarobackend.service;

import com.icaro.icarobackend.model.Work;
import com.icaro.icarobackend.model.Investigator;
import com.icaro.icarobackend.repository.WorkRepository;
import com.icaro.icarobackend.repository.InvestigatorRepository;
import com.icaro.icarobackend.service.orcid.OrcidService;
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
    private final WorkRepository workRepository;

    public InvestigatorService(InvestigatorRepository investigatorRepository,
                               WorkRepository workRepository) {
        this.investigatorRepository = investigatorRepository;
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

    public Optional<Investigator> findInvestigatorbyOID(String oid){
        log.info("findInvestigatorbyOID");
        return this.investigatorRepository.findById(oid);
    }

    public void deleteInvestigator(String orcid) {
        investigatorRepository.deleteById(orcid);
    }

}
