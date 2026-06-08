package com.saas.shifty.service;

import com.saas.shifty.entity.Subscription;
import com.saas.shifty.config.tenant.TenantContext;
import com.saas.shifty.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Módulo de prueba que se ejecuta al iniciar la aplicación.
 * Inserta una suscripción de prueba con el plan "TRIAL" (cero pesos) si no existe previamente.
 * Este módulo permite validar los límites (1 profesional, 2 turnos) definidos para el plan trial.
 */
@Component
@RequiredArgsConstructor
public class TestDataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(TestDataInitializer.class);

    private final SubscriptionRepository subscriptionRepository;

    @Override
    public void run(String... args) throws Exception {
        // Identificador de tenant de prueba (puede ser cualquier número, aquí usamos 1L)
        Long tenantId = 1L;
        // Establecer el contexto del tenant antes de persistir
        TenantContext.setCurrentTenant(tenantId);
        String testCustomerId = "test_customer_trial";
        String testSubscriptionId = "test_subscription_trial";

        // Verificar si ya existe una suscripción de prueba para evitar duplicados
        boolean exists = subscriptionRepository.findByStripeCustomerId(testCustomerId)
                .isPresent();
        if (exists) {
            logger.info("[TestDataInitializer] Suscripción de prueba ya existe, se omite la creación.");
            return;
        }

        Subscription trialSubscription = new Subscription();
        trialSubscription.setTenantId(tenantId);
        trialSubscription.setStripeCustomerId(testCustomerId);
        trialSubscription.setStripeSubscriptionId(testSubscriptionId);
        trialSubscription.setPlanType("trial"); // Plan de prueba, cero costo
        trialSubscription.setStatus("active");
        trialSubscription.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));

        subscriptionRepository.save(trialSubscription);
        logger.info("[TestDataInitializer] Suscripción de prueba creada (plan TRIAL, 0 pesos). TenantId={}, CustomerId={}, SubscriptionId={}",
                tenantId, testCustomerId, testSubscriptionId);
        // Limpiar el contexto del tenant después de la operación
        TenantContext.clear();
    }
}
