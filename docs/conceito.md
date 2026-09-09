# UTOME Gen 1 — Projeto Completo

> **Tecnologia que acolhe.**

## 1. Visão geral

O **UTOME Gen 1** é um pequeno companheiro robótico acolhedor desenvolvido para oferecer conforto emocional, apoio em rotinas e interações previsíveis para crianças com Transtorno do Espectro Autista (TEA).

O projeto prioriza:

- Previsibilidade
- Baixo estímulo
- Simplicidade
- Acolhimento
- Acessibilidade

O objetivo não é substituir familiares, terapeutas ou profissionais, mas funcionar como um apoio leve e positivo por meio de interações simples e seguras.

---

## 2. Problema

Crianças com TEA podem enfrentar desafios relacionados à sobrecarga sensorial, ansiedade, mudanças de rotina, comunicação emocional e adaptação ao ambiente.

A equipe identificou também que muitas soluções tecnológicas podem ser complexas, caras ou apresentar estímulos excessivos. A proposta do UTOME é criar uma alternativa mais calma, previsível, acessível e humanizada.

---

## 3. Solução

O UTOME Gen 1 combina um dispositivo físico com uma plataforma digital.

A interação básica do robô é:

**Criança toca → sensor detecta → ESP32-C3 processa → UTOME responde visualmente → mensagem/animação positiva → retorno ao estado neutro**

A arquitetura inicial do dispositivo é:

**BOOT → WELCOME → IDLE → TOUCH RESPONSE → POSITIVE FEEDBACK → IDLE**

---

# 4. Funcionalidades do UTOME Gen 1

## 4.1 Interação por toque

Sensores capacitivos TTP223 permitem que a criança interaja com o robô por meio de toques simples.

## 4.2 Feedback visual

O display OLED apresenta expressões, animações e mensagens curtas.

## 4.3 Mensagens positivas

O UTOME poderá apresentar mensagens como:

- "Muito bem!"
- "Você conseguiu!"
- "Estou aqui."
- "Vamos com calma."

## 4.4 Apoio em rotinas

O conceito prevê apoio em atividades como:

- Estudos
- Hidratação
- Alimentação
- Pausas
- Sono
- Escovação dos dentes

## 4.5 Modo calmante

O modo calmante reduz estímulos e coloca o UTOME em um estado mais tranquilo, utilizando animações suaves, linguagem curta e baixa carga visual.

## 4.6 Funcionamento offline

O Gen 1 deve conseguir executar suas funções básicas sem depender da internet.

---

# 5. Hardware

A base de materiais definida para o Gen 1 é:

- ESP32-C3 Super Mini
- Display OLED 128×64 0,96" I2C
- Sensores capacitivos TTP223
- Módulo carregador TP4056
- Bateria recarregável 18650 de 3,7 V
- Chaves mini 1 polo/2 posições

A estrutura física deve proteger os componentes e manter o robô compacto, amigável e adequado à proposta de baixo estímulo.

---

# 6. Identificação única do UTOME

Cada UTOME Gen 1 deverá possuir um **ID único de dispositivo**.

O ID será utilizado para identificar qual robô está conectado à conta/plataforma.

Exemplo:

```text
UTOME-7F3A92
```

ou, preferencialmente, um identificador único gerado pelo próprio dispositivo/sistema.

### Objetivo do ID

O ID permitirá:

- Registrar o dispositivo no site;
- Associar um UTOME a uma conta de responsável;
- Identificar o robô conectado;
- Enviar configurações para o dispositivo;
- Receber informações do dispositivo;
- Permitir futuramente mais de um UTOME por conta;
- Separar os dados de cada dispositivo.

> **Importante:** o ID do dispositivo não deve ser baseado em um valor aleatório recriado a cada inicialização. Ele precisa permanecer estável para que o site reconheça o mesmo UTOME.

---

# 7. Conexão do ESP32-C3 com o site

O **ESP32-C3 Super Mini já fará parte da arquitetura conectada à plataforma digital**.

O dispositivo deverá possuir:

```text
UTOME
  │
  ├── ID único
  │
  ├── ESP32-C3
  │
  ├── Sensores
  │
  └── OLED
       │
       ▼
    Internet
       │
       ▼
     API
       │
       ▼
   Banco de dados
       │
       ▼
      SITE
```

O site não deve identificar o dispositivo apenas pelo nome "UTOME". Ele deverá utilizar o **ID único do dispositivo** como identificador técnico.

---

# 8. Primeiro cadastro do UTOME

No primeiro uso, o responsável poderá acessar o site e entrar na área de dispositivos.

