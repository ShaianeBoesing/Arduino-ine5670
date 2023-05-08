#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <WiFiServer.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

// Replace with your network credentials
const char* ssid = "FL Wireless 2.4";
const char* password = "FernandoNet";

// Set the LED pin
const int LED_PIN = D2;

// Define the Morse code translation table
const char* MORSE_TABLE[] = {
  ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.", "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--.."
};

// Initialize the WiFi server and client objects
WiFiServer server(80);
WiFiClient client;

String message = "";

void setup() {
  // Set the LED pin as an output
  pinMode(LED_PIN, OUTPUT);

  // Connect to WiFi
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

  // Start the WiFi server
  Serial.println(WiFi.localIP());
  server.begin();
}

void loop() {
  // Wait for a client to connect to the server
  client = server.available();

  if (client) {
    // Read the HTTP request
    String request = client.readStringUntil('\r');
    client.flush();

    // Check if the request is for the "/send" path
    if (request.indexOf("GET /morse=") != -1) {
      // Extract the message from the request
      int start = request.indexOf("morse=") + 6;
      int end = request.indexOf(" HTTP");
      message = request.substring(start, end);
      message.trim();
      analogWrite(LED_PIN, 0);
      delay(2000);      

      // Translate the message to Morse code and blink the LED accordingly
            // Translate the message to Morse code and blink the LED accordingly
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

      // Send the HTTP response
      client.println("HTTP/1.1 200 OK");
      client.println("Content-Type: text/plain");
      client.println("Connection: close");
      client.println();
      client.println("OK");

      // Close the client connection
      client.stop();
    }

    if (request.indexOf("GET /intensity=") != -1) {
      // Extract the message from the request
      int start = request.indexOf("intensity=") + 10;
      int end = request.indexOf(" HTTP");
      message = request.substring(start, end);
      Serial.println(message);
  
      
      analogWrite(LED_PIN, atoi(message.c_str()));
      // Send the HTTP response
      client.print("TESTE");
      // Close the client connection
    }

    if (request.indexOf("GET /setState=") != -1) {
      // Extract the message from the request
      int start = request.indexOf("State=") + 6;
      int end = request.indexOf(" HTTP");
      message = request.substring(start, end);
      Serial.println(message);
      if (message == "on"){
        digitalWrite(LED_PIN, HIGH);
      }
      else if(message=="off"){
        digitalWrite(LED_PIN, LOW);
      }
  
      
      // Send the HTTP response
      client.println("HTTP/1.1 200 OK");
      client.println("Content-Type: text/plain");
      client.println("Connection: close");
      client.println();
      client.println("OK");

      // Close the client connection
      client.stop();
    }

    if (request.indexOf("GET /getState") != -1) {
      // Extract the message from the request

      // Send the HTTP response
       // Send the HTTP response
      client.println("HTTP/1.1 200 OK");
      client.println("Content-Type: text/plain");
      client.println("Connection: close");
      client.println();
      client.println("OK");
      // Close the client connection
      client.stop();
    }
  }
}

// Blink the LED for a given duration (in units of dots)
void blink(int duration) {
  digitalWrite(LED_PIN, HIGH);
  delay(100 * duration);
  digitalWrite(LED_PIN, LOW);
  delay(100);
}

// Convert a character to Morse code
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

// Check if a character is alphanumeric
bool isAlphaNumeric(char c) {
  return isAlpha(c) || isDigit(c);
}

// Check if a character is a letter
bool isAlpha(char c) {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

// Check if a character is a digit
bool isDigit(char c) {
  return c >= '0' && c <= '9';
}

