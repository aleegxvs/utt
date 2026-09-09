# Arquitetura da Plataforma UTOME

> **Tecnologia que acolhe.**

## 1. Visão geral

A plataforma do **UTOME** será um ecossistema conectado no qual o site/aplicativo, a API e os dispositivos UTOME utilizam uma infraestrutura centralizada.

As funções básicas do UTOME Gen 1 devem continuar simples e previsíveis. O dispositivo deve continuar funcionando localmente mesmo sem internet.

```text
SITE / APLICATIVO
        |
        v
   UTOME API
        |
   +----+----------------+
   v                     v
FIREBASE             DISPOSITIVOS
                     ESP32-C3
```

## 2. Tecnologias da plataforma

- **Firebase Authentication** — autenticação dos responsáveis
- **Cloud Firestore** — banco de dados principal
- **Firebase Cloud Functions** — API única do UTOME
- **Firebase Realtime Database** — estado e comunicação em tempo real
- **HTTPS** — comunicação segura
- **device_id** — identificação única de cada UTOME

Tecnologias adicionais poderão ser incorporadas conforme a evolução do projeto.

## 3. Firebase Authentication

Será responsável pela autenticação dos responsáveis.

Cada conta terá um identificador único (`uid`), usado para relacionar o usuário aos seus dispositivos.

Possíveis métodos:

- E-mail e senha
- Google
- Microsoft

## 4. Cloud Firestore

Será o banco de dados principal para informações permanentes.

Estrutura conceitual:

```text
users
├── uid
├── nome
└── configurações

devices
├── device_id
├── owner_uid
├── nome
├── modelo
├── firmware
└── criado_em

routines
├── routine_id
├── device_id
├── nome
├── horário
└── ativa

events
├── event_id
├── device_id
├── tipo
└── timestamp
```

Usos principais:

- Usuários
- Dispositivos
- Rotinas
- Configurações
- Eventos
- Histórico

## 5. Firebase Cloud Functions — API única

As **Firebase Cloud Functions** serão utilizadas para construir a **API única do UTOME**.

Em vez de cada parte do sistema acessar diretamente todos os recursos do Firebase, a API funcionará como camada intermediária.

```text
SITE ---------+
              |
ESP32-C3 -----+----> UTOME API ----> Firebase
              |
FUTURO APP ---+
```

A API será responsável por:

- Autenticação e autorização
- Registro de dispositivos
- Associação de dispositivos às contas
- Verificação de `device_id`
- Status dos dispositivos
- Configurações
- Rotinas
- Eventos
- Comunicação entre plataforma e dispositivo

## 6. Firebase Realtime Database

Será utilizado para informações que precisam ser atualizadas rapidamente.

Exemplo:

```text
devices/
└── UTOME-7F3A92/
    ├── online: true
    ├── last_seen: ...
    ├── state: "IDLE"
    └── battery: 78
```

Pode armazenar:

- Estado atual do UTOME
- Status online/offline
- Última comunicação
- Informações temporárias
- Estado atual da bateria

### Firestore

```text
Usuários
Dispositivos
Rotinas
Configurações
Eventos
Histórico
```

### Realtime Database

```text
Estado atual
Online/offline
Última comunicação
Dados temporários
```

## 7. Identificação única dos dispositivos

Cada UTOME terá um **`device_id` único e permanente**.

Exemplo:

```text
UTOME-7F3A92
```

Exemplo de dispositivos:

```text
devices
├── UTOME-7F3A92
├── UTOME-A82B11
└── UTOME-C91D44
```

Cada dispositivo poderá ser associado a uma conta:

```text
Usuário
├── UTOME-7F3A92
└── UTOME-A82B11
```

A arquitetura deve permitir futuramente que uma conta possua mais de um UTOME.

## 8. Regra importante do device_id

O `device_id` serve para **identificar** o dispositivo, mas não deve funcionar sozinho como credencial de segurança.

A arquitetura deverá utilizar:

```text
device_id
    +
credencial/token do dispositivo
    +
HTTPS
    |
    v
UTOME API
```

Para responsáveis:

```text
Conta
  |
Firebase Authentication
  |
UID + token
  |
UTOME API
```

A API deverá verificar se o usuário tem autorização para acessar determinado `device_id`.

## 9. Comunicação do ESP32-C3

O ESP32-C3 Super Mini será conectado à plataforma por Wi-Fi quando houver internet disponível.

```text
ESP32-C3
    |
    | HTTPS
    v
UTOME API
    |
    v
Firebase
```

O ESP32 enviará seu `device_id` juntamente com as informações necessárias para autenticação e comunicação.

Exemplo conceitual:

```json
{
  "device_id": "UTOME-7F3A92",
  "firmware": "1.0.0"
}
```

Resposta conceitual:

```json
{
  "success": true,
  "device_id": "UTOME-7F3A92",
  "status": "connected"
}
```

## 10. Cadastro de um UTOME

Fluxo inicial:

