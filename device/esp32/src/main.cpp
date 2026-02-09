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
const float FALL_THRESHOLD = 25.0; // Umbral de impacto (ajustar según sensibilidad deseada)
const float INCLINATION_THRESHOLD = 60.0; 

// Variables de control
unsigned long lastSensorRead = 0;
const unsigned long SENSOR_INTERVAL = 20; // Lectura cada 20ms
bool potentialFall = false;
unsigned long timeOfImpact = 0;
const unsigned long CONFIRMATION_WINDOW = 10000;

// Variables para el botón (Debounce)
unsigned long lastButtonPress = 0;
const unsigned long debounceDelay = 500; // Tiempo mínimo entre pulsaciones manuales

// --- Funciones ---

String getDeviceId() {
    String id = WiFi.macAddress();
    id.replace(":", "");
    Serial.printf("id del dispositivo: %s\n", id.c_str());
    return id;
}

// Calcula el ángulo respecto a la vertical
float calculateInclination(float x, float y, float z) {
    float totalAccel = sqrt(sq(x) + sq(y) + sq(z));
    if (totalAccel == 0) return 0;
    return acos(z / totalAccel) * RAD_TO_DEG;
}

// Test de conectividad básica al servidor
bool testConnection() {
    HTTPClient http;
    http.setTimeout(5000);
    
    // Extraer URL base desde serverUrl (eliminar el path /api/auth/telemetry)
    String baseUrl = String(serverUrl);
    int pathIndex = baseUrl.indexOf("/api/");
    if (pathIndex > 0) {
        baseUrl = baseUrl.substring(0, pathIndex);
    }
    
    Serial.print("Probando URL: ");
    Serial.println(baseUrl);
    
    http.begin(baseUrl);
    int httpCode = http.GET();
    
    Serial.print("Código HTTP recibido: ");
    Serial.println(httpCode);
    
    if (httpCode < 0) {
        Serial.print("Error HTTPClient: ");
        Serial.println(http.errorToString(httpCode));
    }
    
    http.end();
    
    return (httpCode > 0);
}

// Envía los datos al servidor
void sendData(float x, float y, float z, bool fall) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("ERROR: WiFi desconectado. No se puede enviar.");
        return;
    }

    HTTPClient http;
    
    Serial.println("\n========== ENVIANDO DATOS ==========");
    Serial.print("URL: ");
    Serial.println(serverUrl);
    Serial.print("IP Local ESP32: ");
    Serial.println(WiFi.localIP());
    Serial.printf("Caída detectada: %s\n", fall ? "SI" : "NO");
    
    // Test de conectividad primero
    Serial.print("Probando conectividad al servidor... ");
    if (testConnection()) {
        Serial.println("OK");
    } else {
        Serial.println("FALLO - No se puede alcanzar el servidor");
        Serial.println("====================================\n");
        return;
    }

    // Aumentar timeout para redes lentas
    http.setTimeout(10000); // 10 segundos
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
    
    Serial.print("Body JSON: ");
    Serial.println(requestBody);

    int httpResponseCode = http.POST(requestBody);
    
    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("✓ EXITO -> Código HTTP: %d\n", httpResponseCode);
        Serial.print("Respuesta: ");
        Serial.println(response);
    } else {
        Serial.printf("✗ ERROR -> Código: %d\n", httpResponseCode);
        Serial.printf("Descripción: %s\n", http.errorToString(httpResponseCode).c_str());
        
        // Diagnóstico adicional
        if (httpResponseCode == -1) {
            Serial.println("Diagnóstico ERROR -1:");
            Serial.println("  - Verifica que el backend esté corriendo");
            Serial.println("  - Verifica la URL en platformio.ini");
            Serial.println("  - Verifica que ambos estén en la misma red");
            Serial.println("  - Intenta hacer ping al servidor desde tu PC");
        }
    }
    
    http.end();
    Serial.println("====================================\n");
}

void setup() {
    Serial.begin(115200);
    delay(1000); 
    deviceId = getDeviceId();
    Serial.println("\n--- [INICIANDO SISTEMA] ---");
    
    // 1. Configurar botón (CRÍTICO: INPUT_PULLUP para evitar ruido)
    pinMode(BUTTON_PIN, INPUT_PULLUP);

    // 2. Iniciar I2C forzado en pines 21 y 22 (Para tu placa de 38 pines)
    Wire.begin(21, 22); 

    // 3. Iniciar Sensor
    Serial.print("Buscando MPU6050... ");
    if (!mpu.begin()) {
        Serial.println("FALLO.");
        Serial.println("Revisa cables: SDA->GPIO21, SCL->GPIO22, VCC->3V3, GND->GND");
        while (1) { delay(100); } // Bucle infinito si falla el sensor
    }
    Serial.println("OK.");
    
    // Configurar rango del acelerómetro (opcional, ayuda a la precisión)
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);

    // 4. Conectar WiFi
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    Serial.print("Conectando a WiFi");
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi Conectado.");
    Serial.print("IP del ESP32: ");
    Serial.println(WiFi.localIP());
}

void loop() {
    unsigned long currentMillis = millis();

    // --- LECTURA DE SENSOR ---
    if (currentMillis - lastSensorRead >= SENSOR_INTERVAL) {
        lastSensorRead = currentMillis;
        mpu.getEvent(&a, &g, &temp);

        float x = a.acceleration.x;
        float y = a.acceleration.y;
        float z = a.acceleration.z;
        
        float accelMag = sqrt(sq(x) + sq(y) + sq(z));
        
        // Detección de caída (Impacto + Inclinación)
        if (accelMag > FALL_THRESHOLD && !potentialFall) {
            Serial.println("¡IMPACTO DETECTADO!");
            potentialFall = true;
            timeOfImpact = currentMillis;
        }

        if (potentialFall && (currentMillis - timeOfImpact > CONFIRMATION_WINDOW)) {
            float angle = calculateInclination(x, y, z);
            if (angle > INCLINATION_THRESHOLD) {
                Serial.printf("Caída CONFIRMADA (Ángulo: %.1f). Enviando alerta...\n", angle);
                sendData(x, y, z, true);
            } else {
                Serial.println("Falsa alarma: Usuario recuperó la verticalidad.");
            }
            potentialFall = false;
        }
        
        // Telemetría periódica (cada 5 seg) si no hay emergencia
        static unsigned long lastSend = 0;
        if (currentMillis - lastSend > 5000 && !potentialFall) {
            // sendData(x, y, z, false); // Descomenta si quieres enviar datos continuos
            lastSend = currentMillis;
        }
    }

    // --- LECTURA DE BOTÓN (CORREGIDA) ---
    // Leemos el estado (LOW significa pulsado gracias al INPUT_PULLUP)
    if (digitalRead(BUTTON_PIN) == LOW) {
        // Debounce: Solo actuamos si ha pasado tiempo desde la última vez
        if (currentMillis - lastButtonPress > debounceDelay) {
            
            Serial.println(">>> BOTÓN PULSADO: Enviando Alerta Manual...");
            
            // Tomamos una lectura fresca del sensor para enviarla
            mpu.getEvent(&a, &g, &temp);
            sendData(a.acceleration.x, a.acceleration.y, a.acceleration.z, true);
            
            lastButtonPress = currentMillis;

            // BLOQUEO DE SEGURIDAD:
            // Esperamos aquí mientras el usuario siga apretando el botón.
            // Esto evita que se envíen 50 alertas seguidas.
            while(digitalRead(BUTTON_PIN) == LOW) {
                delay(50);
            }
            Serial.println(">>> Botón liberado.");
        }
    }
}