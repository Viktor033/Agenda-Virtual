-- ============================================================================
-- ARQUITECTURA DE BASE DE DATOS MULTI-TENANT LOGICA (AISLAMIENTO RIGUROSO)
-- Motor: MySQL 8.0 | Engine: InnoDB | Dominio: Clínico / Pacientes
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `agenda_multi_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `agenda_multi_db`;

-- ----------------------------------------------------------------------------
-- 1. TABLA: categories_oficios
-- Almacena las categorías globales de oficios (ej. Odontología, Medicina General).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories_oficios` (
    `id` INT AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_oficio_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 2. TABLA: tenants
-- Representa a cada clínica o consultorio dental/médico.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tenants` (
    `id` BIGINT AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `oficio_id` INT NOT NULL,
    `subdomain` VARCHAR(50) NOT NULL,
    `status` ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_tenant_subdomain` (`subdomain`),
    CONSTRAINT `fk_tenants_oficio` FOREIGN KEY (`oficio_id`) 
        REFERENCES `categories_oficios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 3. TABLA: users_auth
-- Credenciales de acceso de médicos, secretarias y administradores.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users_auth` (
    `tenant_id` BIGINT NOT NULL,
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(30) NOT NULL DEFAULT 'staff',
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`tenant_id`, `id`),
    KEY `idx_user_id` (`id`),
    UNIQUE KEY `uq_tenant_user_email` (`tenant_id`, `email`),
    CONSTRAINT `fk_users_tenant` FOREIGN KEY (`tenant_id`) 
        REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 4. TABLA: professionals
-- Médicos, Odontólogos o terapeutas que atienden a los pacientes.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `professionals` (
    `tenant_id` BIGINT NOT NULL,
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `phone` VARCHAR(30) NULL,
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    PRIMARY KEY (`tenant_id`, `id`),
    KEY `idx_professional_id` (`id`),
    KEY `idx_tenant_prof_status` (`tenant_id`, `status`),
    CONSTRAINT `fk_professionals_tenant` FOREIGN KEY (`tenant_id`) 
        REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 5. TABLA: services
-- Tratamientos o consultas médicas (duración y arancel).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `services` (
    `tenant_id` BIGINT NOT NULL,
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `duration_minutes` INT NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    PRIMARY KEY (`tenant_id`, `id`),
    KEY `idx_service_id` (`id`),
    KEY `idx_tenant_serv_status` (`tenant_id`, `status`),
    CONSTRAINT `fk_services_tenant` FOREIGN KEY (`tenant_id`) 
        REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 6. TABLA: patients
-- Padron de Pacientes de la clínica.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `patients` (
    `tenant_id` BIGINT NOT NULL,
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `phone` VARCHAR(30) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`tenant_id`, `id`),
    KEY `idx_patient_id` (`id`),
    UNIQUE KEY `uq_tenant_patient_email` (`tenant_id`, `email`),
    KEY `idx_tenant_patient_phone` (`tenant_id`, `phone`),
    CONSTRAINT `fk_patients_tenant` FOREIGN KEY (`tenant_id`) 
        REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 7. TABLA: appointments
-- Turnos/Citas médicas asignadas a pacientes.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `appointments` (
    `tenant_id` BIGINT NOT NULL,
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `professional_id` BIGINT NOT NULL,
    `patient_id` BIGINT NOT NULL, -- Relacionado con Pacientes
    `service_id` BIGINT NOT NULL,
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `status` ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`tenant_id`, `id`),
    KEY `idx_appointment_id` (`id`),
    
    CONSTRAINT `fk_appointments_professional` 
        FOREIGN KEY (`tenant_id`, `professional_id`) 
        REFERENCES `professionals` (`tenant_id`, `id`) ON DELETE CASCADE,
        
    CONSTRAINT `fk_appointments_patient` 
        FOREIGN KEY (`tenant_id`, `patient_id`) 
        REFERENCES `patients` (`tenant_id`, `id`) ON DELETE CASCADE,
        
    CONSTRAINT `fk_appointments_service` 
        FOREIGN KEY (`tenant_id`, `service_id`) 
        REFERENCES `services` (`tenant_id`, `id`) ON DELETE CASCADE,

    KEY `idx_calendar_professional` (`tenant_id`, `professional_id`, `start_time`, `end_time`),
    KEY `idx_calendar_patient` (`tenant_id`, `patient_id`, `start_time`),
    KEY `idx_calendar_status` (`tenant_id`, `status`, `start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
PARTITION BY HASH(`tenant_id`)
PARTITIONS 32;

-- ----------------------------------------------------------------------------
-- 8. TABLA: audit_logs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `tenant_id` BIGINT NOT NULL,
    `id` BIGINT AUTO_INCREMENT NOT NULL,
    `user_id` BIGINT NULL,
    `action_type` ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    `target_table` VARCHAR(50) NOT NULL,
    `target_id` BIGINT NOT NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`tenant_id`, `id`),
    KEY `idx_audit_id` (`id`),
    
    CONSTRAINT `fk_audit_tenant_user` 
        FOREIGN KEY (`tenant_id`, `user_id`) 
        REFERENCES `users_auth` (`tenant_id`, `id`) ON DELETE SET NULL,
        
    KEY `idx_tenant_target_record` (`tenant_id`, `target_table`, `target_id`),
    KEY `idx_tenant_created` (`tenant_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
PARTITION BY HASH(`tenant_id`)
PARTITIONS 32;

-- ----------------------------------------------------------------------------
-- 9. TRIGGERS
-- ----------------------------------------------------------------------------
DELIMITER $$

CREATE TRIGGER `tg_appointments_calculate_endtime_insert`
BEFORE INSERT ON `appointments`
FOR EACH ROW
BEGIN
    DECLARE v_duration INT;
    
    SELECT `duration_minutes` INTO v_duration
    FROM `services`
    WHERE `tenant_id` = NEW.`tenant_id` 
      AND `id` = NEW.`service_id`;
    
    IF v_duration IS NOT NULL THEN
        SET NEW.`end_time` = DATE_ADD(NEW.`start_time`, INTERVAL v_duration MINUTE);
    ELSE
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error de Integridad: El servicio no existe o no pertenece al Tenant.';
    END IF;
END$$

CREATE TRIGGER `tg_appointments_calculate_endtime_update`
BEFORE UPDATE ON `appointments`
FOR EACH ROW
BEGIN
    DECLARE v_duration INT;
    
    IF NEW.`service_id` <> OLD.`service_id` OR NEW.`start_time` <> OLD.`start_time` THEN
        SELECT `duration_minutes` INTO v_duration
        FROM `services`
        WHERE `tenant_id` = NEW.`tenant_id` 
          AND `id` = NEW.`service_id`;
        
        IF v_duration IS NOT NULL THEN
            SET NEW.`end_time` = DATE_ADD(NEW.`start_time`, INTERVAL v_duration MINUTE);
        ELSE
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Error de Integridad: El servicio no existe o no pertenece al Tenant.';
        END IF;
    END IF;
END$$

CREATE TRIGGER `tg_appointments_audit_update`
AFTER UPDATE ON `appointments`
FOR EACH ROW
BEGIN
    IF OLD.`status` <> NEW.`status` 
       OR OLD.`professional_id` <> NEW.`professional_id` 
       OR OLD.`start_time` <> NEW.`start_time` THEN
       
        INSERT INTO `audit_logs` (
            `tenant_id`,
            `user_id`,
            `action_type`,
            `target_table`,
            `target_id`,
            `old_values`,
            `new_values`
        ) VALUES (
            NEW.`tenant_id`,
            COALESCE(@current_user_id, NULL), 
            'UPDATE',
            'appointments',
            NEW.`id`,
            JSON_OBJECT(
                'professional_id', OLD.`professional_id`,
                'patient_id', OLD.`patient_id`,
                'service_id', OLD.`service_id`,
                'start_time', OLD.`start_time`,
                'end_time', OLD.`end_time`,
                'status', OLD.`status`
            ),
            JSON_OBJECT(
                'professional_id', NEW.`professional_id`,
                'patient_id', NEW.`patient_id`,
                'service_id', NEW.`service_id`,
                'start_time', NEW.`start_time`,
                'end_time', NEW.`end_time`,
                'status', NEW.`status`
            )
        );
    END IF;
END$$

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 10. VISTA DE SEGURIDAD (ROW LEVEL SECURITY)
-- ----------------------------------------------------------------------------
DELIMITER $$
CREATE FUNCTION IF NOT EXISTS `fn_current_tenant`() RETURNS BIGINT
    DETERMINISTIC
    NO SQL
BEGIN
    RETURN COALESCE(CAST(NULLIF(@@session.query_cache_type, '') AS UNSIGNED), @current_tenant_id, 0);
END$$
DELIMITER ;

CREATE OR REPLACE VIEW `v_secure_appointments` AS
SELECT * 
FROM `appointments`
WHERE `tenant_id` = `fn_current_tenant`();
