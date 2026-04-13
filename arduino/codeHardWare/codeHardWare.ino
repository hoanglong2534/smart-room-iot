#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

const char* ssid = "MyWifi";
const char* password = "iot@12345";
const char* mqtt_server = "10.51.129.155";
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
#define LED_DUST_WARNING 25

DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastRead = 0;
const unsigned long INTERVAL = 2000;

int pendingActionPin = -1;
String pendingActionDeviceId = "";
String pendingActionStatus = "";
bool statusSent = false;

void setup_wifi() {
  delay(10);
  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true);
  delay(200);
  WiFi.begin(ssid, password);
  int n = 0;
  while (WiFi.status() != WL_CONNECTED && n < 120) {
    delay(500);
    n++;
  }
  if (WiFi.status() != WL_CONNECTED) {
    while (true) delay(2000);
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String messageTemp;
  for (unsigned int i = 0; i < length; i++) {
    messageTemp += (char)payload[i];
  }
  StaticJsonDocument<200> doc;
  if (deserializeJson(doc, messageTemp)) return;

  String deviceId = doc["deviceId"].as<String>();
  String action = doc["action"].as<String>();

  int pin = -1;
  if (deviceId == "fan" || deviceId == "1") pin = LED_RED;
  else if (deviceId == "light" || deviceId == "2") pin = LED_ORANGE;
  else if (deviceId == "humidifier" || deviceId == "3") pin = LED_BLUE;
  if (pin == -1) return;

  pendingActionPin = pin;
  pendingActionDeviceId = deviceId;
  pendingActionStatus = action;
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32Client-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("connected");
      client.subscribe(topic_control);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);
  pinMode(LED_ORANGE, OUTPUT);
  pinMode(LED_DUST_WARNING, OUTPUT);
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_BLUE, LOW);
  digitalWrite(LED_ORANGE, LOW);
  digitalWrite(LED_DUST_WARNING, LOW);

  dht.begin();
  setup_wifi();
  Serial.println(WiFi.localIP());

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  if (pendingActionPin != -1) {
    bool on = (pendingActionStatus == "ON");
    digitalWrite(pendingActionPin, on ? HIGH : LOW);
    statusSent = false;
    Serial.println("Action: Device " + pendingActionDeviceId + " -> " + pendingActionStatus);
  }
  
  // Send status update after a small delay to ensure action is processed
  if (pendingActionPin != -1 && !statusSent) {
    String statusTopic = String(topic_status_prefix) + pendingActionDeviceId;
    String statusPayload = "{\"deviceId\":\"" + pendingActionDeviceId + "\", \"status\":\"" + pendingActionStatus + "\"}";
    if (client.publish(statusTopic.c_str(), statusPayload.c_str())) {
      Serial.println("Status sent: " + statusTopic + " -> " + statusPayload);
      statusSent = true;
    } else {
      Serial.println("Failed to publish status");
    }
    pendingActionPin = -1;
  }

  unsigned long now = millis();
  if (now - lastRead < INTERVAL) return;
  lastRead = now;

  int lightValue = 4095 - analogRead(LDR_PIN);
  float temp = dht.readTemperature();
  float humi = dht.readHumidity();

  if (!isnan(temp) && !isnan(humi)) {
    int dustValue = random(0, 301); // Random dust 0-300
    
    if (dustValue > 100) {
      digitalWrite(LED_DUST_WARNING, HIGH);
    } else {
      digitalWrite(LED_DUST_WARNING, LOW);
    }

    Serial.printf("%.1f[C] %.1f[%%] LDR:%d DUST:%d\n", temp, humi, lightValue, dustValue);
    String payload = "{";
    payload += "\"temperature\":" + String(temp, 1) + ",";
    payload += "\"humidity\":" + String(humi, 1) + ",";
    payload += "\"light\":" + String(lightValue) + ",";
    payload += "\"dust\":" + String(dustValue);
    payload += "}";
    client.publish(topic_data, payload.c_str());
  } else {
    Serial.println("Failed to read from DHT sensor!");
  }
}
