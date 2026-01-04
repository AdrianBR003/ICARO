package com.icaro.icarobackend.controller.orcid;

import com.icaro.icarobackend.dto.orcid.OrcidPreviewDTO;
import com.icaro.icarobackend.service.orcid.OrcidService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/orcid-test")
@RequiredArgsConstructor
public class AdminOrcidController {

    private final OrcidService orcidService;

    @GetMapping("/preview/{orcidId}")
    //@PreAuthorize("hasRole('ADMIN')") // Por un tema de posible explotación de peticiones, vamos a poner que se requiera el admin
    public ResponseEntity<OrcidPreviewDTO> previewOrcidData(@PathVariable String orcidId) {
        String cleanId = orcidId.trim();
        OrcidPreviewDTO data = orcidService.fetchOrcidData(cleanId);
        return ResponseEntity.ok(data);
    }
}