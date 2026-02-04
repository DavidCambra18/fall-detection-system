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
            'Inactive',
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
    date_rep TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
-- Admin
INSERT INTO users (email, password_hash, name, surnames, date_born, role_id, carer_id) 
VALUES ('admin@sistema.com', '$2b$10$X7...', 'Administrador', 'Principal', '1980-01-01', 1, NULL);

-- Cuidador
INSERT INTO users (email, password_hash, name, surnames, date_born, role_id, carer_id) 
VALUES ('cuidador@familia.com', '$2b$10$Y8...', 'Laura', 'García Pérez', '1985-05-20', 2, NULL);

-- Usuario/Paciente (referencia al ID 2 del cuidador)
INSERT INTO users (email, password_hash, name, surnames, date_born, role_id, carer_id) 
VALUES ('paciente@familia.com', '$2b$10$Z9...', 'Antonio', 'García López', '1945-03-15', 3, 2);

-- 3.3 DISPOSITIVOS
INSERT INTO devices (device_id_logic, mac, alias, status, user_id) 
VALUES ('ESP32-001', 'AA:BB:CC:11:22:33', 'Dispositivo de Antonio', 'active', 3);

-- 3.4 REPORTES DE EJEMPLO
INSERT INTO reports (user_id, device_id, acc_x, acc_y, acc_z, fall_detected, date_rep) 
VALUES (3, 1, 0.02, 0.05, 9.80, FALSE, CURRENT_TIMESTAMP - INTERVAL '1 hour');

INSERT INTO reports (user_id, device_id, acc_x, acc_y, acc_z, fall_detected, date_rep) 
VALUES (3, 1, -1.23, 0.45, 9.81, TRUE, CURRENT_TIMESTAMP);