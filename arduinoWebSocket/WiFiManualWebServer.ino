#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <WiFiServer.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

const char* ssid = "Matheus Ed.";
const char* password = "lucas123";

const int LED_PIN = D2;
int intensidade = 0;

const char* MORSE_TABLE[] = {
  ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.", "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--.."
};

WiFiServer server(80);
WiFiClient client;

String message = "";

void setup() {
  pinMode(LED_PIN, OUTPUT);

  Serial.begin(115200);
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  Serial.println(WiFi.localIP());
  server.begin();
}

void loop() {
  client = server.available();

  if (client) {
    String request = client.readStringUntil('\r');
    client.flush();

    if (request.indexOf("GET /morse=") != -1) {
      int start = request.indexOf("morse=") + 6;
      int end = request.indexOf(" HTTP");
      message = request.substring(start, end);
      message.trim();
      analogWrite(LED_PIN, 0);
      delay(2000);      

      for (int i = 0; i < message.length(); i++) {
        char c = message.charAt(i);
        if (isAlphaNumeric(c)) {
          String morse = charToMorse(c);
          for (int j = 0; j < morse.length(); j++) {
            char m = morse.charAt(j);
            if (m == '.') {
              blink(1);
            } else if (m == '-') {
              blink(3);
            }
            delay(50);
          }
          delay(100);
        }
        delay(200);
      }

      client.println("HTTP/1.1 200 OK");
      client.println("Content-Type: text/plain");
      client.println("Connection: close");
      client.println();
      client.println("OK");

    }

    if (request.indexOf("GET /intensity=") != -1) {
      int start = request.indexOf("intensity=") + 10;
      int end = request.indexOf(" HTTP");
      message = request.substring(start, end);
      Serial.println(message);
  
      
      analogWrite(LED_PIN, atoi(message.c_str()));
      intensidade = atoi(message.c_str());
      client.print("TESTE");
    }

    if (request.indexOf("GET /setState=") != -1) {
      int start = request.indexOf("State=") + 6;
      int end = request.indexOf(" HTTP");
      message = request.substring(start, end);
      Serial.println(message);
      if (message == "on"){
        digitalWrite(LED_PIN, HIGH);
        intensidade = 255;
      }
      else if(message=="off"){
        digitalWrite(LED_PIN, LOW);
        intensidade = 0;
      }
  
      
      client.println("HTTP/1.1 200 OK");
      client.println("Content-Type: text/plain");
      client.println("Connection: close");
      client.println();
      client.println("OK");

    }

    if (request.indexOf("GET /getState") != -1) {
      Serial.println(intensidade);
      if (intensidade>0){
        float valor = (float)intensidade / 255.0f;
        Serial.println(valor);
        Serial.println(intensidade);
        client.printf("ligado em %.2f%% de instensidade",valor * 100.0f);
      }else{
        client.print("desligado");
      }
    }
  }
}

void blink(int duration) {
  digitalWrite(LED_PIN, HIGH);
  delay(100 * duration);
  digitalWrite(LED_PIN, LOW);
  delay(100);
}

String charToMorse(char c) {
  if (isAlphaNumeric(c)) {
    if (isAlpha(c)) {
      c = toUpperCase(c);
    }
    return MORSE_TABLE[c - 'A'];
  } else {
    return "";
  }
}

bool isAlphaNumeric(char c) {
  return isAlpha(c) || isDigit(c);
}

bool isAlpha(char c) {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

bool isDigit(char c) {
  return c >= '0' && c <= '9';
}

