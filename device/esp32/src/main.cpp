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
    // Lectura continua del sensor
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    // Lógica del botón de alerta
    // Leemos LOW porque usamos INPUT_PULLUP (el botón conecta a GND al pulsar)
    if (digitalRead(BUTTON_PIN) == LOW) {
        unsigned long currentTime = millis();
        
        // Verificamos si ha pasado suficiente tiempo desde el último clic
        if (currentTime - lastDebounceTime > debounceDelay) {
            Serial.println("¡Botón de emergencia pulsado!");
            
            // Enviamos los datos actuales indicando que hay una "caída" (alerta manual)
            sendData(a.acceleration.x, a.acceleration.y, a.acceleration.z, true);
            
            lastDebounceTime = currentTime; 
        }
    }

    // Envio automatico de datos cada 5 segundos
    static unsigned long lastSend = 0;
    if (millis() - lastSend > 5000) {
        sendData(a.acceleration.x, a.acceleration.y, a.acceleration.z, false);
        lastSend = millis();
    }
    

    delay(100); // Frecuencia de muestreo (10Hz)
}