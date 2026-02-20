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

WiFiClientSecure secureClient;
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
return "ESP32-004";
}

float calculateInclination(float x, float y, float z) {
    float totalAccel = sqrt(sq(x) + sq(y) + sq(z));
    if (totalAccel == 0) return 0;
    return acos(z / totalAccel) * RAD_TO_DEG;
}

void sendData(float x, float y, float z, bool fall) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi perdido. Reconectando...");
        WiFi.disconnect();
        WiFi.begin(ssid, password);
        
        int wait = 0;
        while (WiFi.status() != WL_CONNECTED && wait < 20) {
            delay(500);
            Serial.print(".");
            wait++;
        }
        
        if (WiFi.status() != WL_CONNECTED) {
            Serial.println("\nERROR: No se pudo restablecer el WiFi.");
            return; 
        }
        Serial.println("\n✓ WiFi restablecido.");
    }

    // 1. Limpiar cualquier conexión fantasma antes de empezar
    secureClient.stop(); // <--- AÑADIR ESTO
    secureClient.setInsecure();
    
    HTTPClient http;
    // 2. CRÍTICO: Render no se lleva bien con la reutilización de sesiones
    http.setReuse(false); // <--- CAMBIAR A FALSE

    Serial.println("\n========== ENVIANDO DATOS ==========");
    Serial.printf("URL: %s\n", serverUrl);
    Serial.printf("Device ID: %s\n", deviceId.c_str());
    Serial.printf("Estado de Caída: %s\n", fall ? "TRUE (PELIGRO)" : "FALSE (TODO BIEN)");

    if (!http.begin(secureClient, serverUrl)) {
        Serial.println("ERROR: No se pudo iniciar conexión HTTP");
        return;
    }

    http.setTimeout(50000); 
    http.addHeader("Content-Type", "application/json");
    http.addHeader("User-Agent", "ESP32-FallDetector/1.0");

    StaticJsonDocument<256> doc;
    doc["deviceId"] = deviceId;
    doc["accX"] = x;
    doc["accY"] = y;
    doc["accZ"] = z;
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
    
    // 3. Liberar la memoria SSL inmediatamente después de usarla
    secureClient.stop(); // <--- AÑADIR ESTO AL FINAL
    Serial.println("====================================\n");
}

void setup() {
    Serial.begin(115200);
    delay(2000); // Esperar más tiempo para estabilización
    
    Serial.println("\n\n=== INICIANDO SISTEMA DE DETECCIÓN DE CAÍDAS ===");
    
    deviceId = getDeviceId();
    Serial.printf("Device ID: %s\n", deviceId.c_str());
    
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    
    Serial.println("Inicializando I2C...");
    Wire.begin(21, 22); // SDA=21, SCL=22
    Wire.setClock(400000); // 400kHz
    delay(100); // Tiempo para estabilizar

    Serial.println("Buscando MPU6050...");
    if (!mpu.begin(0x68, &Wire)) { // Dirección I2C explícita 0x68
        Serial.println("FALLO MPU6050. Verifica conexiones:");
        Serial.println("  - VCC → 3.3V");
        Serial.println("  - GND → GND");
        Serial.println("  - SDA → GPIO 21");
        Serial.println("  - SCL → GPIO 22");
        Serial.println("\nBuscando dispositivos I2C...");
        
        // Escaneo I2C
        byte count = 0;
        for (byte i = 1; i < 127; i++) {
            Wire.beginTransmission(i);
            if (Wire.endTransmission() == 0) {
                Serial.printf("Dispositivo encontrado en 0x%02X\n", i);
                count++;
            }
        }
        if (count == 0) {
            Serial.println("No se encontró ningún dispositivo I2C.");
        }
        while (1) { delay(100); }
    }
    Serial.println("✓ MPU6050 inicializado");
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);

    WiFi.mode(WIFI_STA);
    
    // Configura DNS manuales (Google y Cloudflare) para evitar el error "DNS Failed"
    IPAddress dns1(8, 8, 8, 8);
    IPAddress dns2(1, 1, 1, 1);
    WiFi.config(INADDR_NONE, INADDR_NONE, INADDR_NONE, dns1, dns2);

    WiFi.begin(ssid, password);
    WiFi.setSleep(false); // <--- AÑADE ESTA LÍNEA
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