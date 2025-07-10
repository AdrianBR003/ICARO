package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.model.Investigator;
import com.icaro.icarobackend.service.OrcidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/investigators")
public class InvestigatorController {

    private final OrcidService  orcidService;


    public InvestigatorController(OrcidService orcidService) {
        this.orcidService = orcidService;
    }

    @GetMapping("/{orcid}")
    public Investigator getInvestigator(@PathVariable String orcid){
        return orcidService.fetchInvestigator(orcid);
    }

}
