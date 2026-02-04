#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <ArduinoJson.h>

// --- Configuración ---
const char* ssid = WIFI_SSID;
const char* password = WIFI_PASSWORD;
const char* serverUrl = SERVER_URL; // Tu futura ruta

Adafruit_MPU6050 mpu;
String deviceId;

// Pines
const int BUTTON_PIN = 4; // Pin donde conectarás el botón (GPIO 4)

// Umbral de caída (ajustable)
const float FALL_THRESHOLD = 25.0; // m/s^2 (aprox 2.5G)


unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 300; // Milisegundos para ignorar rebotes

unsigned long lastSensorRead = 0;
const unsigned long SENSOR_INTERVAL = 20; // Leer cada 20ms (50Hz) - Mucho mejor para caídas

// variable de deteccion de falsa alarma
bool potentialFall = false;
unsigned long timeOfImpact = 0;
const unsigned long CONFIRMATION_WINDOW = 10000; // 10 segundos

void setup() {
    Serial.begin(115200);

    WiFi.mode(WIFI_STA); // Inicializa el driver de Wi-Fi
    
    // 1. Obtener ID único (MAC Address)
    deviceId = getDeviceId();

    // 2. Iniciar WiFi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi Conectado");

    // 3. Iniciar Sensor
    if (!mpu.begin()) {
        Serial.println("¡No se encuentra el sensor MPU6050!");
        while (1) yield();
    }
    Serial.println("MPU6050 listo.");
}

void sendData(float x, float y, float z, bool fall) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");

        // Crear el JSON
        StaticJsonDocument<200> doc;
        doc["deviceId"] = deviceId;
        doc["accX"] = x;
        doc["accY"] = y;
        doc["accZ"] = z;
        doc["fallDetected"] = fall;

        String requestBody;
        serializeJson(doc, requestBody);

        int httpResponseCode = http.POST(requestBody);
        
        Serial.print("Enviado. Respuesta: ");
        Serial.println(httpResponseCode);
        
        http.end();
    }
}

String getDeviceId() {
    String id = WiFi.macAddress();
    id.replace(":", "");
    return id;
}

void loop() {
    unsigned long currentMillis = millis();

    // 1. LECTURA DEL SENSOR (Controlada por tiempo, SIN delay)
    if (currentMillis - lastSensorRead >= SENSOR_INTERVAL) {
        lastSensorRead = currentMillis;

        sensors_event_t a, g, temp;
        mpu.getEvent(&a, &g, &temp);

        // Calcular Magnitud
        float accelMag = sqrt(sq(a.acceleration.x) + sq(a.acceleration.y) + sq(a.acceleration.z));

        // --- AQUI VA TU LÓGICA DE DETECCIÓN ---
        
        // A. Detección de impacto
        if (accelMag > FALL_THRESHOLD && !potentialFall) {
            Serial.println("¡Impacto fuerte detectado! Esperando confirmación...");
            potentialFall = true;
            timeOfImpact = currentMillis;
        }

        // B. Confirmación de caída
        if (potentialFall) {
            if (currentMillis - timeOfImpact > CONFIRMATION_WINDOW) {
                Serial.println("¡CAÍDA CONFIRMADA! Enviando alerta...");
                sendData(a.acceleration.x, a.acceleration.y, a.acceleration.z, true);
                potentialFall = false;
            }
        }

        // C. Telemetría periódica (Movi esto DENTRO del timer del sensor para usar los datos frescos)
        static unsigned long lastSend = 0;
        if (currentMillis - lastSend > 5000 && !potentialFall) {
             sendData(a.acceleration.x, a.acceleration.y, a.acceleration.z, false);
             lastSend = currentMillis;
        }
    }

    // 2. LECTURA DEL BOTÓN (Fuera del timer del sensor para máxima reactividad)
    if (digitalRead(BUTTON_PIN) == LOW) {
        if (currentMillis - lastDebounceTime > debounceDelay) {
            
            // Si hay una posible caída pendiente, el botón la CANCELA
            if (potentialFall) {
                Serial.println("Alarma cancelada por el usuario.");
                potentialFall = false;
            } 
            // Si no hay nada pendiente, es una ALERTA MANUAL
            else {
                Serial.println("¡Botón de emergencia pulsado!");
                // OJO: Aquí no tenemos los datos 'a.acceleration' actualizados porque están dentro del if de arriba.
                // Para arreglar esto rápido enviamos 0.0 o habría que hacer las variables 'a' globales.
                sendData(0, 0, 0, true); 
            }
            lastDebounceTime = currentMillis; 
        }
    }
}