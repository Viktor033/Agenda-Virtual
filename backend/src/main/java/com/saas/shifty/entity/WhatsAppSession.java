package com.saas.shifty.entity;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WhatsAppSession {
    private String phone;
    private WhatsAppSessionState state = WhatsAppSessionState.WELCOME;
    private Long patientId;
    private Long selectedServiceId;
    private Long selectedProfessionalId;
    private List<LocalDateTime> availableSlots;
    private LocalDateTime lastInteractionTime = LocalDateTime.now();

    public WhatsAppSession(String phone) {
        this.phone = phone;
        this.state = WhatsAppSessionState.WELCOME;
        this.lastInteractionTime = LocalDateTime.now();
    }

    public void updateInteraction() {
        this.lastInteractionTime = LocalDateTime.now();
    }
}
