package com.saas.shifty.controller;

import com.saas.shifty.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Endpoint de autenticación.
 *
 * POST /api/v1/auth/login
 * Body: { "email": "...", "password": "...", "tenantId": 1 }
 * Response: { "token": "...", "email": "...", "role": "...", "tenantId": 1, "expiresIn": 86400 }
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthService.LoginRequest request) {
        try {
            AuthService.LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException ex) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of(
                            "error", "No autorizado",
                            "message", "Email o contraseña incorrectos."
                    ));
        }
    }
}
