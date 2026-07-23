package com.icaro.icarobackend.config;

import com.icaro.icarobackend.service.admin.AuditService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuditService auditService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws IOException, ServletException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                // Intentamos validar el token
                if (jwtUtil.validateToken(token)) {
                    // --- CASO DE ÉXITO (LOGIN CORRECTO) ---
                    String username = jwtUtil.getUsernameFromToken(token);
                    boolean isAdmin = jwtUtil.getIsAdminFromToken(token);

                    Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

                    if (isAdmin) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                    }

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(username, null, authorities);

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    // --- CASO 1: TOKEN EXISTE PERO ES INVÁLIDO (False) ---
                    AuditService.recordAction(
                            "Desconocido",
                            "SESSION_INVALID",
                            "SECURITY",
                            "Intento de acceso con token rechazado",
                            request.getRequestURI()
                    );
                }
            } catch (Exception e) {
                // --- CASO 2: EXCEPCIÓN (AQUÍ CAEN LOS TOKENS EXPIRADOS) ---

                String attemptedUser = "Desconocido";
                try {
                    attemptedUser = jwtUtil.getUsernameFromToken(token);
                } catch (Exception ex) {
                }

                String errorMsg = e.getMessage();
                if (errorMsg != null && errorMsg.length() > 50) errorMsg = errorMsg.substring(0, 50) + "...";

                AuditService.recordAction(
                        attemptedUser,
                        "SESSION_EXPIRED",
                        "SECURITY",
                        "Token Error: " + errorMsg,
                        request.getRequestURI()
                );
            }
        }

        chain.doFilter(request, response);
    }
}