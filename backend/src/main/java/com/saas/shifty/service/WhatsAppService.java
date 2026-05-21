package com.saas.shifty.service;

import com.saas.shifty.config.tenant.TenantContext;
import com.saas.shifty.entity.*;
import com.saas.shifty.entity.Service;
import com.saas.shifty.repository.AppointmentRepository;
import com.saas.shifty.repository.PatientRepository;
import com.saas.shifty.repository.ProfessionalRepository;
import com.saas.shifty.repository.ServiceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@Slf4j
@Transactional
public class WhatsAppService {

    private final PatientRepository patientRepository;
    private final ServiceRepository serviceRepository;
    private final ProfessionalRepository professionalRepository;
    private final AppointmentRepository appointmentRepository;
    private final WhatsAppSessionService sessionService;

    public WhatsAppService(PatientRepository patientRepository,
                           ServiceRepository serviceRepository,
                           ProfessionalRepository professionalRepository,
                           AppointmentRepository appointmentRepository,
                           WhatsAppSessionService sessionService) {
        this.patientRepository = patientRepository;
        this.serviceRepository = serviceRepository;
        this.professionalRepository = professionalRepository;
        this.appointmentRepository = appointmentRepository;
        this.sessionService = sessionService;
    }

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("EEEE d 'de' MMMM", new java.util.Locale("es", "ES"));
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    public String processIncomingMessage(Long tenantId, String phone, String incomingMsg) {
        String sanitizedMsg = incomingMsg.trim();
        log.info("WhatsApp recibido - Tenant: {}, Teléfono: {}, Mensaje: '{}'", tenantId, phone, sanitizedMsg);

        // Establecer el contexto del inquilino para activar los filtros multitenant de Hibernate
        try {
            TenantContext.setCurrentTenant(tenantId);
            return handleBusinessLogic(tenantId, phone, sanitizedMsg);
        } catch (Exception e) {
            log.error("Error al procesar mensaje de WhatsApp para el Tenant: " + tenantId, e);
            return "Lo sentimos, ha ocurrido un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.";
        } finally {
            TenantContext.clear();
        }
    }

