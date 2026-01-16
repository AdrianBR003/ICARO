package com.icaro.icarobackend.controller.config;

import com.icaro.icarobackend.dto.AuditLogDTO;
import com.icaro.icarobackend.service.admin.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit")
@CrossOrigin(origins = "http://localhost:4321", allowCredentials = "true")
public class AdminAuditController {

    @Autowired
    private AuditService auditService;

    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogDTO>> getRecentAudits() {
        List<AuditLogDTO> logs = auditService.getRecentAudits(20);
        return ResponseEntity.ok(logs);
    }
}