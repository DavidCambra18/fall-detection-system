# 4. Manual Técnico

## 4.1 Introducción

El presente documento describe la arquitectura técnica, tecnologías empleadas y funcionamiento interno del sistema **fall-detection-system**.

Su finalidad es proporcionar una visión detallada del diseño técnico, facilitando el mantenimiento, evolución y comprensión del sistema.

---

## 4.2 Hardware

El sistema incorpora un dispositivo IoT basado en:

- ESP32
- Acelerómetro externo
- Botón físico de emergencia

El ESP32 realiza lecturas continuas del acelerómetro y envía los datos al backend mediante peticiones HTTP en formato JSON.

El botón de emergencia permite generar manualmente una alerta independientemente del sistema automático de detección.

---

## 4.3 Backend

### 4.3.1 Tecnologías

- Node.js
- Express
- TypeScript
- Redis (procesamiento en memoria)
- PostgreSQL (persistencia relacional)

---

### 4.3.2 Funcionalidades principales

El backend implementa:

- Sistema de autenticación y autorización basado en roles.
- Recepción de datos procedentes del ESP32.
- Procesamiento en tiempo real utilizando Redis.
- Evaluación de umbrales de aceleración.
- Registro persistente de eventos confirmados.
- API REST documentada.
- Protección de endpoints mediante middleware de control de acceso.

El diseño sigue una arquitectura desacoplada que separa claramente lógica de negocio, procesamiento en memoria y almacenamiento persistente.

---

## 4.4 Frontend

### 4.4.1 Tecnologías

- React
- Next.js
- TypeScript
- Tailwind CSS

---

### 4.4.2 Características técnicas

- Aplicación web responsive.
- Gestión de estado adaptada al rol del usuario.
- Consumo de API REST segura.
- Representación gráfica de datos y eventos.
- Integración con servicios externos (ChatGPT, Discord).

---

## 4.5 Base de datos

El sistema utiliza una arquitectura híbrida:

- Redis para procesamiento en tiempo real.
- PostgreSQL para almacenamiento persistente.

Esta separación mejora el rendimiento del sistema y garantiza integridad estructural de los datos.

---

## 4.6 Ejecución del sistema

La ejecución del sistema se describe a nivel conceptual:

1. El dispositivo IoT envía datos al backend.
2. El backend procesa la información en Redis.
3. Si se confirma una caída, se registra en PostgreSQL.
4. El frontend consulta la API y muestra la información correspondiente.

El despliegue productivo no se detalla en este documento.
