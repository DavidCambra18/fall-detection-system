# 1. Arquitectura del Sistema

## 1.1 Visión general

El proyecto **fall-detection-system** implementa un sistema distribuido para la detección automática de caídas en personas mayores, combinando tecnologías IoT, backend y frontend web.

La arquitectura separa claramente:
- Captura de datos
- Procesamiento en tiempo real
- Persistencia de información
- Visualización y gestión de alertas

## 1.2 Componentes del sistema

### 1.2.1 Dispositivo IoT (ESP32)

El dispositivo IoT está basado en un ESP32 al que se conectan:
- Un acelerómetro externo
- Un botón de emergencia

El ESP32 realiza una lectura continua de los valores de aceleración y envía los datos al backend mediante HTTP.

### 1.2.2 Backend (API REST)

El backend es el núcleo del sistema y se encarga de:
- Autenticación y autorización de usuarios
- Recepción de datos enviados por el ESP32
- Procesamiento de eventos mediante Redis
- Gestión de usuarios, dispositivos y eventos de caída

### 1.2.3 Procesamiento con Redis

Redis se utiliza como sistema intermedio para:
- Recibir los datos enviados por el ESP32
- Realizar cálculos rápidos de los valores de aceleración
- Determinar si se ha producido una caída mediante un valor booleano

Solo cuando el resultado indica una caída real, el evento se almacena en la base de datos relacional.

### 1.2.4 Base de datos relacional

La base de datos relacional se utiliza para almacenar de forma persistente:
- Usuarios
- Dispositivos
- Eventos de caída confirmados

### 1.2.5 Frontend web

La aplicación web permite a los usuarios visualizar la información del sistema, adaptando las vistas y funcionalidades según el rol asignado.

## 1.3 Comunicación entre componentes

La comunicación entre los distintos componentes del sistema se realiza de la siguiente manera:

- **ESP32 → Backend**  
  Envío de lecturas del acelerómetro y eventos mediante HTTP REST en formato JSON.

- **Backend → Redis**  
  Almacenamiento temporal y procesamiento en memoria de los datos recibidos, aplicando los cálculos y umbrales necesarios para la detección de caídas.

- **Redis → Backend**  
  Retorno del resultado del procesamiento en forma de valor booleano que indica si se ha producido una caída.

- **Backend → Base de datos relacional (PostgreSQL)**  
  Almacenamiento persistente de los eventos de caída confirmados.

- **Frontend → Backend**  
  Comunicación mediante HTTP REST protegida por autenticación y control de roles para la visualización y gestión de la información.


## 1.4 Diagrama de arquitectura

📌 **Aquí se incluirá el diagrama de arquitectura del sistema**  
Archivo: `arquitectura-general.png`

## 1.5 Flujo de detección de caídas

El flujo del sistema es el siguiente:

1. Lectura continua del acelerómetro
2. Envío de datos al backend
3. Procesamiento en Redis
4. Evaluación de umbrales
5. Confirmación de caída
6. Almacenamiento del evento
7. Visualización de la alerta en el frontend

📌 **Aquí se incluirá el diagrama de flujo de detección de caídas**  
Archivo: `diagrama-flujo-deteccion.png`
