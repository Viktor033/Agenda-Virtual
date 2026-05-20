package com.saas.shifty.entity.listener;

import com.saas.shifty.config.tenant.TenantContext;
import com.saas.shifty.entity.AbstractTenantEntity;
import jakarta.persistence.PrePersist;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class TenantEntityListener {

    @PrePersist
    public void prePersist(AbstractTenantEntity entity) {
        Long tenantId = TenantContext.getCurrentTenant();
        
        if (tenantId == null) {
            log.error("Fallo de Persistencia: Intento de guardar entidad multitenant sin X-Tenant-ID en contexto.");
            throw new IllegalStateException("Operacion no permitida: Falta establecer el contexto del Tenant.");
        }
        
        entity.setTenantId(tenantId);
        log.trace("Tenant ID {} inyectado automaticamente en la entidad", tenantId);
    }
}