    private String handleBusinessLogic(Long tenantId, String phone, String incomingMsg) {
        WhatsAppSession session = sessionService.getOrCreateSession(tenantId, phone);
        Optional<Patient> optPatient = patientRepository.findByPhone(phone);

        // --- FLUJO PACIENTE NUEVO ---
        if (optPatient.isEmpty()) {
            if (session.getState() != WhatsAppSessionState.AWAITING_NAME) {
                session.setState(WhatsAppSessionState.AWAITING_NAME);
                return "¡Hola! Te damos la bienvenida a nuestro canal de **Agendamiento Virtual por WhatsApp** 🦷✨.\n\n" +
                       "Veo que es tu primera vez comunicándote con nosotros desde este número. " +
                       "¿Podrías indicarme tu **nombre y apellido** completo para poder registrarte?";
            } else {
                // Registrar paciente
                Patient newPatient = new Patient();
                newPatient.setName(incomingMsg);
                newPatient.setPhone(phone);
                newPatient.setEmail(incomingMsg.toLowerCase().replaceAll("\\s+", "") + "@whatsapp.com");
                newPatient = patientRepository.save(newPatient);

                session.setPatientId(newPatient.getId());
                session.setState(WhatsAppSessionState.MAIN_MENU);

                return String.format("¡Excelente, *%s*! Te he registrado correctamente en el sistema. 🎉\n\n" +
                       "¿En qué te puedo ayudar hoy? Escribe el número de la opción:\n" +
                       "1️⃣ *Solicitar un nuevo turno*\n" +
                       "2️⃣ *Consultar mis turnos activos*\n" +
                       "3️⃣ *Cancelar un turno*", newPatient.getName());
            }
        }

        Patient patient = optPatient.get();
        session.setPatientId(patient.getId());

        // --- MÁQUINA DE ESTADOS ---
        switch (session.getState()) {
            case WELCOME:
                session.setState(WhatsAppSessionState.MAIN_MENU);
                return String.format("¡Hola, *%s*! Bienvenido de nuevo a la agenda virtual. 👋😊\n\n" +
                       "¿En qué te puedo ayudar hoy? Escribe el número de la opción:\n" +
                       "1️⃣ *Solicitar un nuevo turno*\n" +
                       "2️⃣ *Consultar mis turnos activos*\n" +
                       "3️⃣ *Cancelar un turno*", patient.getName());

            case MAIN_MENU:
                if ("1".equals(incomingMsg)) {
                    List<Service> services = serviceRepository.findByStatus("active");
                    if (services.isEmpty()) {
                        session.setState(WhatsAppSessionState.WELCOME);
                        return "Lo sentimos, en este momento no hay servicios cargados en el catálogo. Intenta más tarde.";
                    }

                    StringBuilder sb = new StringBuilder("🦷 *Elige el tratamiento o servicio médico*\n\n");
                    for (int i = 0; i < services.size(); i++) {
                        Service s = services.get(i);
                        sb.append(String.format("[%d] *%s* (%d min) - $%s\n", i + 1, s.getName(), s.getDurationMinutes(), s.getPrice().toString()));
                    }
                    sb.append("\n_Escribe el número de la opción deseada:_");
                    session.setState(WhatsAppSessionState.SELECT_SERVICE);
                    return sb.toString();

                } else if ("2".equals(incomingMsg)) {
                    List<Appointment> appointments = appointmentRepository
                            .findByPatientIdAndStartTimeAfterAndStatusNotOrderByStartTimeAsc(
                                    patient.getId(), LocalDateTime.now(), "cancelled");

                    if (appointments.isEmpty()) {
                        session.setState(WhatsAppSessionState.WELCOME);
                        return "Actualmente no tienes ningún turno programado a futuro.\n\n" +
                               "_Escribe cualquier mensaje para volver al menú principal._";
                    }

                    StringBuilder sb = new StringBuilder("📅 *Tus Turnos Programados:*\n\n");
                    for (int i = 0; i < appointments.size(); i++) {
                        Appointment app = appointments.get(i);
                        // Buscar el nombre del servicio
                        String serviceName = serviceRepository.findById(app.getServiceId())
                                .map(Service::getName).orElse("Servicio General");
                        String profName = professionalRepository.findById(app.getProfessionalId())
                                .map(Professional::getName).orElse("Especialista");

                        sb.append(String.format("👉 *%s* con *%s*\n📆 %s a las %s hs (Estado: %s)\n\n",
                                serviceName,
                                profName,
                                app.getStartTime().format(DATE_FORMATTER),
                                app.getStartTime().format(TIME_FORMATTER),
                                app.getStatus().toUpperCase()));
                    }
                    sb.append("_Escribe cualquier mensaje para regresar al menú principal._");
                    session.setState(WhatsAppSessionState.WELCOME);
                    return sb.toString();

                } else if ("3".equals(incomingMsg)) {
                    List<Appointment> appointments = appointmentRepository
                            .findByPatientIdAndStartTimeAfterAndStatusNotOrderByStartTimeAsc(
                                    patient.getId(), LocalDateTime.now(), "cancelled");

                    if (appointments.isEmpty()) {
                        session.setState(WhatsAppSessionState.WELCOME);
                        return "No tienes turnos activos que se puedan cancelar.\n\n" +
                               "_Escribe cualquier mensaje para volver al menú principal._";
                    }

                    StringBuilder sb = new StringBuilder("❌ *Selecciona el turno que deseas CANCELAR*\n\n");
                    for (int i = 0; i < appointments.size(); i++) {
                        Appointment app = appointments.get(i);
                        String serviceName = serviceRepository.findById(app.getServiceId())
                                .map(Service::getName).orElse("Servicio");
                        sb.append(String.format("[%d] *%s* el %s a las %s hs\n",
                                i + 1,
                                serviceName,
                                app.getStartTime().format(DATE_FORMATTER),
                                app.getStartTime().format(TIME_FORMATTER)));
                    }
                    sb.append("\n_Escribe el número de la opción que deseas cancelar:_");
                    session.setState(WhatsAppSessionState.CANCEL_SELECT);
                    return sb.toString();

                } else {
                    return "Opción no válida. Por favor, escribe:\n" +
                           "1️⃣ Para solicitar turno\n" +
                           "2️⃣ Para ver tus turnos\n" +
                           "3️⃣ Para cancelar un turno";
                }

            case SELECT_SERVICE:
                try {
                    int idx = Integer.parseInt(incomingMsg) - 1;
                    List<Service> services = serviceRepository.findByStatus("active");
                    if (idx < 0 || idx >= services.size()) {
                        return "Por favor, selecciona una opción válida de la lista.";
                    }

                    Service selected = services.get(idx);
                    session.setSelectedServiceId(selected.getId());

                    // Cargar profesionales
                    List<Professional> professionals = professionalRepository.findByStatus("active");
                    if (professionals.isEmpty()) {
                        session.setState(WhatsAppSessionState.WELCOME);
                        return "No hay especialistas activos disponibles en la clínica por el momento.";
                    }

                    StringBuilder sb = new StringBuilder("👩‍⚕️ *Selecciona el profesional médico*\n\n");
                    for (int i = 0; i < professionals.size(); i++) {
                        sb.append(String.format("[%d] *%s*\n", i + 1, professionals.get(i).getName()));
                    }
                    sb.append(String.format("[%d] *Cualquiera disponible (Más veloz)*\n", professionals.size() + 1));
                    sb.append("\n_Escribe el número de tu opción:_");

                    session.setState(WhatsAppSessionState.SELECT_PROFESSIONAL);
                    return sb.toString();
                } catch (NumberFormatException e) {
                    return "Por favor, escribe solo el número correspondiente al servicio.";
                }

            case SELECT_PROFESSIONAL:
                try {
                    List<Professional> professionals = professionalRepository.findByStatus("active");
                    int val = Integer.parseInt(incomingMsg);
                    
                    Long profId = null;
                    if (val == professionals.size() + 1) {
                        // Cualquiera disponible
                        profId = -1L; // Representación de cualquiera
                    } else {
                        int idx = val - 1;
                        if (idx < 0 || idx >= professionals.size()) {
                            return "Opción fuera de rango. Selecciona un especialista válido.";
                        }
                        profId = professionals.get(idx).getId();
                    }

                    session.setSelectedProfessionalId(profId);

                    // Generar slots libres
                    List<LocalDateTime> freeSlots = calculateAvailableSlots(profId, session.getSelectedServiceId());
                    if (freeSlots.isEmpty()) {
                        session.setState(WhatsAppSessionState.WELCOME);
                        return "Lo sentimos, no encontramos turnos libres para el especialista seleccionado en los próximos 3 días. Por favor llama al consultorio.";
                    }

                    session.setAvailableSlots(freeSlots);

                    StringBuilder sb = new StringBuilder("⏰ *Selecciona un horario disponible:*\n\n");
                    for (int i = 0; i < freeSlots.size(); i++) {
                        LocalDateTime slot = freeSlots.get(i);
                        sb.append(String.format("[%d] *%s* a las *%s hs*\n",
                                i + 1,
                                slot.format(DATE_FORMATTER),
                                slot.format(TIME_FORMATTER)));
                    }
                    sb.append("\n_Escribe el número del turno que más te convenga:_");
                    session.setState(WhatsAppSessionState.SELECT_SLOT);
                    return sb.toString();
                } catch (NumberFormatException e) {
                    return "Por favor, escribe solo el número del profesional seleccionado.";
                }

            case SELECT_SLOT:
                try {
                    int idx = Integer.parseInt(incomingMsg) - 1;
                    List<LocalDateTime> slots = session.getAvailableSlots();
                    if (slots == null || idx < 0 || idx >= slots.size()) {
                        return "Selección no válida. Elige uno de los números de la lista.";
                    }

                    LocalDateTime chosenTime = slots.get(idx);

                    // Resolver profesional real en caso de que haya elegido "cualquiera disponible"
                    Long realProfId = session.getSelectedProfessionalId();
                    if (realProfId == -1L) {
                        List<Professional> professionals = professionalRepository.findByStatus("active");
                        // Asignamos al primer profesional disponible en ese horario
                        realProfId = findAvailableProfessionalForSlot(professionals, chosenTime);
                    }

                    // Guardar turno
                    Appointment app = new Appointment();
                    app.setPatientId(patient.getId());
                    app.setProfessionalId(realProfId);
                    app.setServiceId(session.getSelectedServiceId());
                    app.setStartTime(chosenTime);
                    app.setStatus("confirmed"); // Confirmado de forma directa

                    appointmentRepository.save(app);

                    // Obtener nombres para confirmación visual
                    String serviceName = serviceRepository.findById(session.getSelectedServiceId())
                            .map(Service::getName).orElse("Tratamiento");
                    String finalProfName = professionalRepository.findById(realProfId)
                            .map(Professional::getName).orElse("Especialista");

                    // Resetear estado
                    sessionService.removeSession(tenantId, phone);

                    return String.format("🎉 *¡Excelente! Tu turno ha sido agendado con éxito:*\n\n" +
                           "🏥 *Especialista:* %s\n" +
                           "💆‍♂️ *Tratamiento:* %s\n" +
                           "📆 *Día:* %s\n" +
                           "⏰ *Hora:* %s hs\n\n" +
                           "Te hemos enviado la confirmación. ¡Te esperamos! 😊\n\n" +
                           "_Escribe cualquier mensaje si necesitas volver al menú principal._",
                            finalProfName, serviceName, chosenTime.format(DATE_FORMATTER), chosenTime.format(TIME_FORMATTER));

                } catch (NumberFormatException e) {
                    return "Por favor, ingresa el número correspondiente al turno deseado.";
                }

            case CANCEL_SELECT:
                try {
                    int idx = Integer.parseInt(incomingMsg) - 1;
                    List<Appointment> appointments = appointmentRepository
                            .findByPatientIdAndStartTimeAfterAndStatusNotOrderByStartTimeAsc(
                                    patient.getId(), LocalDateTime.now(), "cancelled");

                    if (idx < 0 || idx >= appointments.size()) {
                        return "Opción inválida. Elige el número de turno correcto.";
                    }

                    Appointment targetApp = appointments.get(idx);
                    targetApp.setStatus("cancelled");
                    appointmentRepository.save(targetApp);

                    String serviceName = serviceRepository.findById(targetApp.getServiceId())
                            .map(Service::getName).orElse("Servicio");

                    sessionService.removeSession(tenantId, phone);

                    return String.format("❌ *Tu turno de %s para el %s ha sido CANCELADO con éxito.*\n\n" +
                           "Lamentamos que no puedas asistir. Escribe cualquier mensaje si deseas volver a agendar en el futuro. ¡Que tengas un buen día!",
                            serviceName, targetApp.getStartTime().format(DATE_FORMATTER));

                } catch (NumberFormatException e) {
                    return "Por favor, escribe solo el número correspondiente al turno a cancelar.";
                }

            default:
                session.setState(WhatsAppSessionState.WELCOME);
                return "Sesión restablecida. Escribe cualquier mensaje para comenzar.";
        }
    }

