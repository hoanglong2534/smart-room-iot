#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// --- Cấu hình Wifi và MQTT ---
const char* ssid = "MyWifi"
const char* password = "iot@12345";
const char* mqtt_server = "10.122.181.155";
const int mqtt_port = 9999;
const char* mqtt_user = "longpxh";
const char* mqtt_pass = "longpxh@123";

const char* topic_data = "smartroom/collect-data";

#define DHTPIN 26
#define DHTTYPE DHT11

#define LED_RED     32   
#define LED_BLUE    33  
#define LED_ORANGE  27   
#define LDR_PIN     25

// Ngưỡng
#define TEMP_HIGH     24 
#define HUMID_HIGH    69.9   
#define LIGHT_DARK    1500   

DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastRead = 0;
const unsigned long INTERVAL = 2000;

void setup_wifi() {
  delay(10);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void reconnect() {
  while (!client.connected()) {
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    if (!client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      delay(5000);
    }
  }
}

void setup() {
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);
  pinMode(LED_ORANGE, OUTPUT);

  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long currentMillis = millis();
  if (currentMillis - lastRead < INTERVAL) return;
  lastRead = currentMillis;

  float temp = dht.readTemperature();
  float humi = dht.readHumidity();
  int lightValue = analogRead(LDR_PIN);

  if (isnan(temp) || isnan(humi)) {
    return;
  }

  Serial.printf(
    "do am(blue) %.1f%% | anh sang(orange): %d | nhiet do(red): %.1f°C \n",
    humi, lightValue, temp
  );


  if (temp >= TEMP_HIGH) {
    digitalWrite(LED_RED, HIGH);
  } else {
    digitalWrite(LED_RED, LOW);
  }

  if (humi >= HUMID_HIGH) {
    digitalWrite(LED_BLUE, HIGH);
  } else {
    digitalWrite(LED_BLUE, LOW);
  }

  if (lightValue > LIGHT_DARK) {
    digitalWrite(LED_ORANGE, HIGH);
  } else {
    digitalWrite(LED_ORANGE, LOW);
  }

  // --- PUB MQTT ---
  String payload = "{";
  payload += "\"temperature\":"; payload += String(temp, 1); payload += ",";
  payload += "\"humidity\":"; payload += String(humi, 1); payload += ",";
  payload += "\"light\":"; payload += String(lightValue);
  payload += "}";

  client.publish(topic_data, payload.c_str());
}