```text
ESP32-C3 recebe device_id
            |
            v
       UTOME é ligado
            |
            v
Responsável cria/entra na conta
            |
            v
      Adicionar UTOME
            |
            v
     Informar/verificar ID
            |
            v
       API verifica
            |
            v
    Dispositivo é vinculado
            |
            v
UTOME aparece no painel
```

## 11. API única

A API será centralizada em uma única plataforma.

Estrutura conceitual:

```text
/api
├── auth
├── devices
│   ├── register
│   ├── connect
│   ├── status
│   └── settings
├── routines
├── events
└── health
```

Operações previstas:

```text
POST /api/device/register
POST /api/device/connect
GET  /api/device/status
GET  /api/device/config
POST /api/device/events

GET    /api/routines
POST   /api/routines
PUT    /api/routines
DELETE /api/routines

GET /api/health
```

Os caminhos exatos poderão ser ajustados durante a implementação.

## 12. Endpoint de saúde

A API deverá possuir um endpoint para verificar se o serviço está funcionando:

```text
GET /api/health
```

Resposta conceitual:

```json
{
  "status": "ok",
  "service": "UTOME API",
  "version": "1.0.0"
}
```

## 13. Funcionamento offline

A conectividade não deve ser requisito para o funcionamento básico do UTOME Gen 1.

Com internet:

```text
UTOME
  |
Wi-Fi
  |
UTOME API
  |
Firebase
```

Sem internet:

```text
UTOME
  |
ESP32-C3
  |
FUNCIONAMENTO LOCAL
```

As funções essenciais do dispositivo continuarão sendo executadas localmente.

## 14. Arquitetura completa

```text
                         RESPONSÁVEL
                              |
                              v
                       SITE / APLICATIVO
                              |
                              v
                         UTOME API
                     Firebase Functions
                              |
              +---------------+---------------+
              v               v               v
        Firebase Auth     Firestore      Realtime DB
              |               |               |
              +---------------+---------------+
                              |
                              v
                         ESP32-C3
                              |
                    +---------+---------+
                    v                   v
               device_id             Wi-Fi
                                        |
                                        v
                                  UTOME API
```

## 15. Segurança

A plataforma deverá utilizar:

- HTTPS
- Firebase Authentication
- Tokens de autenticação
- Regras de autorização
- Identificação por `device_id`
- Credencial própria para dispositivos
- Separação dos dados por usuário
- Validação de requisições na API

O sistema deve impedir que um usuário acesse ou controle um UTOME pertencente a outra conta.

## 16. Evolução futura

A arquitetura deve permitir a inclusão de novas tecnologias sem reconstruir todo o sistema.

Possibilidades:

- Aplicativo complementar
- Firebase Cloud Storage
- Firebase Cloud Messaging
- Personalização avançada
- Novos sensores
- Novos modelos de UTOME
- Modos adaptativos
- IA emocional leve
- Mais de um dispositivo por usuário

## 17. Stack oficial

### Essencial

- **Firebase Authentication** — autenticação
- **Cloud Firestore** — banco de dados principal
- **Firebase Cloud Functions** — API única do UTOME
- **Firebase Realtime Database** — estado e comunicação em tempo real
- **HTTPS** — comunicação segura
- **device_id** — identificação única dos dispositivos

### Futuro

- **Firebase Cloud Storage** — arquivos e mídias
- **Firebase Cloud Messaging** — notificações
- **Firebase Analytics** — métricas, se necessárias e compatíveis com os requisitos de privacidade

## 18. Princípios da arquitetura

### Simplicidade

O Gen 1 deve possuir uma arquitetura simples o suficiente para ser desenvolvida, testada e mantida pela equipe.

### Previsibilidade

O dispositivo deve continuar funcionando localmente e suas interações devem permanecer consistentes.

### Escalabilidade

A estrutura deve permitir que o UTOME evolua de um protótipo para uma plataforma com múltiplos dispositivos, contas, rotinas e futuras versões.

## Resumo

A plataforma do UTOME será baseada em um **ecossistema Firebase**, mas não será simplesmente o site conectado diretamente ao Firebase.

A arquitetura principal será:

**Firebase Authentication + Firestore + Cloud Functions (API única) + Realtime Database + HTTPS + device_id**

O **ESP32-C3 Super Mini** será um dispositivo identificado individualmente e poderá se comunicar com a API através de seu `device_id`, mantendo suas funções essenciais disponíveis mesmo sem internet.

---

## 19. Modo Companhia e Ciclo de Rotinas

> Esta seção define o fluxo principal de interação entre o dispositivo UTOME, o responsável e a criança.

### 19.1 Visão geral do ciclo

O UTOME Gen 1 opera em dois estados principais alternados:

```text
[MODO COMPANHIA]  <--------------------+
       |                               |
       | Responsável cria rotina       |
       v                               |
[ROTINA PENDENTE]                      |
(Modo Companhia bloqueado)             |
       |                               |
       | Criança dá 3 toques           |
       v                               |
[TAREFA CONCLUIDA]                     |
       |                               |
       | Feedback positivo             |
       +-------------------------------+
```

### 19.2 Modo Companhia

