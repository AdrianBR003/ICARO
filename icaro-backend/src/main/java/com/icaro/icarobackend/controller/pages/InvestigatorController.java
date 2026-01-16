package com.icaro.icarobackend.controller.pages;

import com.icaro.icarobackend.model.Investigator;
import com.icaro.icarobackend.service.page.InvestigatorService;

import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/investigators")
@CrossOrigin(origins = "http://localhost:4321", allowCredentials = "true") // Adjust port as needed
public class InvestigatorController {

    private String uploadDir = "src/main/resources/static/assets/people";


    private final InvestigatorService investigatorService;

    public InvestigatorController(InvestigatorService investigatorService) {
        this.investigatorService = investigatorService;
    }

    // ---------- METODOS SIN VERIFICACION -------------


    @GetMapping("/all")
    public ResponseEntity<List<Investigator>> getAllInvestigator() {
        return ResponseEntity.ok(investigatorService.getAllInvestigator());
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<Investigator>> getInvestigatorsPaged(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {

        Sort stableSort = Sort.by(Sort.Order.asc("familyName"), Sort.Order.asc("givenNames"));
        Pageable pageable = PageRequest.of(page, size, stableSort);
        Page<Investigator> pageResult = investigatorService.getInvestigatorsPaged(query, pageable);

        return ResponseEntity.ok(pageResult);
    }

    // ---------- METODOS VERIFICACION -------------

    // CREAR (POST)
    @PostMapping("/save")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createInvestigator(@RequestBody Investigator investigator) {
        // Validar si ya existe
        if (investigatorService.findInvestigatorbyOID(investigator.getOrcid()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT) // 409 Conflict
                    .body("Error: Ya existe un investigador con el ORCID " + investigator.getOrcid());
        }

        Investigator saved = investigatorService.saveInvestigator(investigator);
        // Devolver 201 Created
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/save/{orcid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateInvestigator(@PathVariable String orcid, @RequestBody Investigator investigator) {
        try {
            Investigator updated = investigatorService.updateInvestigator(orcid, investigator);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error actualizando: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{orcid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteInvestigator(@PathVariable String orcid) {
        investigatorService.deleteInvestigator(orcid);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadImage(@PathVariable String id, @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("El archivo está vacío");
        }

        boolean success = investigatorService.uploadImage(id, file);

        if (success) {
            return ResponseEntity.ok().body("{\"message\": \"Imagen subida correctamente\"}");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al subir la imagen o usuario no encontrado");
        }
    }

    @GetMapping("/check-image/{orcid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> checkImageExists(@PathVariable String orcid) {
        Map<String, Object> response = new HashMap<>();

        String[] extensions = {"jpg", "png", "webp"};
        String foundExtension = null;

        for (String ext : extensions) {
            Path imagePath = Paths.get(uploadDir, "img_" + orcid + "." + ext);
            if (Files.exists(imagePath)) {
                foundExtension = ext;
                break;
            }
        }

        response.put("exists", foundExtension != null);
        response.put("extension", foundExtension);
        response.put("imageUrl", foundExtension != null ?
                "/static/assets/people/img_" + orcid + "." + foundExtension :
                "/static/assets/people/default.jpg");

        return ResponseEntity.ok(response);
    }

}
