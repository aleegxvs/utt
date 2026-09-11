#include "DisplayOled.h"

DisplayOled::DisplayOled() 
    : display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1),
      isBlinking(false),
      blinkStartTime(0),
      nextBlinkTime(0),
      calmMode(false) {}

bool DisplayOled::begin() {
    Wire.begin(OLED_SDA_PIN, OLED_SCL_PIN);
    if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
        return false;
    }
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.display();
    nextBlinkTime = millis() + random(BLINK_INTERVAL_MIN_MS, BLINK_INTERVAL_MAX_MS);
    return true;
}

void DisplayOled::setCalmMode(bool calm) {
    calmMode = calm;
}

void DisplayOled::clear() {
    display.clearDisplay();
}

void DisplayOled::update() {
    display.display();
}

void DisplayOled::drawEye(int x, int y, int w, int h, bool open, bool star) {
    if (star) {
        // Olho estrela para celebração de conquista
        display.drawLine(x, y - h/2, x, y + h/2, SSD1306_WHITE);
        display.drawLine(x - w/2, y, x + w/2, y, SSD1306_WHITE);
        display.drawLine(x - w/3, y - h/3, x + w/3, y + h/3, SSD1306_WHITE);
        display.drawLine(x - w/3, y + h/3, x + w/3, y - h/3, SSD1306_WHITE);
        display.fillCircle(x, y, 2, SSD1306_WHITE);
    } else if (open) {
        // Olho aberto suave (estilo cápsula/amigável)
        display.fillRoundRect(x - w/2, y - h/2, w, h, w/2, SSD1306_WHITE);
        // Brilho interno do olhar (pupila dócil)
        display.fillCircle(x - w/5, y - h/5, 2, SSD1306_BLACK);
    } else {
        // Olho fechado / piscando (linha curva suave)
        display.drawLine(x - w/2, y, x + w/2, y, SSD1306_WHITE);
        display.drawLine(x - w/2 + 2, y + 1, x + w/2 - 2, y + 1, SSD1306_WHITE);
    }
}

void DisplayOled::drawMouth(int x, int y, int w, int type) {
    if (type == 0) {
        // Sorriso suave e calmo
        display.drawLine(x - w/2, y - 1, x - w/4, y + 2, SSD1306_WHITE);
        display.drawLine(x - w/4, y + 2, x + w/4, y + 2, SSD1306_WHITE);
        display.drawLine(x + w/4, y + 2, x + w/2, y - 1, SSD1306_WHITE);
    } else if (type == 1) {
        // Neutro / atento
        display.drawLine(x - w/4, y, x + w/4, y, SSD1306_WHITE);
    } else if (type == 2) {
        // Sorriso aberto de celebração
        display.fillCircle(x, y, w/3, SSD1306_WHITE);
        display.fillRect(x - w/2, y - w/3, w, w/3, SSD1306_BLACK);
    }
}

void DisplayOled::showBoot() {
    clear();
    display.setTextSize(2);
    display.setCursor(32, 14);
    display.print("UTOME");
    display.setTextSize(1);
    display.setCursor(44, 38);
    display.print("Gen 1");
    display.setCursor(20, 52);
    display.print("Inicializando...");
    update();
}

void DisplayOled::showPortalInfo(const char* ssid, const char* ip) {
    clear();
    display.setTextSize(1);
    display.setCursor(14, 2);
    display.print("CONFIGURACAO UTOME");
    display.drawLine(0, 12, 128, 12, SSD1306_WHITE);
    
    display.setCursor(4, 18);
    display.print("Conecte no WiFi:");
    display.setCursor(4, 29);
    display.print(ssid);
    
    display.setCursor(4, 43);
    display.print("Abra o navegador:");
    display.setCursor(4, 54);
    display.print(ip);
    update();
}

void DisplayOled::showConnecting(const char* ssid) {
    clear();
    drawEye(40, 20, 16, 22, true);
    drawEye(88, 20, 16, 22, true);
    drawMouth(64, 38, 16, 0);

    display.setTextSize(1);
    display.setCursor(14, 52);
    display.print("Conectando WiFi...");
    update();
}

