#include <Arduino.h>
#include "Button.h"

const int GREEN_LED_PIN = 2;
const int YELLOW_LED_PIN = 3;
const int RED_LED_PIN = 4;

static void onButtonPressDownCb(void *button_handle, void *usr_data) {
    digitalWrite(GREEN_LED_PIN, HIGH);
    digitalWrite(YELLOW_LED_PIN, LOW);
    digitalWrite(RED_LED_PIN, LOW);
    Serial.println("    pressed down");
}

static void onButtonPressUpCb(void *button_handle, void *usr_data) {
    digitalWrite(GREEN_LED_PIN, LOW);
    Serial.println("    pressed up");
}

static void onButtonSingleClickCb(void *button_handle, void *usr_data) {
    Serial.println("--- single click");
}

static void onButtonDoubleClickCb(void *button_handle, void *usr_data) {
    digitalWrite(GREEN_LED_PIN, LOW);
    digitalWrite(YELLOW_LED_PIN, HIGH);
    digitalWrite(RED_LED_PIN, LOW);
    Serial.println(">>> double click");
}

static void onButtonLongPressStartCb(void *button_handle, void *usr_data) {
    digitalWrite(YELLOW_LED_PIN, HIGH);
    digitalWrite(RED_LED_PIN, HIGH);
    Serial.println("+   long press start");
}

static void onButtonLongPressUpCb(void *button_handle, void *usr_data) {
    digitalWrite(YELLOW_LED_PIN, LOW);
    digitalWrite(RED_LED_PIN, LOW);
    Serial.println("+++ long press up");
}

static void onButtonMultipleClickCb(void *button_handle, void *usr_data) {
    digitalWrite(GREEN_LED_PIN, LOW);
    digitalWrite(YELLOW_LED_PIN, LOW);
    digitalWrite(RED_LED_PIN, HIGH);
    Serial.println("!!! multiple click");
}

void setup() {
    Serial.begin(115200);

    pinMode(GREEN_LED_PIN, OUTPUT);
    pinMode(YELLOW_LED_PIN, OUTPUT);
    pinMode(RED_LED_PIN, OUTPUT);

    Button *btn = new Button(GPIO_NUM_10, false);

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