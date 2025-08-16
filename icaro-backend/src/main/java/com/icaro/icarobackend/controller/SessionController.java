package com.icaro.icarobackend.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}