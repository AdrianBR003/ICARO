package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.model.Investigator;
import com.icaro.icarobackend.service.InvestigatorService;
import com.icaro.icarobackend.service.OrcidService;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/add")
    public ResponseEntity <Void> addInvestigator(
            @RequestBody Map<String, Object> body,
            HttpSession session) {

        if (!Boolean.TRUE.equals(session.getAttribute("admin"))) {
            return ResponseEntity.status(403).build();
        }
        String orcid = (String) body.get("orcid");
        String givenNames = (String) body.get("givenNames");
        String familyName = (String) body.get("familyName");
        String email = (String) body.get("email");
        String role = (String) body.get("role");
        String phone = (String) body.get("phone");
        String office = (String) body.get("office");

        this.investigatorService.saveInvestigatorbyId(new Investigator(orcid, givenNames, familyName, email, role, phone, office, ""));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete/{orcid}")
    public ResponseEntity<Void> deleteInvestigator(@PathVariable String orcid, HttpSession session) {
        // Verificar permisos de administrador
        if (!Boolean.TRUE.equals(session.getAttribute("admin"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            // Verificar si el investigador existe
            Optional<Investigator> investigator = investigatorService.findInvestigatorbyOID(orcid);

            if (investigator.isPresent()) {
                log.info("eliminando investigator: " + investigator.get().getOrcid());
                investigatorService.deleteInvestigatorbyOID(orcid);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error al eliminar investigador con ORCID: " + orcid, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{orcid}")
    public ResponseEntity   <Void> updateInvestigator(
            @PathVariable String orcid,
            @RequestBody Map<String, Object> body,
            HttpSession session) {

        if (!Boolean.TRUE.equals(session.getAttribute("admin"))) {
            return ResponseEntity.status(403).build();
        }

        String givenNames = (String) body.get("givenNames");
        String familyName = (String) body.get("familyName");
        String email = (String) body.get("email");
        String role = (String) body.get("role");
        String phone = (String) body.get("phone");
        String office = (String) body.get("office");

        this.investigatorService.saveInvestigatorbyId(new Investigator(orcid, givenNames, familyName, email, role, phone, office, ""));
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint intermediaria con API ORCID
     *
     * @param orcid
     * @return
     */
    @GetMapping("/{orcid}")
    public ResponseEntity<Investigator> getInvestigatorOrcid(@PathVariable String orcid) {
        Investigator inv = this.orcidService.fetchInvestigator(orcid);
        return ResponseEntity.ok(inv);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Investigator>> getAllInvestigator() {
        return ResponseEntity.ok(investigatorService.getAllInvestigator());
    }

    /**
     * Endpoint que guarda el Investigator y sus trabajos asociados
     *
     * @param orcid
     * @return
     */
    @PostMapping("/{orcid}/save")
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
