package com.saas.shifty.controller;

import com.saas.shifty.config.tenant.TenantContext;
import com.saas.shifty.entity.Professional;
import com.saas.shifty.repository.ProfessionalRepository;
import com.saas.shifty.service.PlanLimitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/professionals")
@RequiredArgsConstructor
@Slf4j
public class ProfessionalController {

    private final ProfessionalRepository professionalRepository;
    private final PlanLimitService planLimitService;

    @GetMapping
    public ResponseEntity<List<Professional>> getAllProfessionals() {
        Long tenantId = TenantContext.getCurrentTenant();
        log.info("Buscando profesionales para Tenant ID: {}", tenantId);
        List<Professional> professionals = professionalRepository.findAll();
        return ResponseEntity.ok(professionals);
    }

    @PostMapping
    public ResponseEntity<Professional> createProfessional(@RequestBody Professional professional) {
        Long tenantId = TenantContext.getCurrentTenant();
        log.info("Intento de registro de profesional para Tenant ID: {}", tenantId);
        
        // Validar límite del plan antes de crear
        planLimitService.verifyProfessionalLimit(tenantId);

        professional.setStatus("active");
        Professional saved = professionalRepository.save(professional);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Professional> updateProfessional(@PathVariable Long id, @RequestBody Professional updatedProf) {
        Professional existing = professionalRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Profesional no encontrado"));

        existing.setName(updatedProf.getName());
        existing.setEmail(updatedProf.getEmail());
        existing.setPhone(updatedProf.getPhone());
        if (updatedProf.getStatus() != null) {
            existing.setStatus(updatedProf.getStatus());
        }

        Professional saved = professionalRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfessional(@PathVariable Long id) {
        Professional existing = professionalRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Profesional no encontrado"));
        
        // Eliminación lógica cambiando el estado
        existing.setStatus("inactive");
        professionalRepository.save(existing);
        return ResponseEntity.noContent().build();
    }
}
