package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.model.Investigator;
import com.icaro.icarobackend.service.InvestigatorService;
import com.icaro.icarobackend.service.OrcidService;

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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/investigators")
@CrossOrigin(origins = "http://localhost:4321", allowCredentials = "true") // Adjust port as needed
public class InvestigatorController {

    private String uploadDir = "src/main/resources/static/assets/people";


    private final InvestigatorService investigatorService;
    private final OrcidService orcidService;

    public InvestigatorController(InvestigatorService investigatorService, OrcidService orcidService) {
        this.investigatorService = investigatorService;
        this.orcidService = orcidService;
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

    // ACTUALIZAR (PUT)
    @PutMapping("/save/{orcid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateInvestigator(@PathVariable String orcid, @RequestBody Investigator investigator) {
        // Validar si NO existe
        if (investigatorService.findInvestigatorbyOID(orcid).isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND) // 404 Not Found
                    .body("Error: No se encuentra el investigador con ORCID " + orcid);
        }
        investigator.setOrcid(orcid);
        Investigator updated = investigatorService.saveInvestigator(investigator);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{orcid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteInvestigator(@PathVariable String orcid) {
        investigatorService.deleteInvestigator(orcid);
        return ResponseEntity.ok().build();
    }


    /**
     * Endpoint intermediaria con API ORCID
     *
     * @param orcid
     * @return
     */
    @GetMapping("/{orcid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Investigator> getInvestigatorOrcid(@PathVariable String orcid) {
        Investigator inv = this.orcidService.fetchInvestigator(orcid);
        return ResponseEntity.ok(inv);
    }


    /**
     * Endpoint que guarda el Investigator y sus trabajos asociados
     *
     * @param orcid
     * @return
     */
    @PostMapping("/{orcid}/save")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Investigator> saveInvestigator(@PathVariable String orcid) {
        Investigator inv = this.investigatorService.syncAndMergeInvestigator(orcid);
        return ResponseEntity.ok(inv);
    }

    /**
     * Endpoint que sube la imagen a partir de la url uploaDir
     *
     * @param image
     * @param orcid
     * @return
     */
    @PostMapping("/upload-image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam("orcid") String orcid) {

        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No image provided"));
            }

            // Crear directorio si no existe
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Determinar extensión del archivo original
            String originalFilename = image.getOriginalFilename();
            String extension = originalFilename != null ?
                    originalFilename.substring(originalFilename.lastIndexOf(".") + 1) : "jpg";

            // Guardar como img_{orcid}.{ext}
            String filename = "img_" + orcid + "." + extension;
            Path filePath = uploadPath.resolve(filename);

            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imageUrl", "/static/assets/people/" + filename);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to save image: " + e.getMessage()));
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
