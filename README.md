# FALL DETECTION SYSTEM

Sistema inteligente de detección de caídas basado en arquitectura IoT y plataforma web full-stack.

---

## 📌 Descripción del Proyecto

**Fall Detection System** es una solución tecnológica orientada a mejorar la seguridad y autonomía de personas mayores o con movilidad reducida.

El sistema combina:

- Un **dispositivo IoT basado en ESP32** que monitoriza continuamente la aceleración.
- Un **backend con procesamiento en tiempo real**.
- Una **plataforma web** para la gestión y visualización de eventos.
- Una arquitectura de base de datos híbrida para optimizar rendimiento y persistencia.

Cuando se detecta una posible caída, el sistema procesa los datos en tiempo real y, si se confirma el evento, genera una alerta visible para cuidadores o administradores.

---

# 🏗️ Arquitectura General

El sistema se compone de cuatro capas principales:

1. **Captura de datos** (ESP32 + acelerómetro + botón de emergencia)
2. **Procesamiento en tiempo real** (Redis)
3. **Persistencia de información** (PostgreSQL)
4. **Visualización y gestión** (Frontend web)

El procesamiento intensivo se realiza en memoria mediante Redis, mientras que los eventos confirmados se almacenan de forma persistente en PostgreSQL.

---

# 📂 Estructura del Repositorio
```
fall-detection-system/
│
├── device/ # Código y esquema del ESP32
│
├── backend/ # API REST (Node.js + Express + TypeScript)
│
├── frontend/ # Aplicación web (React + Next.js + TypeScript)
│
├── docs/ # Documentación técnica y funcional
│
├── README.md
│
└── .gitignore
```
---

# 🛠️ Especificaciones Técnicas

## 1️⃣ Dispositivo IoT (ESP32)

**Hardware:**
- Placa ESP32
- Acelerómetro externo
- Botón físico de emergencia
- Sistema de señalización (LED/Buzzer)

**Funcionalidades:**
- Lectura continua de valores de aceleración.
- Evaluación preliminar de eventos sospechosos.
- Identificación única del dispositivo.
- Envío de datos al backend en formato JSON.

---

## 2️⃣ Backend (API REST)

**Tecnologías:**
- Node.js
- Express
- TypeScript
- Redis (procesamiento en memoria)
- PostgreSQL (persistencia relacional)

**Responsabilidades:**
- Autenticación y autorización basada en roles.
- Recepción de datos enviados por el ESP32.
- Procesamiento en tiempo real mediante Redis.
- Evaluación de umbrales de aceleración.
- Registro persistente de eventos confirmados.
- Gestión de Usuarios, Dispositivos y Eventos.
- Protección de endpoints mediante middleware de seguridad.

---

## 3️⃣ Frontend Web

**Tecnologías:**
- React
- Next.js
- TypeScript
- Tailwind CSS

**Funcionalidades principales:**
- Sistema de Login.
- Dashboard principal.
- Gestión de usuarios.
- Gestión de dispositivos.
- Historial de eventos.
- Visualización gráfica de datos.
- Diferenciación de vistas según rol.
- Integraciones externas (ChatGPT, Discord).

---

# 🔐 Gestión de Usuarios y Roles

El sistema implementa control de acceso basado en roles:

| Rol | Funcionalidades |
|------|----------------|
| **Administrador** | Gestión global de usuarios y dispositivos. |
| **Cuidador** | Visualización de alertas y seguimiento de usuarios asociados. |
| **Usuario** | Asociado a un dispositivo monitorizado. |

---

# 🗄️ Arquitectura de Base de Datos

El sistema utiliza una arquitectura híbrida:

- **Redis** → Procesamiento en tiempo real y cálculo de umbrales.
- **PostgreSQL** → Almacenamiento persistente y estructurado.

### Flujo de datos:

1. El ESP32 envía lecturas al backend.
2. Redis procesa los valores y determina si existe caída (`fallDetected = true/false`).
3. Solo los eventos confirmados se almacenan en PostgreSQL.
4. El frontend consulta la API y muestra la información correspondiente.

---

# 📄 Documentación

En la carpeta `/docs` se incluye:

- Diagrama de arquitectura del sistema.
- Diagrama de flujo de detección de caídas.
- Diagrama Entidad-Relación (ER).
- Manual de usuario.
- Manual técnico.
- Reparto de tareas del equipo.

La documentación ha sido elaborada siguiendo criterios profesionales de estructuración y trazabilidad.
