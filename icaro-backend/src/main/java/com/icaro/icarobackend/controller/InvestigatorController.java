package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.model.Investigator;
import com.icaro.icarobackend.repository.InvestigatorRepository;
import com.icaro.icarobackend.service.InvestigatorService;
import com.icaro.icarobackend.service.OrcidService;
import com.mongodb.internal.bulk.UpdateRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/investigators")
public class InvestigatorController {

    private final InvestigatorService investigatorService;
    private final OrcidService orcidService;
    public InvestigatorController(InvestigatorService investigatorService, OrcidService orcidService) {
        this.investigatorService = investigatorService;
        this.orcidService = orcidService;
    }

    @PutMapping("/{orcid}")
    public ResponseEntity<Void> updateInvestigator(
            @PathVariable String orcid,
            @RequestBody Map<String, Object> body,
            HttpSession session) {

        if (!Boolean.TRUE.equals(session.getAttribute("admin"))) {
            return ResponseEntity.status(403).build();
        }

        String givenNames = (String) body.get("name");
        String familyName = (String) body.get("familyName");
        String email = (String) body.get("email");

        this.investigatorService.saveInvestigatorbyId(new Investigator(orcid,givenNames,familyName,email,""));
        return ResponseEntity.noContent().build();
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
