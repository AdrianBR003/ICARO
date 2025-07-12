package com.icaro.icarobackend.service;

import com.icaro.icarobackend.model.Work;
import com.icaro.icarobackend.repository.WorkRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkService {

    WorkRepository workRepository;
    OrcidService orcidService;

    public WorkService(WorkRepository workRepository, OrcidService orcidService) {
        this.workRepository = workRepository;
        this.orcidService = orcidService;
    }

    public List<Work> getWorksForInvestigator(String orcid){
        return workRepository.findAll().stream()
                .filter(w -> w.getOwnerOrcids().contains(orcid))
                .collect(Collectors.toList());
    }

}
