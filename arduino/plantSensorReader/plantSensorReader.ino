#include <Wire.h>

int soilSensor1Pin = 0;
int lightSensor1Pin = 1;
int tmpSensor1Pin = 2;
int tmpSensor2Pin = 3;
int relayPin = 8;

float soilSensor1Value = 0.0;
float lightSensor1Value = 0.0;
float tmpSensor1Value = 0.0;
float tmpSensor2Value = 0.0;

bool lightOn = false;

void setup() {
  Serial.begin(115200);
  pinMode(relayPin, OUTPUT);
}

float handleTmp36Value(int rawValue) {
  float voltage = rawValue * 5;
  voltage /= 1024.0;
  float tempC = (voltage - 0.5) * 100;

  return ((9.0 / 5.0) * tempC + 32.0);
}

void loop() {
  
  if(Serial.available() > 0) {
    String incomingMsg = Serial.readString();
    if(incomingMsg.substring(0) == "lightOn") {
      if(!lightOn) {
        lightOn = true;
        digitalWrite(relayPin, HIGH);
      }
    }
    if(incomingMsg.substring(0) == "lightOff") {
      if(lightOn) {
        lightOn = false;
        digitalWrite(relayPin, LOW);
      }
    }

  }
  soilSensor1Value = analogRead(soilSensor1Pin);
  lightSensor1Value = analogRead(lightSensor1Pin);
  tmpSensor1Value = analogRead(tmpSensor1Pin);
  tmpSensor2Value = analogRead(tmpSensor2Pin);

  tmpSensor1Value = handleTmp36Value(tmpSensor1Value)/10;
  tmpSensor2Value = handleTmp36Value(tmpSensor2Value)/10;

  String returnString = "{\"soil\": ";
  returnString += soilSensor1Value;
  returnString += ",\"light\": ";
  returnString += lightSensor1Value;
  returnString += ",\"temperatureCh1\": ";
  returnString += tmpSensor1Value;
  returnString += ",\"temperatureCh2\": ";
  returnString += tmpSensor2Value;
  returnString += "}";
  Serial.println(returnString);

  delay(50);
}
