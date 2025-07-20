package com.icaro.icarobackend.controller;


import com.icaro.icarobackend.model.Work;
import com.icaro.icarobackend.service.OrcidService;
import com.icaro.icarobackend.service.WorkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/works")
public class WorkController {

    private final WorkService workService;
    private final OrcidService orcidService;

    public WorkController(WorkService workService, OrcidService orcidService) {
        this.workService = workService;
        this.orcidService = orcidService;
    }

    @GetMapping("/all/{orcid}")
    public ResponseEntity<List<Work>> getAllWorksbyIdOrcid(@PathVariable("orcid") String orcid) {
        return ResponseEntity.ok(workService.getWorksForInvestigator(orcid));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Work>> getAllWorks() {
        return ResponseEntity.ok(workService.getAllWorks());
    }

    @GetMapping("/{orcid}")
    public ResponseEntity<List<Work>> getWorkOrcid(@PathVariable("orcid") String orcid) {
         return ResponseEntity.ok(orcidService.fetchWorks(orcid));
    }
}
