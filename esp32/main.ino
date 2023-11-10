#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <string>

const char *ssid = "Wokwi-GUEST";
const char *password = "";

#define BTN_PIN 5
#define TFT_DC 2
#define TFT_CS 15
Adafruit_ILI9341 tft = Adafruit_ILI9341(TFT_CS, TFT_DC);

const String url = "ENTER URL";

int day = 6;
int month = 11;
int year = 2023;

String getTimetable()
{
  HTTPClient http;
  http.useHTTP10(true);
  String fullUrl = url + "?day=" + String(day) + "&month=" + String(month) + "&year=" + String(year);
  http.begin(fullUrl);
  http.GET();
  String result = http.getString();
  result =
      "Stundenplan " +
      String(day) + "." + String(month) + "." + String(year) + ":\n" + result;

  return result;
}

void nextTimetable()
{
  if (day < 31)
  {
    day++;
  }
  else
  {
    day = 1;
    month++;
  }

  String timetable = getTimetable();
  tft.println(timetable);
}

void setup()
{
  pinMode(BTN_PIN, INPUT_PULLUP);

  WiFi.begin(ssid, password, 6);

  tft.begin();
  tft.setRotation(1);

  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(2);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(100);
  }

  nextTimetable();
}

void loop()
{
  if (digitalRead(BTN_PIN) == LOW)
  {
    tft.fillScreen(ILI9341_BLACK);
    tft.setCursor(0, 0);
    nextTimetable();
  }

  delay(100);
}