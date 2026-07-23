package com.icaro.icarobackend.controller.config;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/session")
public class SessionController {

    @PostMapping("/toggle-admin")
    public ResponseEntity<?> toggleAdmin(HttpSession session) {
        Boolean isAdmin = (Boolean) session.getAttribute("admin");
        if (isAdmin == null) {
            isAdmin = false;
        }

        session.setAttribute("admin", !isAdmin);
        return ResponseEntity.ok(!isAdmin);
    }

    @GetMapping("/check-admin")
    public ResponseEntity<?> checkAdmin(HttpSession session) {
        Boolean isAdmin = (Boolean) session.getAttribute("admin");
        return ResponseEntity.ok(isAdmin != null && isAdmin);
    }

    @PostMapping("/set-admin")
    public ResponseEntity<?> setAdmin(HttpSession session, @RequestParam boolean admin) {
        session.setAttribute("admin", admin);
        return ResponseEntity.ok(admin);
    }

    @PostMapping("/login-admin") // Para simular login de admin
    public ResponseEntity<?> loginAdmin(HttpSession session) {
        session.setAttribute("admin", true);
        return ResponseEntity.ok(true);
    }
}