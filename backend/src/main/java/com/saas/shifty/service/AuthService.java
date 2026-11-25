package com.saas.shifty.service;

import com.saas.shifty.config.security.JwtUtil;
import com.saas.shifty.entity.UserAuth;
import com.saas.shifty.repository.UserAuthRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio de autenticación. Valida credenciales y emite tokens JWT.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserAuthRepository userAuthRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JdbcTemplate jdbcTemplate;

    // DTO de entrada
    @Getter
    @Setter
    public static class LoginRequest {
        private String email;
        private String password;
        private Long tenantId; // Obligatorio para usuarios de tenant; null para super-admin
    }

    // DTO de salida
    @Getter
    public static class LoginResponse {
        private final String token;
        private final String email;
        private final String role;
        private final Long tenantId;
        private final long expiresIn;
        private final String planType;

        public LoginResponse(String token, String email, String role, Long tenantId, long expiresIn, String planType) {
            this.token = token;
            this.email = email;
            this.role = role;
            this.tenantId = tenantId;
            this.expiresIn = expiresIn;
            this.planType = planType;
        }
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        UserAuth user = findUser(request);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Contraseña incorrecta para el usuario: {}", request.getEmail());
            throw new BadCredentialsException("Credenciales inválidas.");
        }

        Long tenantId = user.getId().getTenantId();
        String role   = user.getRole();
        String token  = jwtUtil.generateToken(user.getEmail(), tenantId, role);

        String planType = "basic";
        try {
            planType = jdbcTemplate.queryForObject(
                    "SELECT plan_type FROM subscriptions WHERE tenant_id = ? AND status = 'active' LIMIT 1", 
                    String.class, 
                    tenantId
            );
            if (planType == null) planType = "basic";
        } catch (Exception e) {
            planType = "basic";
        }

        log.info("Login exitoso - Usuario: {}, Tenant: {}, Rol: {}, Plan: {}", user.getEmail(), tenantId, role, planType);

        // expiresIn en segundos para el cliente
        return new LoginResponse(token, user.getEmail(), role, tenantId, 86400L, planType);
    }

    private UserAuth findUser(LoginRequest request) {
        // Si viene tenantId, buscar dentro de ese tenant específico
        if (request.getTenantId() != null) {
            return userAuthRepository
                    .findByEmailAndId_TenantIdAndStatus(request.getEmail(), request.getTenantId(), "active")
                    .orElseThrow(() -> {
                        log.warn("Usuario no encontrado - Email: {}, Tenant: {}", request.getEmail(), request.getTenantId());
                        return new BadCredentialsException("Credenciales inválidas.");
                    });
        }

        // Sin tenantId: buscar en cualquier tenant (para super-admin o detección automática)
        return userAuthRepository
                .findByEmailAndStatus(request.getEmail(), "active")
                .orElseThrow(() -> {
                    log.warn("Usuario no encontrado - Email: {}", request.getEmail());
                    return new BadCredentialsException("Credenciales inválidas.");
                });
    }
}
