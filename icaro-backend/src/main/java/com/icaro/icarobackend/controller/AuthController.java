package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:4321", "http://localhost:3000", "http://127.0.0.1:4321"})
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    // Credenciales simples
    private final String ADMIN_USERNAME = "admin";
    private final String ADMIN_PASSWORD = "admin123";

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        if (ADMIN_USERNAME.equals(loginRequest.username()) && ADMIN_PASSWORD.equals(loginRequest.password())){

            String token = jwtUtil.generateToken(loginRequest.username());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "isAdmin", true,
                    "message", "Login exitoso"
            ));
        }

        return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "error", "Credenciales incorrectas"
        ));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.validateToken(token)) {
                return ResponseEntity.ok(Map.of(
                        "authenticated", true,
                        "isAdmin", true,
                        "username", jwtUtil.getUsernameFromToken(token)
                ));
            }
        }

        return ResponseEntity.ok(Map.of(
                "authenticated", false,
                "isAdmin", false
        ));
    }
}

record LoginRequest(String username, String password) {}