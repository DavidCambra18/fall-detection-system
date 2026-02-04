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
const char* serverUrl = SERVER_URL;

Adafruit_MPU6050 mpu;
sensors_event_t a, g, temp; // Globales para que el botón tenga acceso a datos frescos
String deviceId;

const int BUTTON_PIN = 4;
const float FALL_THRESHOLD = 25.0;

unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 300;
unsigned long lastSensorRead = 0;
const unsigned long SENSOR_INTERVAL = 20; 

// Variables de detección y reconexión
bool potentialFall = false;
unsigned long timeOfImpact = 0;
const unsigned long CONFIRMATION_WINDOW = 10000;

unsigned long lastWiFiCheck = 0;
const unsigned long WIFI_RETRY_INTERVAL = 5000; // Reintento cada 5 seg

// --- Funciones Auxiliares ---

String getDeviceId() {
    String id = WiFi.macAddress();
    id.replace(":", "");
    return id;
}

void checkWiFi() {
    if (WiFi.status() != WL_CONNECTED) {
        unsigned long currentMillis = millis();
        if (currentMillis - lastWiFiCheck >= WIFI_RETRY_INTERVAL) {
            lastWiFiCheck = currentMillis;
            Serial.println("WiFi desconectado. Intentando reconectar...");
            WiFi.disconnect();
            WiFi.begin(ssid, password);
        }
    }
}

void sendData(float x, float y, float z, bool fall) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");
        http.setTimeout(2000); // Evita que el ESP32 se quede colgado si el servidor no responde

        StaticJsonDocument<200> doc;
        doc["deviceId"] = deviceId;
        doc["accX"] = x;
        doc["accY"] = y;
        doc["accZ"] = z;
        doc["fallDetected"] = fall;

        String requestBody;
        serializeJson(doc, requestBody);

        int httpResponseCode = http.POST(requestBody);
        Serial.printf("Envío -> Código: %d\n", httpResponseCode);
        
        http.end();
    } else {
        Serial.println("Error: Datos no enviados (Sin WiFi)");
    }
}

// --- Setup ---

void setup() {
    Serial.begin(115200);
   
    // 2. ESPERAR A QUE EL MONITOR SERIAL ESTÉ LISTO
    // Este delay es vital para que te dé tiempo a ver los mensajes
    delay(2000); 

    Serial.println("\n--- [DEBUG] ESP32 DESPIERTO ---");
    Serial.println("Configurando WiFi...");

    

    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(true); // El ESP32 intentará reconectar automáticamente
    
    deviceId = getDeviceId();

    Serial.print("Conectando a WiFi");
    WiFi.begin(ssid, password);
    
    // Solo bloqueamos en el setup inicial. Una vez en el loop, será no bloqueante.
    unsigned long startAttempt = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
        delay(500);
        Serial.print(".");
    }

    if (!mpu.begin()) {
        Serial.println("\n¡Error MPU6050!");
        while (1) yield();
    }
    Serial.println("\nSistema listo.");
}

// --- Loop Principal ---

void loop() {
    unsigned long currentMillis = millis();

    // Gestión de WiFi (No bloqueante)
    checkWiFi();

    // 1. LECTURA DEL SENSOR (50Hz)
    if (currentMillis - lastSensorRead >= SENSOR_INTERVAL) {
        lastSensorRead = currentMillis;
        mpu.getEvent(&a, &g, &temp);

        float accelMag = sqrt(sq(a.acceleration.x) + sq(a.acceleration.y) + sq(a.acceleration.z));

        // Detección de impacto
        if (accelMag > FALL_THRESHOLD && !potentialFall) {
            Serial.println("¡Impacto detectado!");
            potentialFall = true;
            timeOfImpact = currentMillis;
        }

        // Confirmación de caída tras ventana de 10s
        if (potentialFall && (currentMillis - timeOfImpact > CONFIRMATION_WINDOW)) {
            sendData(a.acceleration.x, a.acceleration.y, a.acceleration.z, true);
            potentialFall = false;
        }

        // Telemetría normal cada 5s
        static unsigned long lastSend = 0;
        if (currentMillis - lastSend > 5000 && !potentialFall) {
             sendData(a.acceleration.x, a.acceleration.y, a.acceleration.z, false);
             lastSend = currentMillis;
        }
    }

    // 2. LECTURA DEL BOTÓN
    if (digitalRead(BUTTON_PIN) == LOW) {
        if (currentMillis - lastDebounceTime > debounceDelay) {
            if (potentialFall) {
                Serial.println("Alarma cancelada.");
                potentialFall = false;
            } else {
                Serial.println("Alerta manual enviada.");
                // Ahora 'a' tiene los últimos valores leídos en el timer de arriba
                sendData(a.acceleration.x, a.acceleration.y, a.acceleration.z, true); 
            }
            lastDebounceTime = currentMillis; 
        }
    }
}