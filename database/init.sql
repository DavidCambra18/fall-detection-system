-- 1. CREACIÓN DE ESTRUCTURAS (DDL)

-- 1. Tablas de soporte
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- 2. Tabla de Usuarios
-- Eliminamos las comillas dobles porque 'users' no es palabra reservada
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_num VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    surnames VARCHAR(150),
    date_born DATE,
    role_id INTEGER NOT NULL REFERENCES roles (id),
    carer_id INTEGER REFERENCES users (id) ON DELETE SET NULL
);

-- 3. Tabla de Dispositivos
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    device_id_logic VARCHAR(50) UNIQUE NOT NULL,
    mac VARCHAR(17) UNIQUE NOT NULL,
    alias VARCHAR(100),
    status VARCHAR(20) CHECK (
        status IN (
            'inactive',
            'active',
            'low battery'
        )
    ) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

-- 4. Tabla de Reportes
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    device_id INTEGER NOT NULL REFERENCES devices (id) ON DELETE CASCADE,
    acc_x FLOAT NOT NULL,
    acc_y FLOAT NOT NULL,
    acc_z FLOAT NOT NULL,
    fall_detected BOOLEAN DEFAULT FALSE,
    date_rep TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed BOOLEAN DEFAULT NULL
);

-- 2. OPTIMIZACIÓN E ÍNDICES

CREATE INDEX idx_reports_device_date ON reports (device_id, date_rep DESC);
CREATE INDEX idx_reports_user ON reports (user_id);
CREATE INDEX idx_reports_only_falls ON reports (id) WHERE fall_detected = TRUE;
CREATE INDEX idx_users_email ON users (email);

-- 3. CARGA DE DATOS INICIALES (DML)

-- 3.1 ROLES
INSERT INTO roles (name, description) VALUES 
('Admin', 'Gestión de usuarios y dispositivos del sistema'),
('Cuidador', 'Visualiza alertas y estado de los pacientes asignados'),
('Usuario', 'Paciente asociado a un dispositivo IoT');

-- 3.2 USUARIOS
INSERT INTO users (email, phone_num, password_hash, name, surnames, date_born, role_id, carer_id) 
VALUES 
('admin@gmail.com', '+34600111223', '$2b$10$cvxrU5dZo2sN2cxdXO09ieB3AjWuLBv.HV1SxRvvQrGFOIh/4d3nm', 'Administrador', NULL, '1980-01-01', 1, NULL),
('manolo@gmail.com', '+34600111222', '$2b$10$USC3AQnQSwky6snTRORElu76RSJXqqisaCs7j.924wtfC/INN1fRS', 'Manolo', 'García Pérez', '1985-05-20', 2, NULL),
('marta@gmail.com', '+34600111124', '$2b$10$7E8i6czm3zT2qXURJxgyMOFvfDCEOHoDk9hfhtx17QULNfDESyLEO', 'Marta', 'Rövanpera', '1945-03-15', 3, 2),
('roberto@gmail.com', '+34600111226', '$2b$10$B0Uga5i7uR6H.ubcsJYsg.7jEi9AAsmDxlrh7QAjOCJjL5AS7.o2u', 'Roberto', 'Gómez Ruiz', '1945-03-15', 3, 2),
('ana@gmail.com', '+34600111228', '$2b$10$yzE8dfVOmFzNG47U39pvSunSskcTF90TT9g2pcWLLEh1GPZX0QzYK', 'Ana', 'Sánchez Moreno', '1950-12-05', 3, 2),
('isabel@gmail.com', '+34600111339', '$2b$10$APySWBSLJwxnpIBRcygM4esNWHDSaEUqkI.MWlaVag7PS12oRRG5q', 'Isabel', 'Fon Histon', '1984-10-08', 2, NULL),
('carlos@gmail.com', '+34600114591', '$2b$10$drdFJnBIXrWmOTx8yQ1VgO6Q4VVRLS6yF7FhR5DAqDtobM17.6zoi', 'Carlos', 'Med Vades', '1956-02-19', 3, NULL);

-- 3.3 DISPOSITIVOS
INSERT INTO devices (device_id_logic, mac, alias, status, user_id)
VALUES
('ESP32-001', 'AA:BB:CC:11:22:33', 'Dispositivo de Marta', 'active', 3),
('ESP32-002', 'AA:BB:CC:11:22:34', 'Dispositivo de Roberto', 'active', 4),
('ESP32-003', 'AA:BB:CC:11:22:35', 'Dispositivo de Ana', 'low battery', 5);

-- 3.4 REPORTES DE EJEMPLO
-- 3.4 REPORTES DE EJEMPLO Y DATOS PARA PAGINACIÓN

