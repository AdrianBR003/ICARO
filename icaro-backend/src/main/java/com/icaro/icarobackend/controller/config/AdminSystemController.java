package com.icaro.icarobackend.controller.config;

import com.icaro.icarobackend.dto.SystemStatusDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/system")
@CrossOrigin(origins = "http://localhost:4321", allowCredentials = "true")
public class AdminSystemController {

    @Autowired
    private ConfigurableApplicationContext context;

    @GetMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemStatusDTO> getSystemStatus() {
        // 1. Datos fijos
        String serviceName = "Spring Boot API";
        String version = "v1.0.0"; // Puedes leerlo de properties si quieres

        // 2. Cálculo de Memoria (JVM)
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory(); // Memoria máxima que Java puede llegar a coger
        long usedMemory = runtime.totalMemory() - runtime.freeMemory();

        double memoryPercentage = ((double) usedMemory / maxMemory) * 100;
        memoryPercentage = Math.round(memoryPercentage * 100.0) / 100.0;

        // 3. Uptime (Tiempo encendido)
        RuntimeMXBean rb = ManagementFactory.getRuntimeMXBean();
        long uptimeMillis = rb.getUptime();
        String uptime = formatDuration(uptimeMillis);

        SystemStatusDTO status = new SystemStatusDTO(
                true,
                serviceName,
                version,
                memoryPercentage,
                uptime
        );

        return ResponseEntity.ok(status);
    }

    @PostMapping("/restart")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restartApplication() {
        Thread restartThread = new Thread(() -> {
            try {
                Thread.sleep(1000);
                System.out.println("⚠️ [Backend] Iniciando secuencia de reinicio...");
                
                // 1. Cerramos Spring ordenadamente (sin importar qué devuelva)
                SpringApplication.exit(context, () -> 0);
                
                // 2. Forzamos la salida con código 10 SÍ o SÍ
                System.out.println("⚠️ [Backend] Ejecutando System.exit(10)");
                System.exit(10);
                
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
        
        restartThread.setDaemon(false);
        restartThread.start();
        
        return ResponseEntity.ok(Map.of("message", "Reiniciando servidor..."));
    }

    @PostMapping("/shutdown")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> shutdownApplication() {
        Thread shutdownThread = new Thread(() -> {
            try {
                Thread.sleep(1000);
                // CÓDIGO 0: Significa "Apagar de verdad"
                SpringApplication.exit(context, () -> 0);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
        shutdownThread.setDaemon(false);
        shutdownThread.start();
        return ResponseEntity.ok(Map.of("message", "Apagando servidor..."));
    }


    // Utilidad simple para formatear milisegundos a texto legible
    private String formatDuration(long millis) {
        Duration duration = Duration.ofMillis(millis);
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        return String.format("%dh %dm", hours, minutes);
    }
}