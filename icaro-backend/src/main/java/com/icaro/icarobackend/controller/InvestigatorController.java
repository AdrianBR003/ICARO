package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.model.Investigator;
import com.icaro.icarobackend.repository.InvestigatorRepository;
import com.icaro.icarobackend.service.InvestigatorService;
import com.icaro.icarobackend.service.OrcidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investigators")
public class InvestigatorController {

    private final InvestigatorService investigatorService;
    private final OrcidService orcidService;
    public InvestigatorController(InvestigatorService investigatorService, OrcidService orcidService) {
        this.investigatorService = investigatorService;
        this.orcidService = orcidService;
    }

    /**
     * Endpoint intermediaria con API ORCID
     * @param orcid
     * @return
     */
    @GetMapping("/{orcid}")
    public ResponseEntity<Investigator> getInvestigatorOrcid(@PathVariable String orcid){
        Investigator inv = this.orcidService.fetchInvestigator(orcid);
        return ResponseEntity.ok(inv);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Investigator>> getAllInvestigator(){
        return ResponseEntity.ok(investigatorService.getAllInvestigator());
    }

    /**
     * Endpoint que guarda el Investigator y sus trabajos asociados
     * @param orcid
     * @return
     */
    @PostMapping("/{orcid}/save")
    public ResponseEntity<Investigator> saveInvestigator(@PathVariable String orcid){
        Investigator inv = this.investigatorService.syncAndMergeInvestigator(orcid);
        return ResponseEntity.ok(inv);
    }

}
