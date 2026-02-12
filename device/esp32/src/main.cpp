#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <ArduinoJson.h>

// --- TUS DATOS DEL PLATFORMIO.INI ---
// Asegúrate de que SERVER_URL en platformio.ini apunta a tu IP (ej: http://10.101.21.152:4000...)
const char* ssid = WIFI_SSID;
const char* password = WIFI_PASSWORD;
const char* serverUrl = SERVER_URL;

Adafruit_MPU6050 mpu;
sensors_event_t a, g, temp; 
String deviceId;

const int BUTTON_PIN = 4;
const float FALL_THRESHOLD = 25.0; 
const float INCLINATION_THRESHOLD = 60.0; 

// Variables de control
unsigned long lastSensorRead = 0;
const unsigned long SENSOR_INTERVAL = 20; 
bool potentialFall = false;
unsigned long timeOfImpact = 0;
const unsigned long CONFIRMATION_WINDOW = 10000; // 10 Segundos para confirmar o cancelar

// Variables para el botón (Debounce)
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

bool testConnection() {
    HTTPClient http;
    http.setTimeout(2000); // Reducido para no bloquear tanto tiempo
    String baseUrl = String(serverUrl);
    int pathIndex = baseUrl.indexOf("/api/");
    if (pathIndex > 0) baseUrl = baseUrl.substring(0, pathIndex);
    
    http.begin(baseUrl);
    int httpCode = http.GET();
    http.end();
    return (httpCode > 0);
}

void sendData(float x, float y, float z, bool fall) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("ERROR: WiFi desconectado.");
        return;
    }

    HTTPClient http;
    
    Serial.println("\n========== ENVIANDO DATOS ==========");
    Serial.printf("Estado de Caída (fallDetected): %s\n", fall ? "TRUE (PELIGRO)" : "FALSE (TODO BIEN)");

    http.setTimeout(5000); 
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["deviceId"] = deviceId;
    doc["accX"] = x;
    doc["accY"] = y;
    doc["accZ"] = z;
    doc["fallDetected"] = fall;

    String requestBody;
    serializeJson(doc, requestBody);
    Serial.println(requestBody);

    int httpResponseCode = http.POST(requestBody);
    
    if (httpResponseCode > 0) {
        Serial.printf("✓ Enviado. Código: %d\n", httpResponseCode);
    } else {
        Serial.printf("✗ Error envío: %s\n", http.errorToString(httpResponseCode).c_str());
    }
    
    http.end();
    Serial.println("====================================\n");
}

void setup() {
    Serial.begin(115200);
    delay(1000); 
    deviceId = getDeviceId();
    
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    Wire.begin(21, 22); 

    if (!mpu.begin()) {
        Serial.println("FALLO MPU6050.");
        while (1) { delay(100); } 
    }
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    Serial.print("Conectando WiFi...");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConectado.");
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
        
        // A) Detectar posible impacto inicial
        if (accelMag > FALL_THRESHOLD && !potentialFall) {
            Serial.println("\n!!! IMPACTO DETECTADO !!!");
            Serial.println("Esperando 10 segundos para confirmar...");
            Serial.println("PULSA EL BOTÓN PARA CANCELAR LA ALERTA.");
            potentialFall = true;
            timeOfImpact = currentMillis;
        }

        // B) Confirmación automática tras 10 segundos (si no se canceló antes)
        if (potentialFall && (currentMillis - timeOfImpact > CONFIRMATION_WINDOW)) {
            float angle = calculateInclination(x, y, z);
            if (angle > INCLINATION_THRESHOLD) {
                Serial.printf("TIEMPO AGOTADO -> Caída CONFIRMADA (Ángulo: %.1f). Enviando alerta...\n", angle);
                sendData(x, y, z, true); // Envia TRUE
            } else {
                Serial.println("Falsa alarma: El usuario se levantó (ángulo normal).");
            }
            potentialFall = false; // Resetear estado
        }
    }

    // 2. Lógica del Botón (MODIFICADA)
    if (digitalRead(BUTTON_PIN) == LOW) {
        if (currentMillis - lastButtonPress > debounceDelay) {
            
            // Actualizamos lectura para enviar datos frescos
            mpu.getEvent(&a, &g, &temp);
            lastButtonPress = currentMillis;

            // --- AQUÍ ESTÁ EL CAMBIO PRINCIPAL ---
            if (potentialFall) {
                // ESCENARIO 1: Hay una caída pendiente -> El botón significa "ESTOY BIEN"
                Serial.println("\n>>> BOTÓN PULSADO: CANCELANDO ALARMA DE CAÍDA <<<");
                potentialFall = false; // Cancelamos la espera de los 10 segundos
                
                // Enviamos fallDetected = false como pediste
                sendData(a.acceleration.x, a.acceleration.y, a.acceleration.z, false);
                
            } else {
                // ESCENARIO 2: Todo estaba normal -> El botón significa "AYUDA MANUAL"
                Serial.println("\n>>> BOTÓN PULSADO: ALERTA MANUAL <<<");
                
                // Enviamos fallDetected = true
                sendData(a.acceleration.x, a.acceleration.y, a.acceleration.z, true);
            }

            // Evitar rebotes mientras se mantiene pulsado
            while(digitalRead(BUTTON_PIN) == LOW) { delay(50); }
        }
    }
}