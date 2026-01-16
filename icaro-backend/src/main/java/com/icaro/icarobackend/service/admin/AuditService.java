package com.icaro.icarobackend.service.admin;

import com.icaro.icarobackend.dto.AuditLogDTO;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class AuditService {

    private static final String LOG_FOLDER = "/app/logs/audit";
    private static final String LOG_FILE = "admin-audit.log";
    private static final Path FILE_PATH = Paths.get(LOG_FOLDER, LOG_FILE);

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public AuditService() {
        try {
            Files.createDirectories(Paths.get(LOG_FOLDER));
            if (!Files.exists(FILE_PATH)) {
                Files.createFile(FILE_PATH);
            }
        } catch (IOException e) {
            System.err.println("CRITICAL: No se pudo crear el archivo de auditoría: " + e.getMessage());
        }
    }

    /**
     * Escribe una nueva línea en el archivo log.
     * Formato: FECHA|ACTOR|ACCION|ENTIDAD|DETALLES|URL
     */
    public static void recordAction(String actor, String action, String entity, String details, String url) {
        String timestamp = LocalDateTime.now().format(formatter);

        // Limpiamos los pipes (|) del texto para no romper el formato
        String safeDetails = details.replace("|", "-");

        String logLine = String.join("|", timestamp, actor, action, entity, safeDetails, url);

        try {
            // Escribimos al final del archivo (APPEND)
            Files.write(FILE_PATH, Collections.singletonList(logLine), StandardCharsets.UTF_8, StandardOpenOption.APPEND);
        } catch (IOException e) {
            System.err.println("Error escribiendo auditoría: " + e.getMessage());
        }
    }

    /**
     * Lee las últimas N líneas del archivo.
     */
    public List<AuditLogDTO> getRecentAudits(int limit) {
        if (!Files.exists(FILE_PATH)) return Collections.emptyList();

        try (Stream<String> lines = Files.lines(FILE_PATH, StandardCharsets.UTF_8)) {
            List<String> allLines = lines.collect(Collectors.toList());

            // Cogemos las últimas 'limit' líneas
            int start = Math.max(0, allLines.size() - limit);
            List<String> lastLines = allLines.subList(start, allLines.size());

            // Las invertimos para que la más reciente salga primero
            Collections.reverse(lastLines);

            return lastLines.stream()
                    .map(this::parseLine)
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());

        } catch (IOException e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    private AuditLogDTO parseLine(String line) {
        try {
            String[] parts = line.split("\\|");
            if (parts.length >= 6) {
                return new AuditLogDTO(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]);
            }
            return null; // Línea corrupta
        } catch (Exception e) {
            return null;
        }
    }
}