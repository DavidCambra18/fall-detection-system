# **FALL DETECTION SYSTEM**

## Descripción del proyecto
Este proyecto consiste en el diseño y desarrollo de un sistema asistencial integral para mejorar la seguridad y autonomía de personas mayores o con movilidad reducida. El sistema detecta caídas mediante un dispositivo IoT y centraliza la información en una plataforma web para que cuidadores y administradores puedan actuar ante emergencias.


## 📂 Estructura del Repositorio

```text
fall-detection-system/
│
├── device/
│
├── backend/
│
├── frontend/
│
├── docs/
│
├── README.md
│
└── .gitignore
```

## 🛠️ Especificaciones Técnicas

### 1. Dispositivo IoT (ESP32)
* **Hardware**: Placa ESP32, sensor acelerómetro, inclinómetro, LED/Buzzer y pulsador de emergencia.
* **Funcionalidades**: Lectura continua del sensor, detección de evento sospechoso de caída e identificación del dispositivo (ID o MAC).
* **Comunicación**: Envío de datos al backend vía HTTP REST o MQTT.

### 2. Backend (API REST)
* **Tecnologías**: Node.js + Express + TypeScript.
* **Funcionalidades principales**:
    * **Autenticación y autorización**.
    * **Recepción de datos** enviados por el ESP32.
    * **Gestión integral de**: Usuarios, Dispositivos y Eventos de caída.
    * **API REST documentada**.
* **Seguridad**: Login protegido, endpoints restringidos por roles y validación de datos.
* **Base de datos**: Uso de una base de datos relacional.

### 3. Frontend Web
* **Tecnologías**: React con diseño responsive.
* **Funcionalidades principales** :
    * **Login**.
    * **Panel principal (Dashboard)**.
    * **Listado de dispositivos**.
    * **Historial de eventos**.
    * **Alertas de caídas**.
    * **Gráficas (opcional)**.
    * **Diferente vista según rol**.

## 🔑 Gestión de Usuarios y Roles
| Rol | Funcionalidades |
| :--- | :--- |
| **Admin** | Gestión de usuarios y dispositivos. |
| **Cuidador** | Visualiza alertas y estado. |
| **Usuario** | Asociado a un dispositivo. |

## 📄 Documentación Adicional
En la carpeta `/docs` se encuentran disponibles los siguientes entregables:
* Diagrama de arquitectura y de flujo de detección.
* Diagrama Entidad-Relación (ER).
* Manual de usuario y manual técnico.
* Reparto de tareas del grupo.


## 🛠️ Configuración de la Base de Datos en local

El sistema utiliza una arquitectura híbrida con **PostgreSQL 15** (persistencia) y **Redis 7** (tiempo real).

### Pre-requisitos
* Docker y Docker Compose instalados.

### Despliegue
**Configurar variables de entorno:**
   Copia el archivo de plantilla y edita las credenciales si es necesario

### Acceder a las bases de datos
**Comando para acceder a la base de datos SQL en docker**
docker exec -it {nombre_contenedor} psql -U {nombre_usuario} -d {nombre_bd}

**Comando para acceder a la base de datos Redis en docker**
sudo docker exec -it {nombre_bd} redis-cli

### Interactuar con la base de datos
**Guía de comandos básicos para interactuar con la base de datos**
| Acción               | PostgreSQL (Relacional)    | Redis (Clave-Valor)  |
|----------------------|----------------------------|----------------------|
| Listar contenido     | \dt (Tablas)               | KEYS *               |
| Ver datos            | SELECT * FROM users;       | GET nombre_llave     |
| Insertar             | INSERT INTO users ...      | SET llave valor      |
| Borrar todo          | DROP TABLE users;          | FLUSHALL             |
| Salir                | \q                         | exit                 |