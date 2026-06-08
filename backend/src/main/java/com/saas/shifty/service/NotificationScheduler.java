package com.saas.shifty.service;

import com.saas.shifty.config.tenant.TenantContext;
import com.saas.shifty.entity.Appointment;
import com.saas.shifty.entity.Patient;
import com.saas.shifty.entity.Professional;
import com.saas.shifty.entity.Service;
import com.saas.shifty.repository.AppointmentRepository;
import com.saas.shifty.repository.PatientRepository;
import com.saas.shifty.repository.ProfessionalRepository;
import com.saas.shifty.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final ProfessionalRepository professionalRepository;
    private final ServiceRepository serviceRepository;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    /**
     * Tarea programada diaria. Se ejecuta todos los días a las 08:00 AM.
     * Busca las citas del día siguiente y envía un recordatorio automático.
     * Cron: "segundo minuto hora día-mes mes día-semana"
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void scheduleDailyAppointmentReminders() {
        log.info("⏰ [Scheduler] Iniciando tarea diaria de recordatorios de turnos...");
        
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDateTime start = tomorrow.atStartOfDay();
        LocalDateTime end = tomorrow.atTime(LocalTime.MAX);

        // Desactivamos el filtro de Hibernate temporalmente para realizar una búsqueda global (SaaS-wide)
        // y luego procesamos por cada tenant para garantizar la seguridad
        List<Appointment> tomorrowAppointments = appointmentRepository.findAll().stream()
                .filter(app -> app.getStartTime().isAfter(start) && app.getStartTime().isBefore(end) && !"cancelled".equalsIgnoreCase(app.getStatus()))
                .toList();

        log.info("⏰ [Scheduler] Encontradas {} citas para mañana ({}) en todo el SaaS.", tomorrowAppointments.size(), tomorrow);

        for (Appointment app : tomorrowAppointments) {
            triggerAsynchronousReminder(app);
        }
    }

    /**
     * Envía de forma asíncrona un recordatorio utilizando la anotación @Async.
     * Esto libera el hilo de ejecución principal inmediatamente.
     */
    @Async
    public void triggerAsynchronousReminder(Appointment appointment) {
        Long tenantId = appointment.getTenantId();
        
        try {
            // Establecer el contexto del tenant en este hilo de segundo plano
            TenantContext.setCurrentTenant(tenantId);

            // Obtener entidades relacionadas
            Patient patient = patientRepository.findById(appointment.getPatientId()).orElse(null);
            Professional professional = professionalRepository.findById(appointment.getProfessionalId()).orElse(null);
            Service service = serviceRepository.findById(appointment.getServiceId()).orElse(null);

            if (patient != null && patient.getPhone() != null) {
                String patientName = patient.getName();
                String profName = professional != null ? professional.getName() : "Especialista";
                String serviceName = service != null ? service.getName() : "Tratamiento";
                String time = appointment.getStartTime().format(TIME_FORMATTER);

                log.info("📲 [Async Notification Engine] Iniciando canal de WhatsApp para {} ({})", patientName, patient.getPhone());
                
                // Simulación del retraso de la API de WhatsApp/Meta
                Thread.sleep(1500); 

                log.info("💬 [WhatsApp Notification SENT] -> Destinatario: {} | Teléfono: {}", patientName, patient.getPhone());
                log.info("   Contenido del mensaje: \"Hola *{}*, te recordamos tu cita de *{}* mañana con *{}* a las *{} hs*. Por favor responde:\n" +
                         "   1️⃣ para Confirmar\n" +
                         "   3️⃣ para Cancelar\"", patientName, serviceName, profName, time);
            }
        } catch (InterruptedException e) {
            log.error("Error por interrupción de hilo en el motor de notificaciones asíncronas", e);
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("Error al enviar notificación asíncrona para la cita ID: " + appointment.getId(), e);
        } finally {
            TenantContext.clear();
        }
    }
}
