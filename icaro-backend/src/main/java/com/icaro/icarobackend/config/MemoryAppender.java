package com.icaro.icarobackend.config;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;
import com.icaro.icarobackend.service.admin.LogService;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class MemoryAppender extends AppenderBase<ILoggingEvent> {

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            .withZone(ZoneId.systemDefault());

    @Override
    protected void append(ILoggingEvent event) {
        String msg = event.getFormattedMessage();
        String loggerName = event.getLoggerName();

        // --- FILTROS DE RUIDO ---

        // 1. Ignorar las peticiones al propio endpoint de logs (El bucle infinito)
        if (msg.contains("/api/admin/logs/live")) {
            return;
        }

        // 2. Ignorar los Health Checks (si usas Docker/Kubernetes probes)
        if (msg.contains("/actuator/health") || msg.contains("/health")) {
            return;
        }

        // 3. Ignorar logs del Controlador de Logs (salvo que sean errores)
        if (loggerName.contains("AdminLogController") && event.getLevel().equals(Level.INFO)) {
            return;
        }

        // -------------------------

        // Si pasa el filtro, formateamos y guardamos
        String formattedMsg = String.format("%s | %s | %s",
                formatter.format(Instant.ofEpochMilli(event.getTimeStamp())),
                event.getLevel(),
                msg);

        LogService.appendLog(formattedMsg);
    }
}