INSERT INTO reports (user_id, device_id, acc_x, acc_y, acc_z, fall_detected, date_rep, confirmed) 
VALUES 
-- Histórico de Marta (Dispositivo 1)
(3, 1, 0.02, 0.05, 9.80, FALSE, CURRENT_TIMESTAMP - INTERVAL '3 hours', NULL),
(3, 1, -5.20, 3.40, 15.8, TRUE,  CURRENT_TIMESTAMP - INTERVAL '170 minutes', TRUE),
(3, 1, 0.01, 0.02, 9.78, FALSE, CURRENT_TIMESTAMP - INTERVAL '160 minutes', NULL),
(3, 1, -4.10, 2.40, 12.8, TRUE,  CURRENT_TIMESTAMP - INTERVAL '150 minutes', FALSE),
(3, 1, 0.03, 0.01, 9.81, FALSE, CURRENT_TIMESTAMP - INTERVAL '140 minutes', NULL),
(3, 1, 0.02, 0.02, 9.79, FALSE, CURRENT_TIMESTAMP - INTERVAL '130 minutes', NULL),
(3, 1, -6.20, 4.40, 18.8, TRUE,  CURRENT_TIMESTAMP - INTERVAL '120 minutes', TRUE),
(3, 1, 0.01, 0.01, 9.80, FALSE, CURRENT_TIMESTAMP - INTERVAL '110 minutes', NULL),
(3, 1, 0.02, 0.03, 9.82, FALSE, CURRENT_TIMESTAMP - INTERVAL '100 minutes', NULL),
(3, 1, 0.01, 0.02, 9.77, FALSE, CURRENT_TIMESTAMP - INTERVAL '90 minutes', NULL),

-- Histórico de Roberto (Dispositivo 2)
(4, 2, 0.00, 0.03, 9.79, FALSE, CURRENT_TIMESTAMP - INTERVAL '80 minutes', NULL),
(4, 2, -3.80, 2.60, 14.2, TRUE,  CURRENT_TIMESTAMP - INTERVAL '75 minutes', TRUE),
(4, 2, 0.05, 0.01, 9.80, FALSE, CURRENT_TIMESTAMP - INTERVAL '70 minutes', NULL),
(4, 2, 0.02, 0.02, 9.81, FALSE, CURRENT_TIMESTAMP - INTERVAL '65 minutes', NULL),
(4, 2, -1.20, 0.80, 10.5, TRUE,  CURRENT_TIMESTAMP - INTERVAL '60 minutes', FALSE),
(4, 2, 0.03, 0.01, 9.78, FALSE, CURRENT_TIMESTAMP - INTERVAL '55 minutes', NULL),
(4, 2, 0.01, 0.04, 9.82, FALSE, CURRENT_TIMESTAMP - INTERVAL '50 minutes', NULL),
(4, 2, 0.04, 0.02, 9.80, FALSE, CURRENT_TIMESTAMP - INTERVAL '45 minutes', NULL),
(4, 2, -5.50, 3.10, 16.3, TRUE,  CURRENT_TIMESTAMP - INTERVAL '40 minutes', NULL),
(4, 2, 0.02, 0.01, 9.79, FALSE, CURRENT_TIMESTAMP - INTERVAL '35 minutes', NULL),

-- Histórico de Ana (Dispositivo 3)
(5, 3, 0.03, 0.02, 9.78, FALSE, CURRENT_TIMESTAMP - INTERVAL '30 minutes', NULL),
(5, 3, 0.02, 0.01, 9.77, FALSE, CURRENT_TIMESTAMP - INTERVAL '28 minutes', NULL),
(5, 3, 0.01, 0.03, 9.80, FALSE, CURRENT_TIMESTAMP - INTERVAL '26 minutes', NULL),
(5, 3, -4.90, 2.90, 15.1, TRUE,  CURRENT_TIMESTAMP - INTERVAL '24 minutes', TRUE),
(5, 3, 0.02, 0.02, 9.81, FALSE, CURRENT_TIMESTAMP - INTERVAL '22 minutes', NULL),
(5, 3, 0.03, 0.04, 9.79, FALSE, CURRENT_TIMESTAMP - INTERVAL '20 minutes', NULL),
(5, 3, -0.90, 0.50, 9.90, TRUE,  CURRENT_TIMESTAMP - INTERVAL '15 minutes', FALSE),
(5, 3, 0.01, 0.01, 9.82, FALSE, CURRENT_TIMESTAMP - INTERVAL '10 minutes', NULL),
(5, 3, 0.02, 0.03, 9.80, FALSE, CURRENT_TIMESTAMP - INTERVAL '5 minutes', NULL),
(5, 3, 0.01, 0.01, 9.81, FALSE, CURRENT_TIMESTAMP, NULL);