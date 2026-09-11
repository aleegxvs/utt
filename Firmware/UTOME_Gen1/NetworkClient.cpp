#include "NetworkClient.h"

NetworkClient::NetworkClient() : baseUrl(DEFAULT_API_URL) {}

void NetworkClient::setBaseUrl(const char* url) {
    baseUrl = String(url);
    if (baseUrl.endsWith("/")) {
        baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
    }
}

bool NetworkClient::connectDevice(const char* deviceId, const char* firmware, DeviceConfig* cfg) {
    if (WiFi.status() != WL_CONNECTED) return false;

    HTTPClient http;
    String endpoint = baseUrl + "/api/device/connect";
    http.begin(endpoint);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["device_id"] = deviceId;
    doc["firmware"] = firmware;

    String requestBody;
    serializeJson(doc, requestBody);

    Serial.printf("[Network] Enviando connect para %s...\n", endpoint.c_str());
    int httpCode = http.POST(requestBody);

    if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
        String response = http.getString();
        StaticJsonDocument<512> respDoc;
        DeserializationError error = deserializeJson(respDoc, response);

        if (!error && respDoc["success"]) {
            if (cfg && respDoc.containsKey("configs")) {
                JsonObject configs = respDoc["configs"];
                if (configs.containsKey("modo_calmante")) {
                    cfg->modo_calmante = configs["modo_calmante"].as<bool>();
                }
                if (configs.containsKey("animacao_celebracao")) {
                    cfg->animacao_celebracao = configs["animacao_celebracao"].as<bool>();
                }
            }
            http.end();
            return true;
        }
    } else {
        Serial.printf("[Network] Falha no connect. Codigo HTTP: %d\n", httpCode);
    }

    http.end();
    return false;
}

DeviceStatusResponse NetworkClient::checkStatus(const char* deviceId) {
    DeviceStatusResponse resp;
    resp.success = false;
    resp.online = false;
    resp.state = "COMPANION";
    resp.task = "";
    resp.modoCalmante = false;
    resp.animacaoCelebracao = true;

    if (WiFi.status() != WL_CONNECTED) return resp;

    HTTPClient http;
    String endpoint = baseUrl + "/api/device/status";
    http.begin(endpoint);
    http.addHeader("device-id", deviceId);
    http.setTimeout(3000);

    int httpCode = http.GET();

    if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        StaticJsonDocument<512> doc;
        DeserializationError err = deserializeJson(doc, payload);

        if (!err && doc["success"]) {
            resp.success = true;
            resp.online = doc["online"] | false;
            resp.state = doc["state"] | "COMPANION";
            
            if (doc.containsKey("task") && !doc["task"].isNull()) {
                resp.task = doc["task"].as<String>();
            } else if (doc.containsKey("comando_pendente") && !doc["comando_pendente"].isNull()) {
                resp.task = doc["comando_pendente"]["nome_tarefa"].as<String>();
            }

            if (doc.containsKey("configs")) {
                JsonObject cfg = doc["configs"];
                resp.modoCalmante = cfg["modo_calmante"] | false;
                resp.animacaoCelebracao = cfg["animacao_celebracao"] | true;
            }
        }
    }

    http.end();
    return resp;
}

bool NetworkClient::sendEvent(const char* deviceId, const char* eventType, const char* taskName) {
    if (WiFi.status() != WL_CONNECTED) return false;

    HTTPClient http;
    String endpoint = baseUrl + "/api/device/events";
    http.begin(endpoint);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["device_id"] = deviceId;
    doc["type"] = eventType;
    doc["task_name"] = taskName;
    doc["timestamp"] = millis(); // O servidor registra o timestamp real de rede

    String body;
    serializeJson(doc, body);

    int httpCode = http.POST(body);
    http.end();

    return (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED);
}

bool NetworkClient::sendOffline(const char* deviceId) {
    if (WiFi.status() != WL_CONNECTED) return false;

    HTTPClient http;
    String endpoint = baseUrl + "/api/device/offline";
    http.begin(endpoint);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<128> doc;
    doc["device_id"] = deviceId;

    String body;
    serializeJson(doc, body);

    int httpCode = http.POST(body);
    http.end();

    return (httpCode == HTTP_CODE_OK);
}