Fluxo planejado:

```text
Criar/entrar na conta
        ↓
Adicionar UTOME
        ↓
Informar ou detectar ID do dispositivo
        ↓
Verificar dispositivo
        ↓
Vincular UTOME à conta
        ↓
UTOME aparece no painel
```

Exemplo:

```text
Adicionar dispositivo

ID do UTOME:
[ UTOME-7F3A92 ]

[ Vincular dispositivo ]
```

Depois do vínculo:

```text
Meu UTOME

UTOME Gen 1
ID: UTOME-7F3A92
Status: Conectado
```

---

# 9. Arquitetura futura de comunicação

A arquitetura completa planejada para a evolução do projeto será:

```text
                    RESPONSÁVEL
                         │
                         ▼
                    SITE / APP
                         │
                         ▼
                       API
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
         BANCO DE DADOS        AUTENTICAÇÃO
              │
              ▼
        DISPOSITIVO UTOME
              │
              ▼
          ESP32-C3
          │   │   │
          │   │   └── OLED
          │   └────── Sensores
          └────────── ID
```

O Gen 1 pode manter suas funções principais offline, enquanto a conectividade permite que o dispositivo seja posteriormente integrado ao ecossistema digital.

---

# 10. Site do UTOME

O site será dividido em duas grandes áreas:

1. **Área pública**
2. **Área do responsável**

---

# 11. Área pública

## 11.1 Início

### Hero

**UTOME**

**Tecnologia que acolhe.**

> Um companheiro robótico desenvolvido para oferecer interações previsíveis, conforto e apoio em rotinas para crianças com TEA.

Botões:

- Conheça o projeto
- Como funciona

---

## 11.2 O problema

Explicará:

- Sobrecarga sensorial
- Mudanças de rotina
- Ansiedade
- Comunicação emocional
- Falta de soluções tecnológicas acessíveis e adequadas à previsibilidade sensorial

---

## 11.3 Nossa solução

Apresentará o UTOME como um companheiro tecnológico acolhedor.

Deve ficar claro que ele:

- Não substitui profissionais;
- Não substitui familiares;
- Atua como apoio complementar;
- Prioriza simplicidade e previsibilidade.

---

## 11.4 Como funciona

Fluxo visual:

```text
Criança
   ↓
Toca no UTOME
   ↓
Sensor TTP223
   ↓
ESP32-C3
   ↓
Processamento
   ↓
Display OLED
   ↓
Resposta visual
   ↓
Estado neutro
```

---

## 11.5 Funcionalidades

Cards para:

- Toque
- Expressões
- Mensagens positivas
- Rotinas
- Modo calmante
- Funcionamento offline

---

# 12. Página Tecnologia

Apresentará a parte técnica do projeto.

### ESP32-C3

Responsável pelo processamento e comunicação do dispositivo.

### OLED

Responsável pelo feedback visual.

### TTP223

Responsável pela detecção de toque.

### TP4056

Responsável pelo gerenciamento da recarga.

### Bateria

Permite funcionamento portátil.

### ID do dispositivo

Responsável pela identificação individual do UTOME na plataforma.

---

# 13. Página STEM

A página demonstrará como o projeto utiliza STEM.

## Ciências

Estudo do TEA, estímulos sensoriais, comportamento, conforto e bem-estar.

## Tecnologia

Programação, sensores, microcontrolador, comunicação e plataforma digital.

## Engenharia

Montagem, integração dos componentes, prototipagem, estrutura física e testes.

## Matemática

Lógica de programação, estados, temporização, consumo energético e organização de dados.

---

# 14. Página Protótipo

Mostrará a evolução:

```text
Pesquisa
   ↓
Definição do problema
   ↓
Conceito
   ↓
Escolha dos componentes
   ↓
Circuito
   ↓
Programação
   ↓
Primeiro protótipo
   ↓
Testes
   ↓
Melhorias
   ↓
UTOME Gen 1
```

Cada etapa poderá apresentar imagens, descrição, dificuldades encontradas e soluções adotadas.

---

# 15. Área do responsável

A área do responsável será o núcleo da futura integração entre site e UTOME.

Após login:

```text
Olá!

Meus dispositivos

┌─────────────────────────┐
│ UTOME Gen 1             │
│ ID: UTOME-7F3A92        │
│ ● Conectado              │
│                         │
│ [Abrir dispositivo]     │
└─────────────────────────┘
```

---

# 16. Dashboard do UTOME

Ao abrir um dispositivo:

