package com.saas.shifty.service;

import com.saas.shifty.entity.WhatsAppSession;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WhatsAppSessionService {

    // Almacena las sesiones en memoria: Clave combinada "tenantId_phone" -> Sesion
    private final Map<String, WhatsAppSession> sessions = new ConcurrentHashMap<>();
    private static final long SESSION_TIMEOUT_MINUTES = 30; // Expira tras 30 minutos de inactividad

    private String buildKey(Long tenantId, String phone) {
        return tenantId + "_" + phone;
    }

    public WhatsAppSession getOrCreateSession(Long tenantId, String phone) {
        String key = buildKey(tenantId, phone);
        WhatsAppSession session = sessions.get(key);

        if (session == null || isSessionExpired(session)) {
            session = new WhatsAppSession(phone);
            sessions.put(key, session);
        } else {
            session.updateInteraction();
        }

        return session;
    }

    public void removeSession(Long tenantId, String phone) {
        String key = buildKey(tenantId, phone);
        sessions.remove(key);
    }

    private boolean isSessionExpired(WhatsAppSession session) {
        return session.getLastInteractionTime()
                .plusMinutes(SESSION_TIMEOUT_MINUTES)
                .isBefore(LocalDateTime.now());
    }

    // Método opcional para limpieza masiva periódica
    public void cleanExpiredSessions() {
        sessions.entrySet().removeIf(entry -> isSessionExpired(entry.getValue()));
    }
}
