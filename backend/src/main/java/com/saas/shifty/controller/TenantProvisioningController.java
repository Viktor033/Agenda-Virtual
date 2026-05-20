package com.saas.shifty.controller;

import com.saas.shifty.service.TenantProvisioningService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/provision")
public class TenantProvisioningController {

    private final TenantProvisioningService provisioningService;

    public TenantProvisioningController(TenantProvisioningService provisioningService) {
        this.provisioningService = provisioningService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerTenant(@RequestBody TenantProvisioningService.TenantRegistrationDto dto) {
        Long tenantId = provisioningService.provisionNewTenant(dto);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Tenant registrado y configurado exitosamente");
        response.put("tenantId", tenantId);
        response.put("subdomain", dto.getSubdomain());
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
