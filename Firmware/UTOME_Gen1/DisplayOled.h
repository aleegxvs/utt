#ifndef DISPLAY_OLED_H
#define DISPLAY_OLED_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "Config.h"

class DisplayOled {
private:
    Adafruit_SSD1306 display;
    bool isBlinking;
    unsigned long blinkStartTime;
    unsigned long nextBlinkTime;
    bool calmMode;

    void drawEye(int x, int y, int w, int h, bool open, bool star = false);
    void drawMouth(int x, int y, int w, int type); // 0: smile, 1: neutral, 2: big smile

public:
    DisplayOled();
    bool begin();

    void setCalmMode(bool calm);
    void clear();
    void update();

    // Telas de Sistema
    void showBoot();
    void showPortalInfo(const char* ssid, const char* ip);
    void showConnecting(const char* ssid);
    void showConnected(const char* deviceId);
    void showResetWarning();

    // Telas de Expressão Facial e Ciclo de Rotinas
    void showCompanion(const char* subtext = "Modo Companhia", bool forceBlink = false);
    void showTouchReaction();
    void showRoutinePending(const char* taskName, int touchCount, int targetTouches = 3);
    void showRoutineComplete(const char* taskName, bool animateStars = true);

    // Helpers de Animação
    void updateBlink();
};

#endif // DISPLAY_OLED_H