void DisplayOled::showConnected(const char* deviceId) {
    clear();
    drawEye(40, 18, 16, 22, true);
    drawEye(88, 18, 16, 22, true);
    drawMouth(64, 36, 18, 0);

    display.setTextSize(1);
    display.setCursor(18, 52);
    display.print(deviceId);
    update();
}

void DisplayOled::showResetWarning() {
    clear();
    display.setTextSize(1);
    display.setCursor(24, 16);
    display.print("REDEFININDO...");
    display.setCursor(10, 36);
    display.print("Limpando dados WiFi");
    display.setCursor(14, 50);
    display.print("Solte o sensor");
    update();
}

void DisplayOled::updateBlink() {
    unsigned long now = millis();
    if (!isBlinking && now >= nextBlinkTime) {
        isBlinking = true;
        blinkStartTime = now;
    } else if (isBlinking && now - blinkStartTime >= (calmMode ? 180 : 120)) {
        isBlinking = false;
        unsigned long intervalMin = calmMode ? 5000 : BLINK_INTERVAL_MIN_MS;
        unsigned long intervalMax = calmMode ? 9000 : BLINK_INTERVAL_MAX_MS;
        nextBlinkTime = now + random(intervalMin, intervalMax);
    }
}

void DisplayOled::showCompanion(const char* subtext, bool forceBlink) {
    updateBlink();
    bool open = forceBlink ? false : !isBlinking;

    clear();
    // Olhos e boca expressivos
    drawEye(40, 20, 16, 22, open);
    drawEye(88, 20, 16, 22, open);
    drawMouth(64, 38, 16, 0);

    // Texto de apoio inferior
    display.setTextSize(1);
    int len = strlen(subtext);
    int xPos = max(0, (128 - (len * 6)) / 2);
    display.setCursor(xPos, 52);
    display.print(subtext);
    update();
}

void DisplayOled::showTouchReaction() {
    clear();
    // Olhos felizes piscados
    drawEye(40, 20, 18, 14, false);
    drawEye(88, 20, 18, 14, false);
    drawMouth(64, 38, 20, 0);

    display.setTextSize(1);
    display.setCursor(34, 52);
    display.print("Estou aqui!");
    update();
}

void DisplayOled::showRoutinePending(const char* taskName, int touchCount, int targetTouches) {
    clear();
    
    // Título da tarefa no topo
    display.setTextSize(1);
    int nameLen = strlen(taskName);
    int xName = max(0, (128 - (nameLen * 6)) / 2);
    display.setCursor(xName, 2);
    display.print(taskName);
    display.drawLine(10, 12, 118, 12, SSD1306_WHITE);

    // Olhos atentos olhando para o topo/centro
    drawEye(44, 26, 14, 18, true);
    drawEye(84, 26, 14, 18, true);
    drawMouth(64, 40, 12, 1);

    // Indicador visual de 3 toques na base (círculos)
    int dotSpacing = 16;
    int startX = 64 - ((targetTouches - 1) * dotSpacing) / 2;
    for (int i = 0; i < targetTouches; i++) {
        int dotX = startX + (i * dotSpacing);
        int dotY = 56;
        if (i < touchCount) {
            display.fillCircle(dotX, dotY, 4, SSD1306_WHITE);
        } else {
            display.drawCircle(dotX, dotY, 4, SSD1306_WHITE);
        }
    }

    update();
}

void DisplayOled::showRoutineComplete(const char* taskName, bool animateStars) {
    clear();
    // Olhos de estrela e sorriso alegre
    drawEye(40, 18, 20, 20, true, animateStars);
    drawEye(88, 18, 20, 20, true, animateStars);
    drawMouth(64, 36, 22, 2);

    display.setTextSize(1);
    display.setCursor(20, 52);
    display.print("Voce conseguiu!");
    update();
}
