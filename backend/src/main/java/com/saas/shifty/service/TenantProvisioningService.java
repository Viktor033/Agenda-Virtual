package com.saas.shifty.service;

import com.saas.shifty.config.tenant.TenantContext;
import com.saas.shifty.entity.Service;
import com.saas.shifty.repository.ServiceRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@org.springframework.stereotype.Service
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

        try {
            TenantContext.setCurrentTenant(tenantId);
            initializeDefaultServices(dto.getOficioId());
        } finally {
            TenantContext.clear();
        }

        return tenantId;
    }

    private void initializeDefaultServices(int oficioId) {
        if (oficioId == 1) { 
            createDefaultService("Corte de Cabello Clasico", 30, new BigDecimal("15.00"));
            createDefaultService("Afeitado y Delineado de Barba", 20, new BigDecimal("10.00"));
        } else if (oficioId == 2) { 
            createDefaultService("Consulta Diagnostica General", 30, new BigDecimal("35.00"));
            createDefaultService("Profilaxis / Limpieza Dental", 45, new BigDecimal("60.00"));
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
