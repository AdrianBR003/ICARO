package com.icaro.icarobackend.controller.config;

import com.icaro.icarobackend.service.admin.LogService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/logs")
@CrossOrigin(origins = "http://localhost:4321", allowCredentials = "true")
public class AdminLogController {

    private final LogService logService;

    public AdminLogController(LogService logService) {
        this.logService = logService;
    }

    // VER EN VIVO (RAM)
    @GetMapping("/live")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<String>> getLiveLogs() {
        List<String> logs = logService.getLogs();

        // Devolvemos las últimas 50 para la vista rápida
        int start = Math.max(0, logs.size() - 50);
        List<String> recentLogs = logs.subList(start, logs.size());

        // Invertimos para que lo nuevo salga arriba
        Collections.reverse(recentLogs);

        return ResponseEntity.ok(recentLogs);
    }

    // DESCARGAR ARCHIVO (Generado al vuelo)
    @GetMapping("/download")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> downloadLogs() {
        // Cogemos TODO lo que hay en memoria
        List<String> logs = logService.getLogs();

        // Convertimos a un solo String gigante
        String content = String.join("\n", logs);
        ByteArrayResource resource = new ByteArrayResource(content.getBytes(StandardCharsets.UTF_8));

        // Nombre del archivo con fecha: icaro-logs-2024-01-16_10-30.txt
        String filename = "icaro-logs-" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm")) + ".txt";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentLength(resource.contentLength())
                .contentType(MediaType.TEXT_PLAIN)
                .body(resource);
    }

    @DeleteMapping("/clear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> clearLogs() {
        logService.clear();
        return ResponseEntity.ok().build();
    }
}