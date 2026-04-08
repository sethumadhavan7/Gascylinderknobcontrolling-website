Arduino sketch:

#include <Servo.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>

const char *ssid = "Sethur";
const char *password = "123456789";

const char *serverUrl = "https://gas-backend-0ee2.onrender.com/api/gas";

const int gasSensorPin = A0;
const int servoPin = D1;
const int relayPin = D2;

// Servo angles
#define SERVO_OPEN 20
#define SERVO_CLOSE 160

// Local gas threshold
const int LOCAL_THRESHOLD = 0;

Servo servoMotor;
bool isKnobClosed = false;

void setup() {

  Serial.begin(115200);

  Serial.print("Connecting WiFi: ");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected");
  Serial.println(WiFi.localIP());

  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, HIGH); // Fan OFF

  servoMotor.attach(servoPin);

  servoMotor.write(SERVO_OPEN); // Start OPEN
}

void loop() {

  int gasValue = analogRead(gasSensorPin);

  Serial.print("Gas Value: ");
  Serial.println(gasValue);

  // 🔴 LOCAL SAFETY CONTROL
  if (gasValue > LOCAL_THRESHOLD) {

    if (!isKnobClosed) {

      servoMotor.write(SERVO_CLOSE);
      digitalWrite(relayPin, LOW); // Fan ON
      isKnobClosed = true;

      Serial.println("⚠ LOCAL GAS ALERT → Knob CLOSED, Fan ON");
    }

  }

  if (WiFi.status() == WL_CONNECTED) {
    sendGasDataAndControl(gasValue);
  }

  delay(5000);
}

void sendGasDataAndControl(int gasValue) {

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;

  Serial.println("[HTTP] Connecting to server...");

  if (http.begin(client, serverUrl)) {

    http.addHeader("Content-Type", "application/json");

    String jsonData = "{\"gasValue\":" + String(gasValue) + "}";

    Serial.println("Sending: " + jsonData);

    int httpCode = http.POST(jsonData);

    if (httpCode > 0) {

      Serial.printf("[HTTP] Response: %d\n", httpCode);

      String payload = http.getString();

      Serial.println("Server response: " + payload);

      // Server command CLOSED
      if (payload.indexOf("\"knobStatus\":\"CLOSED\"") != -1) {

        if (!isKnobClosed) {

          servoMotor.write(SERVO_CLOSE);
          digitalWrite(relayPin, LOW);
          isKnobClosed = true;

          Serial.println("➡ Server command → CLOSED");
        }

      }

      // Server command OPEN
      else if (payload.indexOf("\"knobStatus\":\"OPEN\"") != -1) {

        // Ignore OPEN if gas still high
        if (gasValue <= LOCAL_THRESHOLD) {

          servoMotor.write(SERVO_OPEN);
          digitalWrite(relayPin, HIGH);
          isKnobClosed = false;

          Serial.println("➡ Server command → OPEN");

        } else {

          Serial.println("⚠ Ignoring server OPEN (gas still high)");
        }

      }

    }

    else {

      Serial.printf("[HTTP] Failed: %s\n", http.errorToString(httpCode).c_str());

    }

    http.end();
  }
}
