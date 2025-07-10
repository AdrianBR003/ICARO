package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.model.Investigator;
import com.icaro.icarobackend.repository.InvestigatorRepository;
import com.icaro.icarobackend.service.InvestigatorService;
import com.icaro.icarobackend.service.OrcidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/investigators")
public class InvestigatorController {

    private final InvestigatorService investigatorService;
    public InvestigatorController(InvestigatorService investigatorService ) {
        this.investigatorService = investigatorService;
    }

    @PostMapping("/{orcid}/save")
    public ResponseEntity<Investigator> saveInvestigator(@PathVariable String orcid){
        Investigator inv = this.investigatorService.saveFetchInvestigator(orcid);
        return ResponseEntity.ok(inv);
    }

}
