package com.icaro.icarobackend;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import java.util.TimeZone;

@SpringBootApplication
@EnableMethodSecurity
public class IcaroBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(IcaroBackendApplication.class, args);
    }

    @PostConstruct
    public void init() {
        // Forzamos a la JVM a usar la hora de Madrid
        TimeZone.setDefault(TimeZone.getTimeZone("Europe/Madrid"));
        System.out.println("Hora del sistema configurada a: " + new java.util.Date());
    }
}
