-- Seed data for Kinesiología Alcarez (Tenant ID: 1)
USE `agenda_multi_db`;

-- 1. Insert Categories
INSERT INTO `categories_oficios` (`id`, `name`, `description`) 
VALUES 
(1, 'Barbería', 'Servicios de barbería y corte masculino'),
(2, 'Medicina', 'Consultas médicas, odontología y kinesiología'),
(3, 'Veterinaria', 'Cuidado de mascotas y animales'),
(4, 'Peluquería', 'Estilismo y peluquería unisex'),
(5, 'Otro', 'Servicios generales y otros rubros')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `description` = VALUES(`description`);

-- 2. Insert Tenant
INSERT INTO `tenants` (`id`, `name`, `oficio_id`, `subdomain`, `status`)
VALUES (1, 'Kinesiología Alcarez', 2, 'alcarez', 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `oficio_id` = VALUES(`oficio_id`), `status` = VALUES(`status`);

-- 3. Insert User Auth (Optional, for admin login if needed)
-- Password hash for 'password'
INSERT INTO `users_auth` (`tenant_id`, `id`, `email`, `password_hash`, `role`, `status`)
VALUES (1, 1, 'admin@alcarez.com', '$2a$10$8.UnVuG9HHgffUDAlk8GPuK1ATmIlgMz9yBdx6J5S6u159e1Lp6aC', 'admin', 'active')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `password_hash` = VALUES(`password_hash`), `status` = VALUES(`status`);

-- 4. Insert Professional
INSERT INTO `professionals` (`tenant_id`, `id`, `name`, `email`, `phone`, `status`)
VALUES (1, 1, 'Dr. Juan Alcarez', 'juan@alcarez.com', '+54 9 11 9999-8888', 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `email` = VALUES(`email`), `phone` = VALUES(`phone`), `status` = VALUES(`status`);

-- 5. Insert Services
INSERT INTO `services` (`tenant_id`, `id`, `name`, `duration_minutes`, `price`, `status`)
VALUES 
(1, 1, 'Masaje', 45, 40.00, 'active'),
(1, 2, 'Rehabilitación', 60, 60.00, 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `duration_minutes` = VALUES(`duration_minutes`), `price` = VALUES(`price`), `status` = VALUES(`status`);

-- 6. Insert Demo Patient
INSERT INTO `patients` (`tenant_id`, `id`, `name`, `email`, `phone`)
VALUES (1, 1, 'Paciente Demo', 'paciente@demo.com', '+54 9 11 0000-1111')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `email` = VALUES(`email`), `phone` = VALUES(`phone`);

-- 7. Insert Occupied Appointments for this week (Thursday 2026-05-21 to Saturday 2026-05-23)
-- tg_appointments_calculate_endtime_insert trigger will automatically compute end_time, 
-- but we specify it in insert to comply with schema.
INSERT INTO `appointments` (`tenant_id`, `id`, `professional_id`, `patient_id`, `service_id`, `start_time`, `end_time`, `status`)
VALUES 
(1, 1, 1, 1, 2, '2026-05-22 10:00:00', '2026-05-22 11:00:00', 'confirmed'),
(1, 2, 1, 1, 1, '2026-05-22 15:00:00', '2026-05-22 15:45:00', 'confirmed'),
(1, 3, 1, 1, 2, '2026-05-23 12:00:00', '2026-05-23 13:00:00', 'confirmed')
ON DUPLICATE KEY UPDATE `start_time` = VALUES(`start_time`), `end_time` = VALUES(`end_time`), `status` = VALUES(`status`);
