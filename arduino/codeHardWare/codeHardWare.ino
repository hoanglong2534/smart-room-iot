#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// --- Cấu hình Wifi và MQTT ---
const char* ssid = "MyWifi";
const char* password = "iot@12345";
const char* mqtt_server = "10.122.181.155";
const int mqtt_port = 9999;
const char* mqtt_user = "longpxh";
const char* mqtt_pass = "longpxh@123";

const char* topic_data = "smartroom/collect-data";
const char* topic_control = "smartroom/control/device/+";
const char* topic_status_prefix = "smartroom/status/device/";

#define DHTPIN 26
#define DHTTYPE DHT11

#define LED_RED     32   
#define LED_BLUE    33  
#define LED_ORANGE  27   
#define LDR_PIN     34                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    

// Ngưỡng
#define TEMP_HIGH     24 
#define HUMID_HIGH    69.9   
#define LIGHT_DARK    700   

DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastRead = 0;
const unsigned long INTERVAL = 2000;

// Trạng thái tự động
bool wasHot = false;
bool wasHumid = false;
bool wasDark = false;

void setup_wifi() {
  delay(10);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String messageTemp;
  for (int i = 0; i < length; i++) {
    messageTemp += (char)payload[i];
  }

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, messageTemp);
  if (error) return;

  String deviceId = doc["deviceId"].as<String>();
  String action = doc["action"].as<String>();

  int pin = -1;
  if (deviceId == "fan" || deviceId == "1") {
    pin = LED_RED;
  }
  else if (deviceId == "light" || deviceId == "2") {
    pin = LED_ORANGE;
  }
  else if (deviceId == "humidifier" || deviceId == "3") {
    pin = LED_BLUE;
  }
  
  if (pin == -1) return;

  if (action == "ON") digitalWrite(pin, HIGH);
  else if (action == "OFF") digitalWrite(pin, LOW);
  else return;

  String statusTopic = String(topic_status_prefix) + deviceId;
  String statusPayload = "{\"deviceId\":\"" + deviceId + "\", \"status\":\"" + action + "\"}";
  client.publish(statusTopic.c_str(), statusPayload.c_str());
}

void reconnect() {
  while (!client.connected()) {
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      client.subscribe(topic_control);
    } else {
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("ESP32 STARTING...");

  pinMode(LED_RED, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);
  pinMode(LED_ORANGE, OUTPUT);

  dht.begin();

  setup_wifi();
  Serial.println("WiFi connected");

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback); 
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
  int lightValue = 4095 - analogRead(LDR_PIN);

  if (isnan(temp) || isnan(humi)) {
    return;
  }

  Serial.printf(
    "do am(blue) %.1f%% | anh sang(orange): %d | nhiet do(red): %.1f°C \n",
    humi, lightValue, temp
  );


  if (temp >= TEMP_HIGH && !wasHot) {
    digitalWrite(LED_RED, HIGH);
    wasHot = true; 
  } else if (temp < TEMP_HIGH && wasHot) {
    digitalWrite(LED_RED, LOW);
    wasHot = false; 
  }

  if (humi >= HUMID_HIGH && !wasHumid) {
    digitalWrite(LED_BLUE, HIGH);
    wasHumid = true;
  } else if (humi < HUMID_HIGH && wasHumid) {
    digitalWrite(LED_BLUE, LOW);
    wasHumid = false;
  }

  if (lightValue < LIGHT_DARK && !wasDark) {
    digitalWrite(LED_ORANGE, HIGH);
    wasDark = true;
  } else if (lightValue >= LIGHT_DARK && wasDark) {
    digitalWrite(LED_ORANGE, LOW);
    wasDark = false;
  }


  // --- PUB MQTT ---
  String payload = "{";
  payload += "\"temperature\":"; payload += String(temp, 1); payload += ",";
  payload += "\"humidity\":"; payload += String(humi, 1); payload += ",";
  payload += "\"light\":"; payload += String(lightValue);
  payload += "}";

  client.publish(topic_data, payload.c_str());
}