# 4. Manual Técnico

## 4.1 Introducción

Este documento describe el funcionamiento técnico del sistema y su arquitectura interna.

## 4.2 Hardware

- ESP32
- Acelerómetro externo
- Botón de emergencia

El dispositivo envía lecturas continuas al backend mediante HTTP.

## 4.3 Backend

### 4.3.1 Tecnologías

- Node.js
- Express
- TypeScript

### 4.3.2 Funcionalidades

- Autenticación y autorización
- Procesamiento de datos con Redis
- Persistencia en base de datos relacional
- Protección de endpoints por roles

## 4.4 Frontend

### 4.4.1 Tecnologías

- React
- Next.js
- TypeScript
- Tailwind CSS

### 4.4.2 Características

- Interfaz web responsive
- Vistas diferenciadas según rol

## 4.5 Ejecución del sistema

La ejecución del sistema se describe de forma teórica, sin incluir despliegue productivo.
