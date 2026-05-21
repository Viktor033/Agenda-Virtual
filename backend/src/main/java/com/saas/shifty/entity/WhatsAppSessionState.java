package com.saas.shifty.entity;

public enum WhatsAppSessionState {
    WELCOME,             // Estado inicial o saludo
    AWAITING_NAME,       // Esperando nombre completo de un paciente nuevo
    MAIN_MENU,           // Menú principal (1. Reservar, 2. Consultar, 3. Cancelar)
    SELECT_SERVICE,      // Esperando la selección del servicio
    SELECT_PROFESSIONAL, // Esperando la selección de especialista
    SELECT_SLOT,         // Esperando la selección del horario disponible
    CANCEL_SELECT        // Esperando la selección del turno a cancelar
}
