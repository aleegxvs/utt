#ifndef NETWORK_CLIENT_H
#define NETWORK_CLIENT_H

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "Config.h"

struct DeviceStatusResponse {
    bool success;
    bool online;
    String state;
    String task;
    bool modoCalmante;
    bool animacaoCelebracao;
};

class NetworkClient {
private:
    String baseUrl;

public:
    NetworkClient();
    void setBaseUrl(const char* url);

    bool connectDevice(const char* deviceId, const char* firmware, DeviceConfig* cfg);
    DeviceStatusResponse checkStatus(const char* deviceId);
    bool sendEvent(const char* deviceId, const char* eventType, const char* taskName);
    bool sendOffline(const char* deviceId);
};

#endif // NETWORK_CLIENT_H
