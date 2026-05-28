package com.saas.shifty.config.tenant;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class TenantFilter extends OncePerRequestFilter {

    private static final String TENANT_HEADER = "X-Tenant-ID";
    private final JdbcTemplate jdbcTemplate;

    public TenantFilter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        
        // Omitir validación de suspensión para endpoints públicos clave
        if (requestURI.startsWith("/api/v1/auth") || 
            requestURI.startsWith("/api/v1/webhooks") || 
            requestURI.startsWith("/api/v1/provision")) {
            filterChain.doFilter(request, response);
            return;
        }

        String tenantHeader = request.getHeader(TENANT_HEADER);

        if (tenantHeader != null && !tenantHeader.isBlank()) {
            try {
                Long tenantId = Long.parseLong(tenantHeader);
                
                // Consultar estado operativo del tenant
                String status = null;
                try {
                    status = jdbcTemplate.queryForObject(
                            "SELECT status FROM tenants WHERE id = ?", 
                            String.class, 
                            tenantId
                    );
                } catch (Exception e) {
                    log.warn("Intento de acceso con Tenant ID inexistente: {}", tenantId);
                }

                if ("suspended".equalsIgnoreCase(status)) {
                    log.warn("Acceso denegado. Tenant ID: {} está SUSPENDIDO.", tenantId);
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{" +
                            "\"error\": \"Suscripción Suspendida\"," +
                            "\"message\": \"El acceso a su agenda ha sido suspendido por falta de pago o expiración de su suscripción.\"" +
                            "}");
                    return;
                }

                TenantContext.setCurrentTenant(tenantId);
            } catch (NumberFormatException e) {
                log.error("Cabecera X-Tenant-ID invalida: {}", tenantHeader);
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"El encabezado X-Tenant-ID debe ser un valor numerico valido.\"}");
                return;
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
