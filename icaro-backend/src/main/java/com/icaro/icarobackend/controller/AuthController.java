package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.config.JwtUtil;
import com.icaro.icarobackend.model.User;
import com.icaro.icarobackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:4321", "http://localhost:3000", "http://127.0.0.1:4321"})
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        Optional<User> userOpt = userRepository.findByUsername(loginRequest.username());

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (passwordEncoder.matches(loginRequest.password(), user.getPasswordHash())) {
                String token = jwtUtil.generateToken(user.getUsername());

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "token", token,
                        "isAdmin", user.isAdmin(),
                        "message", "Login exitoso"
                ));
            }
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
                        "username", jwtUtil.getUsernameFromToken(token),
                        "isAdmin", jwtUtil.getIsAdminFromToken(token)
                ));
            }
        }

        return ResponseEntity.ok(Map.of(
                "authenticated", false,
                "isAdmin", false
        ));
    }

    public record LoginRequest(String username, String password) {}

}