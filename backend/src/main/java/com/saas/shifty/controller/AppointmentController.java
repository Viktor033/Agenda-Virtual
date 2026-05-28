package com.saas.shifty.controller;

import com.saas.shifty.config.tenant.TenantContext;
import com.saas.shifty.entity.Appointment;
import com.saas.shifty.repository.AppointmentRepository;
import com.saas.shifty.service.PlanLimitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@Slf4j
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final PlanLimitService planLimitService;

    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        Long tenantId = TenantContext.getCurrentTenant();
        log.info("Buscando citas para el Tenant ID: {}", tenantId);
        List<Appointment> appointments = appointmentRepository.findAll();
        return ResponseEntity.ok(appointments);
    }

    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        Long tenantId = TenantContext.getCurrentTenant();
        log.info("Intento de agendamiento de cita para el Tenant ID: {}", tenantId);

        // Validar límite del plan antes de crear
        planLimitService.verifyAppointmentLimit(tenantId);

        appointment.setStatus("pending");
        Appointment saved = appointmentRepository.save(appointment);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> body) {
        
        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Cita no encontrada"));

        String status = body.get("status");
        if (status != null) {
            existing.setStatus(status);
        }

        Appointment saved = appointmentRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Cita no encontrada"));
        
        // Eliminación física o cambiar estado a cancelado
        existing.setStatus("cancelled");
        appointmentRepository.save(existing);
        return ResponseEntity.noContent().build();
    }
}
