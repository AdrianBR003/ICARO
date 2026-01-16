package com.icaro.icarobackend.service.admin;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
public class LogService {

    // Guardamos máximo 1000 líneas en RAM
    private static final int MAX_LOGS = 1000;

    // Usamos una Deque concurrente para soportar hilos escribiendo a la vez
    private static final ConcurrentLinkedDeque<String> logBuffer = new ConcurrentLinkedDeque<>();

    public static void appendLog(String logLine) {
        if (logBuffer.size() >= MAX_LOGS) {
            logBuffer.pollFirst(); // Borra el más antiguo
        }
        logBuffer.offerLast(logLine);
    }

    public List<String> getLogs() {
        // Devolvemos una copia para evitar problemas de concurrencia al leer
        return new ArrayList<>(logBuffer);
    }

    public void clear() {
        logBuffer.clear();
    }
}
