package com.saas.shifty.service;

import com.saas.shifty.config.tenant.TenantContext;
import com.saas.shifty.entity.Service;
import com.saas.shifty.repository.ServiceRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@org.springframework.stereotype.Service
@Slf4j
public class TenantProvisioningService {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final ServiceRepository serviceRepository;

    public TenantProvisioningService(JdbcTemplate jdbcTemplate, 
                                     PasswordEncoder passwordEncoder,
                                     ServiceRepository serviceRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.serviceRepository = serviceRepository;
    }

    @Getter
    @Setter
    public static class TenantRegistrationDto {
        private String tenantName;
        private int oficioId;
        private String subdomain;
        private String adminEmail;
        private String adminPassword;
    }

    @Transactional
    public Long provisionNewTenant(TenantRegistrationDto dto) {
        
        String insertTenantSql = "INSERT INTO tenants (name, oficio_id, subdomain, status) VALUES (?, ?, ?, 'active')";
        jdbcTemplate.update(insertTenantSql, dto.getTenantName(), dto.getOficioId(), dto.getSubdomain());
        
        Long tenantId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
        if (tenantId == null) {
            throw new IllegalStateException("Error al generar el Tenant ID durante el aprovisionamiento.");
        }

        String hashedPassword = passwordEncoder.encode(dto.getAdminPassword());
        String insertUserSql = "INSERT INTO users_auth (tenant_id, email, password_hash, role, status) VALUES (?, ?, ?, 'ADMIN', 'active')";
        jdbcTemplate.update(insertUserSql, tenantId, dto.getAdminEmail(), hashedPassword);

        // Simulador de envío de correo electrónico de bienvenida
        log.info("📧 [Email Simulator] Enviando correo de bienvenida a {}...", dto.getAdminEmail());
        log.info("   ¡Estimado Cliente! Tu clínica '{}' ha sido creada con éxito en Shifty SaaS.", dto.getTenantName());
        log.info("   URL de acceso: http://{}.agenda.com:8082", dto.getSubdomain());
        log.info("   Usuario: {} | Contraseña temporal: {}", dto.getAdminEmail(), dto.getAdminPassword());

        try {
            TenantContext.setCurrentTenant(tenantId);
            initializeDefaultServices(dto.getOficioId());
            // Crear suscripción de prueba (plan TRIAL) para el tenant recién creado
            createTrialSubscription(tenantId, dto);
        } finally {
            TenantContext.clear();
        }

        return tenantId;
    }

    /** Crea una suscripción de prueba (plan TRIAL) para el tenant */
    private void createTrialSubscription(Long tenantId, TenantRegistrationDto dto) {
        // Obtener el id del usuario admin creado (el primero que pertenece al tenant)
        String insertSubSql = "INSERT INTO subscriptions (tenant_id, plan_type, status, stripe_customer_id, stripe_subscription_id, current_period_end) " +
                "VALUES (?, 'basic', 'active', NULL, NULL, NULL)";
        jdbcTemplate.update(insertSubSql, tenantId);
        log.info("[TenantProvisioning] Suscripción TRIAL creada para tenantId={}", tenantId);
    }

    private void initializeDefaultServices(int oficioId) {
        if (oficioId == 1) { 
            createDefaultService("Corte de Cabello Clasico", 30, new BigDecimal("15.00"));
            createDefaultService("Afeitado y Delineado de Barba", 20, new BigDecimal("10.00"));
        } else if (oficioId == 2) { 
            createDefaultService("Consulta Diagnostica General", 30, new BigDecimal("35.00"));
            createDefaultService("Profilaxis / Limpieza Dental", 45, new BigDecimal("60.00"));
        } else if (oficioId == 3) { 
            createDefaultService("Sesión de Terapia Individual", 50, new BigDecimal("40.00"));
            createDefaultService("Evaluación Psicológica", 60, new BigDecimal("55.00"));
        } else if (oficioId == 4) { 
            createDefaultService("Sesión de Kinesiología Motora", 45, new BigDecimal("30.00"));
            createDefaultService("Rehabilitación Física Estándar", 50, new BigDecimal("35.00"));
        } else { 
            createDefaultService("Servicio General Inicial", 60, new BigDecimal("50.00"));
        }
    }

    private void createDefaultService(String name, int duration, BigDecimal price) {
        Service service = new Service();
        service.setName(name);
        service.setDurationMinutes(duration);
        service.setPrice(price);
        service.setStatus("active");
        
        serviceRepository.save(service);
    }
}