```text
UTOME Gen 1

Status: ● Conectado
ID: UTOME-7F3A92

Rotinas de hoje

💧 Hidratação
○ Pendente

📚 Estudos
✓ Concluído

🪥 Escovação
○ Pendente

😴 Sono
○ Pendente
```

O dashboard poderá futuramente permitir personalização das rotinas.

---

# 17. Gerenciamento do dispositivo

O responsável poderá visualizar:

- Nome do UTOME;
- ID;
- Status de conexão;
- Última comunicação;
- Rotinas;
- Configurações;
- Informações do dispositivo.

Exemplo:

```text
Configurações

Nome:
[ UTOME do João ]

ID:
UTOME-7F3A92

Status:
● Online

Modo:
[ Normal ▼ ]

[ Salvar ]
```

---

# 18. Comunicação entre site e UTOME

A comunicação deve ser baseada no ID único.

Exemplo:

```text
Site
 │
 │ comando
 ▼
API
 │
 │ device_id = UTOME-7F3A92
 ▼
Servidor
 │
 ▼
UTOME-7F3A92
```

Quando o UTOME enviar uma informação:

```text
UTOME-7F3A92
       │
       ▼
      API
       │
       ▼
Banco de dados
       │
       ▼
Painel do responsável
```

Assim, o servidor sabe exatamente **qual UTOME enviou ou recebeu determinada informação**.

---

# 19. Banco de dados

A estrutura inicial poderá ser organizada conceitualmente assim:

```text
users
 └── user_id

devices
 ├── device_id
 ├── user_id
 ├── device_name
 ├── status
 └── last_seen

routines
 ├── routine_id
 ├── device_id
 ├── name
 ├── schedule
 └── enabled

events
 ├── event_id
 ├── device_id
 ├── type
 └── timestamp
```

O banco deverá manter os dados separados por usuário e dispositivo.

---

# 20. Segurança

A conexão deverá utilizar autenticação e comunicação segura.

O ID do dispositivo serve para identificação, mas **não deve funcionar sozinho como credencial de acesso**.

A arquitetura deverá separar:

- Identificação do dispositivo;
- Autenticação do usuário;
- Autorização;
- Dados do dispositivo;
- Comunicação com a API.

---

# 21. Demonstração no site

O site poderá possuir uma simulação interativa.

Exemplo:

```text
      ┌─────────────┐
      │   ^     ^   │
      │      ◡      │
      │             │
      └─────────────┘

       [ TOCAR ]
```

Ao clicar:

```text
TOQUE DETECTADO

       😊

"Você conseguiu!"
```

Essa demonstração será apenas uma representação digital do funcionamento do UTOME.

---

# 22. Resultados e testes

Após os testes reais, o site poderá apresentar:

### Teste de toque

- Quantidade de testes;
- Detecções corretas;
- Falhas;
- Tempo de resposta.

### Teste de autonomia

- Duração da bateria;
- Comportamento durante uso.

### Teste de interação

- Facilidade de utilização;
- Compreensão das respostas;
- Observações dos participantes.

**Nenhum resultado deve ser inventado. Os dados serão inseridos somente após os testes.**

---

# 23. Evolução futura

O conceito prevê futuras possibilidades como:

- Aplicativo complementar;
- Personalização de rotinas;
- Modos adaptativos;
- Novos sensores;
- Interações inteligentes;
- IA emocional leve.

Essas funcionalidades devem ser apresentadas como **futuras**, não como recursos já disponíveis no Gen 1.

---

# 24. Fluxo completo do ecossistema

```text
                    CRIANÇA
                       │
                       ▼
                 INTERAGE COM
                    UTOME
                       │
                       ▼
                  SENSOR TTP223
                       │
                       ▼
                   ESP32-C3
                  ╱         ╲
                 ▼           ▼
              OLED        INTERNET
                            │
                            ▼
                           API
                            │
                    ┌───────┴───────┐
                    ▼               ▼
               BANCO DE DADOS    AUTENTICAÇÃO
                    │
                    ▼
                   SITE
                    │
                    ▼
               RESPONSÁVEL
```

---

# 25. Objetivo final do projeto

O objetivo do UTOME Gen 1 é demonstrar que a robótica pode ser utilizada para criar uma tecnologia assistiva acessível, simples e humanizada.

O projeto une:

**Problema real → Pesquisa → STEM → Robótica → Software → Prototipagem → Conectividade → Testes → Impacto social**

O UTOME não busca ser apenas um robô. A proposta é criar um **ecossistema de tecnologia que acolhe**, começando com um dispositivo físico simples e evoluindo futuramente para uma plataforma capaz de conectar responsáveis, rotinas e dispositivos de maneira segura e personalizada.
