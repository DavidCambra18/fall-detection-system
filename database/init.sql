-- 1. Tablas de soporte
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- 2. Tabla de Usuarios
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    surnames VARCHAR(150),
    date_born DATE,
    role_id INTEGER NOT NULL REFERENCES role (id),
    carer_id INTEGER REFERENCES "user" (id) ON DELETE SET NULL
);

-- 3. Tabla de Dispositivos
CREATE TABLE device (
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
    user_id INTEGER NOT NULL REFERENCES "user" (id) ON DELETE CASCADE
);

-- 4. Tabla de Reportes
CREATE TABLE report (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    device_id INTEGER NOT NULL REFERENCES device (id) ON DELETE CASCADE,
    acc_x FLOAT NOT NULL,
    acc_y FLOAT NOT NULL,
    acc_z FLOAT NOT NULL,
    fall_detected BOOLEAN DEFAULT FALSE,
    date_rep TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1. Índice para búsquedas rápidas de historial por dispositivo y fecha
CREATE INDEX idx_report_device_date ON report (device_id, date_rep DESC);

-- 2. Índice para el Cuidador
CREATE INDEX idx_report_user ON report (user_id);

-- 3. Índice Parcial para Emergencias
CREATE INDEX idx_report_only_falls ON report (id)
WHERE
    fall_detected = TRUE;

-- 4. Índice para la tabla User (Búsqueda por email en Login)
CREATE INDEX idx_user_email ON "user" (email);