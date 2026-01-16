package com.icaro.icarobackend.controller.config;

import com.icaro.icarobackend.config.JwtUtil;
import com.icaro.icarobackend.model.User;
import com.icaro.icarobackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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

                // Generar Token
                String token = jwtUtil.generateToken(user.getUsername());

                // Construir respuesta exitosa
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("token", token);
                response.put("username", user.getUsername());
                response.put("isAdmin", Boolean.TRUE.equals(user.isAdmin()));
                response.put("message", "Login exitoso");

                return ResponseEntity.ok(response);
            }
        }

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("error", "Credenciales incorrectas");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
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