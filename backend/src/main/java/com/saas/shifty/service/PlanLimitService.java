package com.saas.shifty.service;

import com.saas.shifty.entity.Subscription;
import com.saas.shifty.exception.PlanLimitExceededException;
import com.saas.shifty.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlanLimitService {

    private final SubscriptionRepository subscriptionRepository;
    private final JdbcTemplate jdbcTemplate;

    /**
     * Valida si el cliente superó el límite de profesionales de su plan.
     */
    public void verifyProfessionalLimit(Long tenantId) {
        String planType = getPlanType(tenantId);
        
        int limit = Integer.MAX_VALUE;
        if ("basic".equalsIgnoreCase(planType) || "trial".equalsIgnoreCase(planType)) {
            limit = 1; // Límite de 1 profesional para planes basic y trial
        } else if ("standard".equalsIgnoreCase(planType)) {
            limit = 5;
        }

        String countSql = "SELECT COUNT(*) FROM professionals WHERE tenant_id = ? AND status = 'active'";
        Integer count = jdbcTemplate.queryForObject(countSql, Integer.class, tenantId);
        
        if (count != null && count >= limit) {
            log.warn("Límite de profesionales alcanzado para Tenant {}. Límite del plan '{}': {}", tenantId, planType, limit);
            throw new PlanLimitExceededException(
                "Límite de Profesionales Alcanzado",
                "Su plan actual (" + planType.toUpperCase() + ") solo permite un máximo de " + limit + " profesional(es) activo(s). Por favor actualice su plan."
            );
        }
    }

    /**
     * Valida si el cliente superó el límite de citas mensuales de su plan.
     */
    public void verifyAppointmentLimit(Long tenantId) {
        String planType = getPlanType(tenantId);
        
        int limit = Integer.MAX_VALUE;
        if ("basic".equalsIgnoreCase(planType)) {
            limit = 150;
        } else if ("trial".equalsIgnoreCase(planType)) {
            limit = 2; // Límite de 2 turnos para el plan trial
        }

        // Obtener el inicio y fin del mes actual
        LocalDate now = LocalDate.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = now.withDayOfMonth(now.lengthOfMonth()).atTime(LocalTime.MAX);

        String countSql = "SELECT COUNT(*) FROM appointments WHERE tenant_id = ? AND start_time BETWEEN ? AND ? AND status != 'cancelled'";
        Integer count = jdbcTemplate.queryForObject(countSql, Integer.class, tenantId, startOfMonth, endOfMonth);
        
        if (count != null && count >= limit) {
            log.warn("Límite de citas mensuales alcanzado para Tenant {}. Límite del plan '{}': {}", tenantId, planType, limit);
            throw new PlanLimitExceededException(
                "Límite de Citas Mensuales Alcanzado",
                "Su plan actual (" + planType.toUpperCase() + ") solo permite un máximo de " + limit + " citas al mes. Por favor actualice su plan."
            );
        }
    }

    private String getPlanType(Long tenantId) {
        // En una arquitectura Spring Data JPA filtrada por Hibernate,
        // desactivamos temporalmente el filtro para consultar la suscripción del tenant actual.
        // Como simplificación robusta, usamos JDBC directa que no está sujeta a filtros de Hibernate.
        try {
            String plan = jdbcTemplate.queryForObject(
                    "SELECT plan_type FROM subscriptions WHERE tenant_id = ? AND status = 'active' LIMIT 1", 
                    String.class, 
                    tenantId
            );
            return plan != null ? plan : "basic";
        } catch (Exception e) {
            // Si no tiene registro, opera por defecto en Plan Básico
            return "basic";
        }
    }
}
