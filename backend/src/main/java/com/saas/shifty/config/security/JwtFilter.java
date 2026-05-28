package com.saas.shifty.config.security;

import com.saas.shifty.config.tenant.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filtro JWT que se ejecuta una vez por request.
 * Extrae el token del header Authorization, lo valida y establece
 * el contexto de seguridad de Spring + el TenantContext para Hibernate.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        if (!jwtUtil.isTokenValid(token)) {
            log.warn("Token JWT rechazado para request: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        // Extraer claims del token
        String email    = jwtUtil.extractEmail(token);
        Long tenantId   = jwtUtil.extractTenantId(token);
        String role     = jwtUtil.extractRole(token);

        // Establecer el tenant en el contexto del hilo (para Hibernate Filter)
        // Solo si no fue ya establecido por el TenantFilter de header
        if (tenantId != null && TenantContext.getCurrentTenant() == null) {
            TenantContext.setCurrentTenant(tenantId);
        }

        // Establecer autenticación en el SecurityContext si no hay una activa
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                    );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.debug("JWT autenticado - Usuario: {}, Tenant: {}, Rol: {}", email, tenantId, role);
        }

        filterChain.doFilter(request, response);
    }
}
