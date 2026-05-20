package com.saas.shifty.config.tenant;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class TenantContext {

    private static final ThreadLocal<Long> CURRENT_TENANT = new ThreadLocal<>();

    public static void setCurrentTenant(Long tenantId) {
        log.trace("Estableciendo Tenant ID en el hilo actual: {}", tenantId);
        CURRENT_TENANT.set(tenantId);
    }

    public static Long getCurrentTenant() {
        return CURRENT_TENANT.get();
    }

    public static void clear() {
        log.trace("Limpiando Tenant ID del hilo actual");
        CURRENT_TENANT.remove();
    }
}
