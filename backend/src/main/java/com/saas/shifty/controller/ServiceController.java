package com.saas.shifty.controller;

import com.saas.shifty.config.tenant.TenantContext;
import com.saas.shifty.entity.Service;
import com.saas.shifty.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/services")
@RequiredArgsConstructor
@Slf4j
public class ServiceController {

    private final ServiceRepository serviceRepository;

    @GetMapping
    public ResponseEntity<List<Service>> getAllServices() {
        Long tenantId = TenantContext.getCurrentTenant();
        log.info("Buscando servicios para el Tenant ID: {}", tenantId);
        List<Service> services = serviceRepository.findAll();
        return ResponseEntity.ok(services);
    }

    @PostMapping
    public ResponseEntity<Service> createService(@RequestBody Service service) {
        service.setStatus("active");
        Service saved = serviceRepository.save(service);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Service> updateService(@PathVariable Long id, @RequestBody Service updatedService) {
        Service existing = serviceRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Servicio no encontrado"));

        existing.setName(updatedService.getName());
        existing.setDurationMinutes(updatedService.getDurationMinutes());
        existing.setPrice(updatedService.getPrice());
        if (updatedService.getStatus() != null) {
            existing.setStatus(updatedService.getStatus());
        }

        Service saved = serviceRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        Service existing = serviceRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Servicio no encontrado"));
        
        existing.setStatus("inactive");
        serviceRepository.save(existing);
        return ResponseEntity.noContent().build();
    }
}
