#include <Arduino.h>
#include "Button.h"
#include <Adafruit_NeoPixel.h>

const int LED_PIN = 12;
const int BUILT_IN_LED_PIN = 21;
Adafruit_NeoPixel pixels(1, BUILT_IN_LED_PIN, NEO_GRB + NEO_KHZ800);

static void onButtonPressDownCb(void *button_handle, void *usr_data) {
    digitalWrite(LED_PIN, LOW);
    pixels.setPixelColor(0, pixels.Color(0, 0, 255)); // blue
    pixels.show();
    Serial.println("    pressed down");
}

static void onButtonPressUpCb(void *button_handle, void *usr_data) {
    pixels.setPixelColor(0, pixels.Color(0, 0, 0));
    pixels.show();
    Serial.println("    pressed up");
}

static void onButtonSingleClickCb(void *button_handle, void *usr_data) {
    Serial.println("--- single click");
}

static void onButtonDoubleClickCb(void *button_handle, void *usr_data) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println(">>> double click");
}

static void onButtonLongPressStartCb(void *button_handle, void *usr_data) {
    pixels.setPixelColor(0, pixels.Color(0, 255, 0)); // green
    pixels.show();
    Serial.println("+   long press start");
}

static void onButtonLongPressUpCb(void *button_handle, void *usr_data) {
    Serial.println("+++ long press up");
}

static void onButtonMultipleClickCb(void *button_handle, void *usr_data) {
    pixels.setPixelColor(0, pixels.Color(255, 0, 0)); // red
    pixels.show();
    Serial.println("!!! multiple click");
}

void setup() {
    Serial.begin(115200);

    pinMode(LED_PIN, OUTPUT);
    pixels.begin();

    Button *btn = new Button(GPIO_NUM_13, false);

    btn->attachPressDownEventCb(&onButtonPressDownCb, NULL);
    btn->attachPressUpEventCb(&onButtonPressUpCb, NULL);
    btn->attachSingleClickEventCb(&onButtonSingleClickCb, NULL);
    btn->attachDoubleClickEventCb(&onButtonDoubleClickCb, NULL);
    btn->attachLongPressStartEventCb(&onButtonLongPressStartCb, NULL);
    btn->attachLongPressUpEventCb(&onButtonLongPressUpCb, NULL);
    btn->attachMultipleClickEventCb(&onButtonMultipleClickCb, 3, NULL);

    // btn->setParam(button_param_t param, void *value);
    //     BUTTON_LONG_PRESS_TIME_MS = 0,
    //     BUTTON_SHORT_PRESS_TIME_MS,
    //     BUTTON_PARAM_MAX,
}

void loop() {

}