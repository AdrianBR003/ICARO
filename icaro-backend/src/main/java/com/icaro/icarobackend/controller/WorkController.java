package com.icaro.icarobackend.controller;


import com.icaro.icarobackend.model.Work;
import com.icaro.icarobackend.service.OrcidService;
import com.icaro.icarobackend.service.WorkService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    // ---------- METODOS SIN VERIFICACION -------------


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

    // Metodo para la paginacion:

    @GetMapping("/paged")
    public ResponseEntity<Page<Work>> getWorksPaged(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) { // 5 por defecto

        // Ordenamos por año (descendente) por defecto, o lo que prefieras
        Sort stableSort = Sort.by(Sort.Order.desc("publicationDate"), Sort.Order.desc("id"));
        Pageable pageable = PageRequest.of(page, size, stableSort);
        Page<Work> works = workService.getWorkPaged(query, pageable);
        return ResponseEntity.ok(works);
    }

    // ---------- METODOS VERIFICACION -------------


    @PostMapping("/save")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> saveWork(@RequestBody Work work) {
        this.workService.saveWork(work);
        return  ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteWork(@PathVariable("id") String id) {
        this.workService.deleteWork(id);
        return ResponseEntity.ok().build();
    }

}
