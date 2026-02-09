# 2. Modelo de Datos

## 2.1 Introducción

El sistema utiliza un modelo de datos híbrido que combina una base de datos en memoria y una base de datos relacional para optimizar el rendimiento y la persistencia de la información.

## 2.2 Redis: procesamiento en tiempo real

Redis se utiliza para procesar los datos recibidos del ESP32 debido a su alta velocidad de acceso.

Sus funciones principales son:

- Almacenamiento temporal de lecturas del acelerómetro
- Cálculo de umbrales de aceleración
- Determinación de caídas mediante un valor booleano

## 2.3 Base de datos relacional

La base de datos relacional se utiliza para el almacenamiento definitivo de los eventos de caída confirmados.

### 2.3.1 Entidades principales

- Usuario
- Dispositivo
- Evento de caída

## 2.4 Diagrama Entidad-Relación

📌 **Aquí se incluirá el diagrama ER del sistema**  
Archivo: `diagrama-er.png`
