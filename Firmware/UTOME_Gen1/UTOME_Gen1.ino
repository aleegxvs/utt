/**
 * ══════════════════════════════════════════════════════════════
 * UTOME Gen 1 — Firmware Oficial para ESP32-C3 Super Mini
 *
 * Robô Companheiro e Assistente de Rotinas para Crianças com TEA
 * 
 * Hardware:
 *   - ESP32-C3 Super Mini
 *   - Display OLED 0.96" SSD1306 (I2C: SDA=GPIO 8, SCL=GPIO 9)
 *   - Sensor Touch Capacitivo TTP223 (SIG=GPIO 2)
 *   - 100% Silencioso (Sem Buzzer - Baixo Estímulo Sensorial)
 * 
 * Fluxo:
 *   1. Boot -> Verifica NVS
 *   2. Se não configurado -> Captive Portal AP ("UTOME-Setup" em 192.168.4.1)
 *   3. Se configurado -> Conecta WiFi -> POST /api/device/connect -> COMPANION
 *   4. Tarefa enviada pelo Dashboard -> ROUTINE_PENDING (mostra no OLED)
 *   5. Criança confirma com 3 toques -> ROUTINE_COMPLETE -> COMPANION
 *   6. Segurar touch por 8s -> Reset de fábrica (volta ao portal)
 * ══════════════════════════════════════════════════════════════
 */

#include <Arduino.h>
#include <WiFi.h>
#include <Preferences.h>
#include "Config.h"
#include "DisplayOled.h"
#include "CaptivePortal.h"
#include "NetworkClient.h"

// ── Instâncias Globais ──
DisplayOled display;
CaptivePortal portal;
NetworkClient netClient;
Preferences preferences;

// ── Estado do Robô ──
RobotState currentState = STATE_BOOT;
DeviceConfig deviceCfg;

// ── Variáveis de Controle e Temporização ──
int currentTouchCount = 0;
String currentTaskName = "";
unsigned long lastStatusPoll = 0;
unsigned long celebrationStart = 0;
unsigned long touchReactionStart = 0;
bool isShowingTouchReaction = false;

// ── Anti-repique e Detecção de Long-Press (Reset) ──
bool lastRawTouch = false;
unsigned long touchPressStart = 0;
unsigned long lastDebounceTime = 0;
bool touchHandled = false;

// ── Protótipos ──
void loadConfiguration();
void resetToPortal();
void handleTouchInput();
void pollDeviceStatus();

void setup() {
    Serial.begin(115200);
    delay(200);
    Serial.println("\n[UTOME] Iniciando UTOME Gen 1...");

    // Inicialização do pino do sensor de toque
    pinMode(TOUCH_PIN, INPUT);

    // Inicialização do display OLED
    if (!display.begin()) {
        Serial.println("[Display] ERRO: Não foi possível inicializar o OLED SSD1306.");
    }
    display.showBoot();
    delay(1500);

    // Carregar configurações da memória não-volátil (NVS)
    loadConfiguration();

    if (!deviceCfg.configured || strlen(deviceCfg.ssid) == 0 || strlen(deviceCfg.device_id) == 0) {
        Serial.println("[Setup] Dispositivo não configurado. Entrando em modo Captive Portal...");
        currentState = STATE_PORTAL;
        portal.begin(&deviceCfg);
        display.showPortalInfo("UTOME-Setup", "192.168.4.1");
    } else {
        Serial.printf("[Setup] Conectando ao WiFi '%s' com ID '%s'...\n", deviceCfg.ssid, deviceCfg.device_id);
        currentState = STATE_CONNECTING;
        display.showConnecting(deviceCfg.ssid);

        WiFi.mode(WIFI_STA);
        WiFi.begin(deviceCfg.ssid, deviceCfg.password);

        unsigned long startAttempt = millis();
        bool connected = false;
        while (millis() - startAttempt < 15000) { // Timeout de 15s
            if (WiFi.status() == WL_CONNECTED) {
                connected = true;
                break;
            }
            delay(250);
            Serial.print(".");
        }
        Serial.println();

        netClient.setBaseUrl(deviceCfg.api_url);

        if (connected) {
            Serial.printf("[WiFi] Conectado! IP: %s\n", WiFi.localIP().toString().c_str());
            display.showConnected(deviceCfg.device_id);
            delay(1200);

            // Handshake com a API Backend
            bool ok = netClient.connectDevice(deviceCfg.device_id, FIRMWARE_VERSION, &deviceCfg);
            if (ok) {
                Serial.println("[API] Handshake com UTOME API concluído com sucesso.");
            } else {
                Serial.println("[API] Aviso: Conexão com API falhou ou servidor offline.");
            }

            display.setCalmMode(deviceCfg.modo_calmante);
            currentState = STATE_COMPANION;
        } else {
            Serial.println("[WiFi] Tempo limite excedido. Operando em modo offline.");
            currentState = STATE_COMPANION;
        }
    }
}

