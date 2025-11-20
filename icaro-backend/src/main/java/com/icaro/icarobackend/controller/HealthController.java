package com.icaro.icarobackend.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Void> health() { // Comprobar si el backend esta operativo
        return ResponseEntity.ok().build();
    }   

}
