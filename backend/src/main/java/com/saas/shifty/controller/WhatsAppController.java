package com.saas.shifty.controller;

import com.saas.shifty.entity.WhatsAppSession;
import com.saas.shifty.entity.WhatsAppSessionState;
import com.saas.shifty.service.WhatsAppService;
import com.saas.shifty.service.WhatsAppSessionService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/whatsapp")
@CrossOrigin(origins = "*") // Permitir llamadas directas de desarrollo
public class WhatsAppController {

    private final WhatsAppService whatsAppService;
    private final WhatsAppSessionService sessionService;

    public WhatsAppController(WhatsAppService whatsAppService, WhatsAppSessionService sessionService) {
        this.whatsAppService = whatsAppService;
        this.sessionService = sessionService;
    }

    @Getter
    @Setter
    public static class MessageRequest {
        private String phone;
        private String message;
    }

    @Getter
    @Setter
    public static class SimulationResponse {
        private String botResponse;
        private WhatsAppSessionState sessionState;
        private String phone;

        public SimulationResponse(String botResponse, WhatsAppSessionState sessionState, String phone) {
            this.botResponse = botResponse;
            this.sessionState = sessionState;
            this.phone = phone;
        }
    }

    /**
     * Webhook de simulación interactiva usado por el panel del Inquilino en React.
     */
    @PostMapping("/simulate/{tenantId}")
    public ResponseEntity<SimulationResponse> simulateChat(
            @PathVariable Long tenantId,
            @RequestBody MessageRequest request) {
        
        String response = whatsAppService.processIncomingMessage(tenantId, request.getPhone(), request.getMessage());
        
        // Obtener el estado resultante tras procesar el mensaje
        WhatsAppSession session = sessionService.getOrCreateSession(tenantId, request.getPhone());
        
        SimulationResponse simResponse = new SimulationResponse(
                response, 
                session.getState(), 
                request.getPhone()
        );
        
        return ResponseEntity.ok(simResponse);
    }

    /**
     * Webhook oficial o pasarela estándar.
     */
    @PostMapping("/webhook/{tenantId}")
    public ResponseEntity<String> receiveWebhook(
            @PathVariable Long tenantId,
            @RequestBody MessageRequest request) {
        
        // Ejecuta la lógica conversacional
        whatsAppService.processIncomingMessage(tenantId, request.getPhone(), request.getMessage());
        
        // Devolvemos 200 OK inmediatamente (estándar de WhatsApp API)
        return ResponseEntity.ok("Message processed successfully");
    }
    
    /**
     * Permite reiniciar o limpiar la sesión de chat de un número de teléfono específico.
     */
    @DeleteMapping("/session/{tenantId}/{phone}")
    public ResponseEntity<String> clearSession(
            @PathVariable Long tenantId,
            @PathVariable String phone) {
        sessionService.removeSession(tenantId, phone);
        return ResponseEntity.ok("Session cleared successfully");
    }
}