void loop() {
    // 1. Processar leitura contínua do sensor de toque (com debounce e detecção de reset)
    handleTouchInput();

    // 2. Máquina de Estados Principal
    switch (currentState) {
        case STATE_PORTAL:
            portal.handleClient();
            if (portal.shouldRestart()) {
                Serial.println("[Portal] Configurações salvas. Reiniciando...");
                delay(500);
                ESP.restart();
            }
            break;

        case STATE_COMPANION:
            if (isShowingTouchReaction) {
                if (millis() - touchReactionStart >= 1800) {
                    isShowingTouchReaction = false;
                }
            } else {
                display.showCompanion("Modo Companhia");
            }

            // Consultar a API periodicamente para verificar se o responsável enviou uma rotina
            if (WiFi.status() == WL_CONNECTED && (millis() - lastStatusPoll >= STATUS_POLL_INTERVAL_MS)) {
                lastStatusPoll = millis();
                pollDeviceStatus();
            }
            break;

        case STATE_ROUTINE_PENDING:
            display.showRoutinePending(currentTaskName.c_str(), currentTouchCount, 3);

            // Consultar a API caso o responsável cancele a rotina pelo painel web
            if (WiFi.status() == WL_CONNECTED && (millis() - lastStatusPoll >= STATUS_POLL_INTERVAL_MS)) {
                lastStatusPoll = millis();
                DeviceStatusResponse resp = netClient.checkStatus(deviceCfg.device_id);
                if (resp.success && resp.state == "COMPANION") {
                    Serial.println("[Routine] Rotina cancelada pelo responsável no site.");
                    currentTouchCount = 0;
                    currentTaskName = "";
                    currentState = STATE_COMPANION;
                }
            }
            break;

        case STATE_ROUTINE_COMPLETE:
            display.showRoutineComplete(currentTaskName.c_str(), deviceCfg.animacao_celebracao);
            if (millis() - celebrationStart >= CELEBRATE_DURATION_MS) {
                Serial.println("[Routine] Celebração finalizada. Retornando ao Modo Companhia.");
                currentTouchCount = 0;
                currentTaskName = "";
                currentState = STATE_COMPANION;
            }
            break;

        default:
            break;
    }

    delay(20);
}

// ── Carrega configurações salvas em NVS ──
void loadConfiguration() {
    preferences.begin("utome", true);
    String s = preferences.getString("ssid", "");
    String p = preferences.getString("pass", "");
    String d = preferences.getString("dev_id", "");
    String a = preferences.getString("api_url", DEFAULT_API_URL);
    bool conf = preferences.getBool("configured", false);
    preferences.end();

    strncpy(deviceCfg.ssid, s.c_str(), sizeof(deviceCfg.ssid) - 1);
    strncpy(deviceCfg.password, p.c_str(), sizeof(deviceCfg.password) - 1);
    strncpy(deviceCfg.device_id, d.c_str(), sizeof(deviceCfg.device_id) - 1);
    strncpy(deviceCfg.api_url, a.c_str(), sizeof(deviceCfg.api_url) - 1);
    deviceCfg.modo_calmante = false;
    deviceCfg.animacao_celebracao = true;
    deviceCfg.configured = conf;
}

// ── Redefine dispositivo para modo Captive Portal (Reset) ──
void resetToPortal() {
    Serial.println("\n[Reset] Reset de fábrica acionado! Limpando dados...");
    display.showResetWarning();

    preferences.begin("utome", false);
    preferences.clear();
    preferences.end();

    delay(2000);
    ESP.restart();
}

// ── Tratamento Inteligente do Sensor de Toque (TTP223) ──
void handleTouchInput() {
    bool raw = digitalRead(TOUCH_PIN);

    // Detecção de Toque Longo para Reset (8 segundos contínuos)
    if (raw) {
        if (!lastRawTouch) {
            touchPressStart = millis();
            touchHandled = false;
        } else if (!touchHandled && (millis() - touchPressStart >= TOUCH_RESET_HOLD_MS)) {
            touchHandled = true;
            resetToPortal();
            return;
        }
    } else {
        // Quando soltar o dedo, verificar se foi um toque curto válido
        if (lastRawTouch && !touchHandled) {
            unsigned long duration = millis() - touchPressStart;
            if (duration >= 50 && duration < 3000) { // Toque válido entre 50ms e 3s
                
                // Ação por estado
                if (currentState == STATE_COMPANION) {
                    isShowingTouchReaction = true;
                    touchReactionStart = millis();
                    display.showTouchReaction();
                    Serial.println("[Touch] Toque recebido no Modo Companhia!");
                } 
                else if (currentState == STATE_ROUTINE_PENDING) {
                    currentTouchCount++;
                    Serial.printf("[Touch] Confirmação de tarefa: %d/3\n", currentTouchCount);
                    display.showRoutinePending(currentTaskName.c_str(), currentTouchCount, 3);

                    if (currentTouchCount >= 3) {
                        Serial.println("[Touch] 3 toques completos! Tarefa finalizada.");
                        currentState = STATE_ROUTINE_COMPLETE;
                        celebrationStart = millis();
                        display.showRoutineComplete(currentTaskName.c_str(), deviceCfg.animacao_celebracao);

                        // Notifica a API que a tarefa foi concluída
                        if (WiFi.status() == WL_CONNECTED) {
                            netClient.sendEvent(deviceCfg.device_id, "routine_complete", currentTaskName.c_str());
                        }
                    }
                }
            }
        }
    }

    lastRawTouch = raw;
}

// ── Consulta periódica de status da API ──
void pollDeviceStatus() {
    DeviceStatusResponse resp = netClient.checkStatus(deviceCfg.device_id);
    if (!resp.success) return;

    // Atualizar preferências visuais
    if (resp.modoCalmante != deviceCfg.modo_calmante) {
        deviceCfg.modo_calmante = resp.modoCalmante;
        display.setCalmMode(deviceCfg.modo_calmante);
    }
    deviceCfg.animacao_celebracao = resp.animacaoCelebracao;

    // Se houver rotina pendente
    if (resp.state == "ROUTINE_PENDING" || resp.task.length() > 0) {
        if (currentState == STATE_COMPANION) {
            Serial.printf("[Routine] Nova rotina recebida: '%s'\n", resp.task.c_str());
            currentTaskName = resp.task.length() > 0 ? resp.task : "Tarefa Pendente";
            currentTouchCount = 0;
            currentState = STATE_ROUTINE_PENDING;
        }
    }
}
