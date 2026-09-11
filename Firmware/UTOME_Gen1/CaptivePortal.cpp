#include "CaptivePortal.h"

CaptivePortal::CaptivePortal() 
    : server(80), 
      configSaved(false), 
      restartTime(0), 
      targetConfig(nullptr) {}

void CaptivePortal::begin(DeviceConfig* cfg) {
    targetConfig = cfg;
    configSaved = false;

    WiFi.disconnect(true);
    WiFi.mode(WIFI_AP);
    
    IPAddress apIP(192, 168, 4, 1);
    WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
    WiFi.softAP("UTOME-Setup");

    dnsServer.start(53, "*", apIP);

    server.on("/", HTTP_GET, [this]() { handleRoot(); });
    server.on("/save", HTTP_POST, [this]() { handleSave(); });

    // Endpoints padrão de detecção de Captive Portal de smartphones (Android, iOS, Windows)
    server.on("/generate_204", HTTP_GET, [this]() { handleRoot(); });
    server.on("/hotspot-detect.html", HTTP_GET, [this]() { handleRoot(); });
    server.on("/ncsi.txt", HTTP_GET, [this]() { handleRoot(); });

    server.onNotFound([this]() { handleNotFound(); });
    server.begin();

    Serial.println("[CaptivePortal] Ponto de acesso 'UTOME-Setup' iniciado em 192.168.4.1");
}

void CaptivePortal::handleClient() {
    dnsServer.processNextRequest();
    server.handleClient();
}

void CaptivePortal::handleRoot() {
    String html = "<!DOCTYPE html><html lang='pt-BR'><head><meta charset='UTF-8'>"
                  "<meta name='viewport' content='width=device-width,initial-scale=1.0'>"
                  "<title>UTOME - Configurar WiFi</title>"
                  "<style>"
                  "*{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;}"
                  "body{background:#F7F4F0;color:#33221B;display:flex;justify-content:center;padding:24px 16px;min-height:100vh;}"
                  ".card{background:#FFF;border-radius:24px;padding:32px 24px;width:100%;max-width:400px;box-shadow:0 12px 36px rgba(0,0,0,0.08);border:2px solid #EFEAE4;}"
                  ".logo{font-size:1.8rem;font-weight:900;color:#F57C00;text-align:center;letter-spacing:1px;margin-bottom:4px;}"
                  ".sub{text-align:center;font-size:0.85rem;color:#7A6B65;margin-bottom:24px;font-weight:600;}"
                  "label{display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;color:#4A3830;}"
                  "input{width:100%;padding:14px;border:2px solid #E5DFD9;border-radius:14px;font-size:0.95rem;margin-bottom:18px;outline:none;background:#FAFAF9;}"
                  "input:focus{border-color:#F57C00;background:#FFF;}"
                  ".btn{width:100%;background:#F57C00;color:#FFF;border:none;border-radius:14px;padding:16px;font-size:1rem;font-weight:800;cursor:pointer;box-shadow:0 4px 0 #D06900;}"
                  ".btn:active{transform:translateY(2px);box-shadow:none;}"
                  ".hint{font-size:0.75rem;color:#948882;margin-top:16px;line-height:1.4;text-align:center;}"
                  "</style></head><body><div class='card'>"
                  "<div class='logo'>UTOME</div>"
                  "<div class='sub'>Configuração do Robô de Apoio</div>"
                  "<form action='/save' method='POST'>"
                  "<label>Nome da rede WiFi (SSID):</label>"
                  "<input type='text' name='ssid' required placeholder='Ex: MinhaCasa_2.4G'>"
                  "<label>Senha do WiFi:</label>"
                  "<input type='password' name='password' placeholder='Senha do WiFi'>"
                  "<label>ID do Dispositivo (copiado do site):</label>"
                  "<input type='text' name='device_id' required placeholder='Ex: UTOME-7F3A92' value='";
    
    if (targetConfig && strlen(targetConfig->device_id) > 0) {
        html += targetConfig->device_id;
    }
    
    html += "' style='font-family:monospace;text-transform:uppercase;font-weight:700;'>"
            "<label>Servidor API (Backend):</label>"
            "<input type='text' name='api_url' value='";

    if (targetConfig && strlen(targetConfig->api_url) > 0) {
        html += targetConfig->api_url;
    } else {
        html += DEFAULT_API_URL;
    }

    html += "'>"
            "<button type='submit' class='btn'>Salvar e Conectar</button>"
            "</form>"
            "<div class='hint'>Após salvar, o UTOME conectará ao WiFi de casa e fechará esta rede.</div>"
            "</div></body></html>";

    server.send(200, "text/html", html);
}

void CaptivePortal::handleSave() {
    if (!server.hasArg("ssid") || !server.hasArg("device_id")) {
        server.send(400, "text/plain", "Campos obrigatorios ausentes.");
        return;
    }

    String ssid = server.arg("ssid");
    String password = server.arg("password");
    String deviceId = server.arg("device_id");
    String apiUrl = server.hasArg("api_url") ? server.arg("api_url") : DEFAULT_API_URL;

    deviceId.trim();
    deviceId.toUpperCase();
    ssid.trim();
    apiUrl.trim();

    prefs.begin("utome", false);
    prefs.putString("ssid", ssid);
    prefs.putString("pass", password);
    prefs.putString("dev_id", deviceId);
    prefs.putString("api_url", apiUrl);
    prefs.putBool("configured", true);
    prefs.end();

    if (targetConfig) {
        strncpy(targetConfig->ssid, ssid.c_str(), sizeof(targetConfig->ssid) - 1);
        strncpy(targetConfig->password, password.c_str(), sizeof(targetConfig->password) - 1);
        strncpy(targetConfig->device_id, deviceId.c_str(), sizeof(targetConfig->device_id) - 1);
        strncpy(targetConfig->api_url, apiUrl.c_str(), sizeof(targetConfig->api_url) - 1);
        targetConfig->configured = true;
    }

    String resp = "<!DOCTYPE html><html lang='pt-BR'><head><meta charset='UTF-8'>"
                  "<meta name='viewport' content='width=device-width,initial-scale=1.0'>"
                  "<title>UTOME - Configurado</title>"
                  "<style>"
                  "body{background:#F7F4F0;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;}"
                  ".card{background:#FFF;border-radius:24px;padding:36px 24px;max-width:380px;text-align:center;box-shadow:0 12px 36px rgba(0,0,0,0.08);}"
                  "h2{color:#2E7D32;margin-bottom:12px;font-size:1.4rem;font-weight:900;}"
                  "p{color:#5C4E47;font-size:0.9rem;line-height:1.5;margin-bottom:20px;font-weight:600;}"
                  ".id{font-family:monospace;font-weight:900;font-size:1.1rem;color:#F57C00;background:#FFF3E0;padding:8px 16px;border-radius:10px;display:inline-block;}"
                  "</style></head><body><div class='card'>"
                  "<h2>Configurado com Sucesso! ✓</h2>"
                  "<p>Dispositivo registrado como:<br><br><span class='id'>" + deviceId + "</span></p>"
                  "<p>O UTOME está reiniciando para conectar na sua rede WiFi de casa.</p>"
                  "<p style='font-size:0.8rem;color:#999;'>Você já pode voltar ao painel do site.</p>"
                  "</div></body></html>";

    server.send(200, "text/html", resp);
    configSaved = true;
    restartTime = millis() + 3000;
}

void CaptivePortal::handleNotFound() {
    server.sendHeader("Location", "http://192.168.4.1/", true);
    server.send(302, "text/plain", "");
}
