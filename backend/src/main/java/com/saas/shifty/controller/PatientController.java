package com.saas.shifty.controller;

import com.saas.shifty.config.tenant.TenantContext;
import com.saas.shifty.entity.Patient;
import com.saas.shifty.service.PatientService;
import com.saas.shifty.service.PlanLimitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {

    private final PatientService patientService;
    private final PlanLimitService planLimitService;

    public PatientController(PatientService patientService, PlanLimitService planLimitService) {
        this.patientService = patientService;
        this.planLimitService = planLimitService;
    }

    @PostMapping
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient) {
        Long tenantId = TenantContext.getCurrentTenant();
        planLimitService.verifyPatientLimit(tenantId);
        
        Patient created = patientService.createPatient(patient);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        List<Patient> patients = patientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        Patient patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }
}
