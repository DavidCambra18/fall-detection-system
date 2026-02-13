#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <ArduinoJson.h>

// --- TUS DATOS DEL PLATFORMIO.INI ---
const char* ssid = WIFI_SSID;
const char* password = WIFI_PASSWORD;
const char* serverUrl = SERVER_URL;

Adafruit_MPU6050 mpu;
sensors_event_t a, g, temp; 
String deviceId;

const int BUTTON_PIN = 4;
const float FALL_THRESHOLD = 25.0; 
const float INCLINATION_THRESHOLD = 60.0; 

unsigned long lastSensorRead = 0;
const unsigned long SENSOR_INTERVAL = 20; 
bool potentialFall = false;
unsigned long timeOfImpact = 0;
const unsigned long CONFIRMATION_WINDOW = 10000;

unsigned long lastButtonPress = 0;
const unsigned long debounceDelay = 500; 

// --- Funciones ---

String getDeviceId() {
    String id = WiFi.macAddress();
    id.replace(":", "");
    return id;
}

float calculateInclination(float x, float y, float z) {
    float totalAccel = sqrt(sq(x) + sq(y) + sq(z));
    if (totalAccel == 0) return 0;
    return acos(z / totalAccel) * RAD_TO_DEG;
}

void sendData(float x, float y, float z, bool fall) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("ERROR: WiFi desconectado.");
        return;
    }

    WiFiClientSecure *client = new WiFiClientSecure;
    
    if(!client) {
        Serial.println("Error: No se pudo crear cliente HTTPS");
        return;
    }

    // CRÍTICO: Deshabilitar verificación SSL para Vercel
    client->setInsecure();
    
    HTTPClient http;
    
    Serial.println("\n========== ENVIANDO DATOS ==========");
    Serial.printf("URL: %s\n", serverUrl);
    Serial.printf("Device ID: %s\n", deviceId.c_str());
    Serial.printf("Estado de Caída (fallDetected): %s\n", fall ? "TRUE (PELIGRO)" : "FALSE (TODO BIEN)");

    // IMPORTANTE: Usar el cliente seguro con begin()
    if (!http.begin(*client, serverUrl)) {
        Serial.println("ERROR: No se pudo iniciar conexión HTTP");
        delete client;
        return;
    }

    http.setTimeout(10000); // 10 segundos de timeout
    http.addHeader("Content-Type", "application/json");
    http.addHeader("User-Agent", "ESP32-FallDetector/1.0");

    // Crear JSON
    StaticJsonDocument<256> doc;
    doc["deviceId"] = deviceId;
    doc["accX"] = serialized(String(x, 2)); // Limitar decimales
    doc["accY"] = serialized(String(y, 2));
    doc["accZ"] = serialized(String(z, 2));
    doc["fallDetected"] = fall;

    String requestBody;
    serializeJson(doc, requestBody);
    
    Serial.println("JSON enviado:");
    Serial.println(requestBody);

    int httpResponseCode = http.POST(requestBody);
    
    if (httpResponseCode > 0) {
        Serial.printf("✓ Código respuesta: %d\n", httpResponseCode);
        String response = http.getString();
        Serial.println("Respuesta servidor:");
        Serial.println(response);
    } else {
        Serial.printf("✗ Error HTTP: %d\n", httpResponseCode);
        Serial.printf("Detalle: %s\n", http.errorToString(httpResponseCode).c_str());
    }
    
    http.end();
    delete client;
    Serial.println("====================================\n");
}

void setup() {
    Serial.begin(115200);
    delay(2000); // Esperar más tiempo para estabilización
    
    Serial.println("\n\n=== INICIANDO SISTEMA DE DETECCIÓN DE CAÍDAS ===");
    
    deviceId = getDeviceId();
    Serial.printf("Device ID: %s\n", deviceId.c_str());
    
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    Wire.begin(21, 22); 

    Serial.println("Inicializando MPU6050...");
    if (!mpu.begin()) {
        Serial.println("FALLO MPU6050.");
        while (1) { delay(100); } 
    }
    Serial.println("✓ MPU6050 inicializado");
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    Serial.print("Conectando WiFi");
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n✓ WiFi conectado");
        Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
        Serial.printf("RSSI: %d dBm\n", WiFi.RSSI());
        Serial.printf("URL servidor: %s\n", serverUrl);
    } else {
        Serial.println("\n✗ ERROR: No se pudo conectar al WiFi");
    }
    
    Serial.println("=== SISTEMA LISTO ===\n");
}

void loop() {
    unsigned long currentMillis = millis();

    // 1. Lectura del Sensor
    if (currentMillis - lastSensorRead >= SENSOR_INTERVAL) {
        lastSensorRead = currentMillis;
        mpu.getEvent(&a, &g, &temp);

        float x = a.acceleration.x;
        float y = a.acceleration.y;
        float z = a.acceleration.z;
        float accelMag = sqrt(sq(x) + sq(y) + sq(z));
        
        if (accelMag > FALL_THRESHOLD && !potentialFall) {
            Serial.println("\n!!! IMPACTO DETECTADO !!!");
            Serial.println("Esperando 10 segundos para confirmar...");
            Serial.println("PULSA EL BOTÓN PARA CANCELAR LA ALERTA.");
            potentialFall = true;
            timeOfImpact = currentMillis;
        }

        if (potentialFall && (currentMillis - timeOfImpact > CONFIRMATION_WINDOW)) {
            float angle = calculateInclination(x, y, z);
            if (angle > INCLINATION_THRESHOLD) {
                Serial.printf("TIEMPO AGOTADO -> Caída CONFIRMADA (Ángulo: %.1f). Enviando alerta...\n", angle);
                sendData(x, y, z, true);
            } else {
                Serial.println("Falsa alarma: El usuario se levantó (ángulo normal).");
            }
            potentialFall = false;
        }
    }

    // 2. Lógica del Botón
    if (digitalRead(BUTTON_PIN) == LOW) {
        if (currentMillis - lastButtonPress > debounceDelay) {
            mpu.getEvent(&a, &g, &temp);
            lastButtonPress = currentMillis;

            if (potentialFall) {
                Serial.println("\n>>> BOTÓN PULSADO: CANCELANDO ALARMA DE CAÍDA <<<");
                potentialFall = false;
                sendData(a.acceleration.x, a.acceleration.y, a.acceleration.z, false);
            } else {
                Serial.println("\n>>> BOTÓN PULSADO: ALERTA MANUAL <<<");
                sendData(a.acceleration.x, a.acceleration.y, a.acceleration.z, true);
            }

            while(digitalRead(BUTTON_PIN) == LOW) { delay(50); }
        }
    }
}