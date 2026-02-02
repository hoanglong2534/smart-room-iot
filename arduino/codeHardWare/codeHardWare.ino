#include <DHT.h>

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

unsigned long lastRead = 0;
const unsigned long INTERVAL = 2000;

void setup() {
  Serial.begin(115200);

  pinMode(LED_RED, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);
  pinMode(LED_ORANGE, OUTPUT);

  dht.begin();
}

void loop() {
  if (millis() - lastRead < INTERVAL) return;
  lastRead = millis();

  float temp = dht.readTemperature();
  float humi = dht.readHumidity();
  int lightValue = analogRead(LDR_PIN);

  if (isnan(temp) || isnan(humi)) {
    Serial.println("❌ Lỗi đọc DHT11");
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
}
