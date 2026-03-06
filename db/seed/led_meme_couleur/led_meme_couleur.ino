#include <FastLED.h>

#define NUM_LEDS 96          // Nombre total de LEDs
#define DATA_PIN 11          // Pin connectée au fil de data (DIN)
#define BRIGHTNESS 50        // Luminosité (max 255)
#define LED_TYPE WS2812B
#define COLOR_ORDER GRB

CRGB leds[NUM_LEDS];

void setup() {
  // Initialisation de la bande LED
  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
}

void loop() {
  static uint8_t hue = 0;

  // Applique la même couleur à toutes les LEDs
  fill_solid(leds, NUM_LEDS, CHSV(hue, 255, 255));

  FastLED.show();

  hue++; // Incrémente doucement pour changer la couleur
  delay(20); // Contrôle la vitesse du changement de couleur
}
