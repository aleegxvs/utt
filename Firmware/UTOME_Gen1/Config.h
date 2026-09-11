#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// ══════════════════════════════════════════════════════════════
// UTOME GEN 1 — DEFINIÇÕES DE HARDWARE E CONFIGURAÇÃO
// Placa Alvo: ESP32-C3 Super Mini (RISC-V 160MHz)
// ══════════════════════════════════════════════════════════════

// ── PINAGEM I2C (Display OLED 0.96" SSD1306 128x64) ──
#define OLED_SDA_PIN    8
#define OLED_SCL_PIN    9
#define OLED_ADDR       0x3C
#define SCREEN_WIDTH    128
#define SCREEN_HEIGHT   64

// ── SENSOR DE TOQUE CAPACITIVO (TTP223) ──
#define TOUCH_PIN       2

// ── LED ONBOARD (ESP32-C3 Super Mini - Active Low) ──
#define LED_PIN         8 // Compartilhado com SDA ou use pino livre se disponível; desative se causar conflito
#define USE_ONBOARD_LED false

// ── HARDWARE SILENCIOSO: NENHUM BUZZER (Zero Som) ──
// Em conformidade com as diretrizes de baixo estímulo sensorial TEA.

// ── TEMPORIZADORES E INTERVALOS (milissegundos) ──
#define TOUCH_DEBOUNCE_MS       250    // Anti-repique de toque
#define TOUCH_RESET_HOLD_MS     8000   // Segurar 8s para reset de fábrica (reabrir portal AP)
#define STATUS_POLL_INTERVAL_MS 4000   // Consulta de rotinas a cada 4s
#define CELEBRATE_DURATION_MS   3500   // Duração da tela de celebração
#define BLINK_INTERVAL_MIN_MS   3500   // Intervalo mínimo entre piscadas suaves
#define BLINK_INTERVAL_MAX_MS   7000   // Intervalo máximo entre piscadas suaves

// ── IDENTIFICAÇÃO DE FIRMWARE ──
#define FIRMWARE_VERSION        "1.0.0"
#define DEFAULT_API_URL         "http://192.168.1.100:3000" // Ajustável pelo portal

// ── ESTADOS DA MÁQUINA DE ESTADOS DO ROBÔ ──
enum RobotState {
    STATE_BOOT,             // Inicializando hardware e checando NVS
    STATE_PORTAL,           // Modo AP Captive Portal ativo (UTOME-Setup)
    STATE_CONNECTING,       // Conectando à rede WiFi doméstica
    STATE_COMPANION,        // Modo Companhia padrão (calmo, expressivo)
    STATE_ROUTINE_PENDING,  // Tarefa recebida do responsável, aguardando 3 toques
    STATE_ROUTINE_COMPLETE  // Conquista concluída com celebração visual
};

// ── ESTRUTURA DE CONFIGURAÇÕES SALVAS EM NVS (Preferences) ──
struct DeviceConfig {
    char ssid[33];
    char password[65];
    char device_id[32];
    char api_url[128];
    bool modo_calmante;
    bool animacao_celebracao;
    bool configured;
};

#endif // CONFIG_H