    /**
     * Calcula slots libres de 1 hora entre las 9:00 y las 17:00 hs para los próximos 3 días.
     */
    private List<LocalDateTime> calculateAvailableSlots(Long professionalId, Long serviceId) {
        List<LocalDateTime> slots = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Horarios fijos de atención para la demo
        LocalTime[] workingHours = {
            LocalTime.of(9, 0),
            LocalTime.of(10, 0),
            LocalTime.of(11, 0),
            LocalTime.of(12, 0),
            LocalTime.of(14, 0),
            LocalTime.of(15, 0),
            LocalTime.of(16, 0),
            LocalTime.of(17, 0)
        };

        List<Professional> targets = new ArrayList<>();
        if (professionalId == -1L) {
            targets.addAll(professionalRepository.findByStatus("active"));
        } else {
            professionalRepository.findById(professionalId).ifPresent(targets::add);
        }

        if (targets.isEmpty()) return slots;

        // Buscar para los próximos 3 días (empezando mañana)
        for (int dayOffset = 1; dayOffset <= 3; dayOffset++) {
            LocalDate date = today.plusDays(dayOffset);
            
            // Excluir domingos
            if (date.getDayOfWeek() == java.time.DayOfWeek.SUNDAY) continue;

            for (LocalTime time : workingHours) {
                LocalDateTime slotTime = LocalDateTime.of(date, time);

                // Si es "cualquiera disponible", verificamos si al menos uno está libre
                boolean available = false;
                if (professionalId == -1L) {
                    for (Professional p : targets) {
                        if (!isOverlapping(p.getId(), slotTime)) {
                            available = true;
                            break;
                        }
                    }
                } else {
                    available = !isOverlapping(professionalId, slotTime);
                }

                if (available) {
                    slots.add(slotTime);
                    // Límite de 4 slots sugeridos para no saturar el chat de WhatsApp
                    if (slots.size() >= 4) {
                        return slots;
                    }
                }
            }
        }
        return slots;
    }

    private boolean isOverlapping(Long profId, LocalDateTime slotTime) {
        // Obtenemos los turnos activos de este profesional en ese mismo día
        LocalDateTime startOfDay = slotTime.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = slotTime.toLocalDate().atTime(23, 59, 59);

        List<Appointment> apps = appointmentRepository
                .findByProfessionalIdAndStartTimeBetweenAndStatusNot(profId, startOfDay, endOfDay, "cancelled");

        for (Appointment app : apps) {
            // Asumimos colisión si coinciden en la hora exacta de inicio para simplificar
            if (app.getStartTime().getHour() == slotTime.getHour()) {
                return true;
            }
        }
        return false;
    }

    private Long findAvailableProfessionalForSlot(List<Professional> professionals, LocalDateTime slotTime) {
        for (Professional p : professionals) {
            if (!isOverlapping(p.getId(), slotTime)) {
                return p.getId();
            }
        }
        return professionals.isEmpty() ? null : professionals.get(0).getId();
    }
}
