# 🤖 Firmware Oficial UTOME Gen 1

Código-fonte do microcontrolador **ESP32-C3 Super Mini** para o robô companheiro e assistente de rotinas **UTOME Gen 1**.

O dispositivo opera de forma **100% silenciosa** (sem buzzer, foco em baixo estímulo sensorial para crianças com TEA), combinando expressões faciais em display OLED SSD1306 e interação tátil com sensor capacitivo TTP223.

---

## 📌 Pinagem de Hardware (ESP32-C3 Super Mini)

| Componente | Pino do Componente | Pino no ESP32-C3 | Observações |
|---|---|---|---|
| **Display OLED 0.96" SSD1306** | `VCC` | **3.3V** | Alimentação lógica |
| | `GND` | **GND** | Terra comum |
| | `SDA` | **GPIO 8** | Barramento I2C Dados |
| | `SCL` | **GPIO 9** | Barramento I2C Clock |
| **Sensor Touch TTP223** | `VCC` | **3.3V** | Alimentação |
| | `GND` | **GND** | Terra |
| | `SIG` (ou I/O) | **GPIO 2** | Leitura digital do toque |
| **Buzzer / Som** | — | **NENHUM** | 🔇 Robô 100% silencioso |

---

## 📦 Bibliotecas Necessárias (Arduino IDE)

Instale através do **Gerenciador de Bibliotecas** do Arduino IDE (`Ctrl + Shift + I` ou `Cmd + Shift + I`):

1. **Adafruit SSD1306** (por Adafruit)
2. **Adafruit GFX Library** (por Adafruit)
3. **ArduinoJson** (por Benoit Blanchon — versão 6.x ou 7.x)

*(As bibliotecas `WiFi`, `WebServer`, `DNSServer`, `HTTPClient` e `Preferences` já vêm instaladas junto com o pacote oficial do ESP32).*

---

## ⚙️ Configuração da Placa no Arduino IDE

1. Conecte o cabo USB-C do ESP32-C3 ao computador.
2. Em **Ferramentas > Placa > esp32**, selecione:
   - **ESP32C3 Dev Module**
3. Configure os parâmetros essenciais:
   - **USB CDC On Boot**: `Enabled` *(Obrigatório para o Serial Monitor funcionar no ESP32-C3!)*
   - **Flash Frequency**: `80MHz`
   - **Flash Mode**: `QIO`
   - **Flash Size**: `4MB (32Mb)`
   - **Upload Speed**: `921600` (ou `115200` se apresentar falhas)
   - **Porta**: Selecione a porta COM correspondente ao seu ESP32.

---

## 🚀 Como Funciona o Ciclo de Uso

### 1. Primeiro Boot (Captive Portal)
1. Ao ligar pela primeira vez (sem WiFi gravado), o OLED exibirá:
   - `Conecte no WiFi: UTOME-Setup`
   - `Abra o navegador: 192.168.4.1`
2. Conecte seu celular ou computador na rede WiFi aberta **`UTOME-Setup`**.
3. O portal de configuração abrirá automaticamente no navegador (ou acesse `http://192.168.4.1`):
   - Digite o nome do WiFi da sua casa (**SSID**)
   - Digite a senha do WiFi
   - Digite o **ID do Dispositivo** (gerado previamente na aba *Dispositivo* do dashboard web, ex: `UTOME-7F3A92`)
   - Clique em **"Salvar e Conectar"**.
4. O UTOME grava as credenciais em memória permanente (NVS) e reinicia.

### 2. Modo Companhia (`COMPANION`)
- Conectado ao WiFi de casa, o robô faz handshake com a API (`POST /api/device/connect`) e aparece como **Conectado ●** no painel do responsável.
- O OLED exibe expressões suaves com piscadas calmas espaçadas.
- Ao tocar suavemente no sensor, o robô responde com carinho e sorriso (*"Estou aqui!"*).

### 3. Execução de Rotinas (`ROUTINE_PENDING`)
- Quando o pai/mãe clica para enviar uma tarefa no painel (ex: *"Hora de beber água! 💧"*):
  - O UTOME recebe a tarefa em tempo real.
  - O display OLED exibe o nome da atividade e 3 círculos (`○ ○ ○`).
- A criança confirma a conclusão dando **3 toques físicos** no sensor:
  - 1º toque: `● ○ ○`
  - 2º toque: `● ● ○`
  - 3º toque: `● ● ●` -> Celebração imediata!

### 4. Celebração e Sincronia (`ROUTINE_COMPLETE`)
- O robô celebra visualmente com olhos de estrela e mensagem positiva (*"Você conseguiu!"*).
- Envia o evento para a API (`POST /api/device/events`), registrando a conquista no painel do responsável em tempo real.
- Após 3,5 segundos, retorna suavemente ao Modo Companhia.

### 5. Reset de Fábrica (Trocar de WiFi)
- Para trocar de rede WiFi ou resetar o dispositivo a qualquer momento, basta **manter o dedo pressionado no sensor de toque por 8 segundos contínuos**.
- O OLED avisará *"REDEFININDO... Limpando dados WiFi"*, apagará a memória NVS e reiniciará no modo Captive Portal (`UTOME-Setup`).
