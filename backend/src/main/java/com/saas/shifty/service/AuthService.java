package com.saas.shifty.service;

import com.saas.shifty.config.security.JwtUtil;
import com.saas.shifty.entity.UserAuth;
import com.saas.shifty.repository.UserAuthRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
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

        public LoginResponse(String token, String email, String role, Long tenantId, long expiresIn) {
            this.token = token;
            this.email = email;
            this.role = role;
            this.tenantId = tenantId;
            this.expiresIn = expiresIn;
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

        log.info("Login exitoso - Usuario: {}, Tenant: {}, Rol: {}", user.getEmail(), tenantId, role);

        // expiresIn en segundos para el cliente
        return new LoginResponse(token, user.getEmail(), role, tenantId, 86400L);
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
