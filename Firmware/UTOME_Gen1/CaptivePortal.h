#ifndef CAPTIVE_PORTAL_H
#define CAPTIVE_PORTAL_H

#include <Arduino.h>
#include <WiFi.h>
#include <DNSServer.h>
#include <WebServer.h>
#include <Preferences.h>
#include "Config.h"

class CaptivePortal {
private:
    DNSServer dnsServer;
    WebServer server;
    Preferences prefs;
    bool configSaved;
    unsigned long restartTime;
    DeviceConfig* targetConfig;

    void handleRoot();
    void handleSave();
    void handleNotFound();

public:
    CaptivePortal();
    void begin(DeviceConfig* cfg);
    void handleClient();
    bool isConfigSaved() const { return configSaved; }
    bool shouldRestart() const { return configSaved && (millis() >= restartTime); }
};

#endif // CAPTIVE_PORTAL_H
