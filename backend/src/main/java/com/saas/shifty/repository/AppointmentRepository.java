package com.saas.shifty.repository;

import com.saas.shifty.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    // Buscar turnos activos a futuro de un paciente
    List<Appointment> findByPatientIdAndStartTimeAfterAndStatusNotOrderByStartTimeAsc(
            Long patientId, LocalDateTime startTime, String status);

    // Buscar turnos de un profesional en un rango para calcular disponibilidad
    List<Appointment> findByProfessionalIdAndStartTimeBetweenAndStatusNot(
            Long professionalId, LocalDateTime start, LocalDateTime end, String status);
            
    // Buscar turnos en general de un paciente
    List<Appointment> findByPatientIdOrderByStartTimeDesc(Long patientId);
}