O **Modo Companhia** é o estado padrão do UTOME quando nenhuma rotina está pendente.

Características:
- O UTOME exibe animações leves, expressões amigáveis e responde livremente ao toque da criança
- Corresponde à evolução do estado `IDLE` definido no `conceito.md` (`BOOT → WELCOME → IDLE → TOUCH RESPONSE → POSITIVE FEEDBACK → IDLE`)
- Não exige nenhuma ação da criança: o robô apenas acompanha, transmite presença e tranquilidade
- Prioriza o **baixo estímulo sensorial** e a previsibilidade, princípios centrais do projeto

### 19.3 Bloqueio por rotina pendente

Quando um responsável cria uma tarefa pela plataforma web:

1. O site envia a rotina para a **UTOME API**
2. A API grava o estado `routine_pending: true` no **Firebase Realtime Database** do dispositivo
3. O ESP32-C3 detecta a mudança de estado via polling ou push (conforme implementação do firmware)
4. O UTOME transita do Modo Companhia para o **Modo Rotina Pendente**

Comportamento no Modo Rotina Pendente:
- O display exibe a tarefa definida pelo responsável (ex.: "Hora de beber água!", "Hora de estudar!")
- Animações livres e respostas ao toque aleatório ficam suspensas
- O UTOME aguarda a confirmação da criança

```text
Responsável (Site)
      |
      | POST /api/routines  { device_id, task, ... }
      v
  UTOME API
      |
      v
Firebase Realtime DB
      |
      | devices/UTOME-XXXXX/state: "ROUTINE_PENDING"
      | devices/UTOME-XXXXX/task: "Beber água"
      v
  ESP32-C3 detecta
      |
      v
OLED exibe a tarefa
```

### 19.4 Confirmação por 3 toques

A criança confirma a conclusão da tarefa dando **3 toques consecutivos** no sensor TTP223.

Justificativa do design:
- 3 toques é simples, previsível e inequívoco — evita confirmações acidentais por um único toque
- Mantém a interação física, tátil e direta, sem necessidade de voz, texto ou tela complexa
- Respeita o ritmo e a capacidade motora de crianças com TEA
- O número de toques pode ser ajustado futuramente por configuração no painel do responsável

Fluxo de confirmação no firmware (ESP32-C3):

```text
touch_count = 0

ao detectar toque:
    touch_count += 1

    se touch_count == 3:
        → confirmar tarefa
        → POST /api/device/events { type: "routine_complete", device_id }
        → exibir POSITIVE FEEDBACK no OLED
        → aguardar 3s
        → retornar ao MODO COMPANHIA
        → touch_count = 0
```

### 19.5 Confirmação na API e no painel

Ao receber o evento `routine_complete`:

```text
ESP32-C3
    |
    | POST /api/device/events
    | { device_id, type: "routine_complete", routine_id, timestamp }
    v
UTOME API
    |
    +---> Firestore: events (histórico permanente)
    |
    +---> Realtime DB: devices/UTOME-XXXXX/state: "COMPANION"
    |                  devices/UTOME-XXXXX/last_routine_complete: timestamp
    |
    +---> Painel do responsável atualiza em tempo real
```

O painel do responsável exibe o status da rotina como **Concluída** com o horário exato.

### 19.6 Comportamento offline

O UTOME não depende de internet para o ciclo de rotinas:

| Situação | Comportamento |
|---|---|
| Online | Recebe rotinas em tempo real via Realtime DB; envia confirmações imediatamente |
| Offline — sem rotina pendente | Opera normalmente no Modo Companhia |
| Offline — com rotina pendente (sincronizada antes) | Exibe a tarefa e aguarda 3 toques; armazena o evento de confirmação localmente |
| Reconectado após confirmação offline | Envia o evento armazenado à API retroativamente |

### 19.7 Compatibilidade com conceito.md

| Princípio do conceito | Como o Modo Companhia atende |
|---|---|
| **Previsibilidade** | O ciclo de estados é sempre o mesmo: Companhia → Tarefa → 3 toques → Feedback → Companhia |
| **Baixo estímulo** | O Modo Companhia é calmo, sem alertas sonoros ou piscadas agressivas |
| **Simplicidade** | A criança não precisa de leitura, voz ou tela complexa — apenas tocar 3 vezes |
| **Acolhimento** | O robô celebra a conclusão da tarefa com expressão positiva no OLED |
| **Apoio em rotinas** | É exatamente o mecanismo que viabiliza hidratação, estudos, escovação, etc. |
| **Feedback positivo** | A animação de celebração reforça positivamente o comportamento desejado |

### 19.8 Estados do firmware (máquina de estados)

```text
BOOT
  |
  v
WELCOME
  |
  v
COMPANION  <-----------------+
  |                          |
  | (rotina recebida)        |
  v                          |
ROUTINE_PENDING              |
  |                          |
  | (3 toques detectados)    |
  v                          |
ROUTINE_COMPLETE             |
  |                          |
  | (após feedback OLED)     |
  +-------------------------+
```
