# CHANGELOG - Plataforma UTOME

Este documento mantém um registro histórico e técnico de **todas** as alterações notáveis, decisões de arquitetura e progressos no desenvolvimento do projeto UTOME Gen 1.

A formatação segue as diretrizes do [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

> **Convenção de versões**: `[MAJOR.MINOR.PATCH]`
> - MAJOR: mudança de arquitetura significativa
> - MINOR: nova funcionalidade ou seção
> - PATCH: correção de bug, ajuste visual, remoção de estilo

---

## [1.5.0] — 2026-09-10

### Adicionado
- **Hardening de Segurança (OWASP Top 10:2025 / AppSec)**:
  - **Autenticação Obrigatória na API (`Backend/server.js`)**: Middleware `requireAuth` implementado para validar o ID Token do Firebase em `/api/pair/generate`, extraindo o `uid` exclusivamente do token criptográfico e erradicando falhas de BOLA/CWE-306.
  - **Criptografia Segura (CSPRNG) & Rate Limiting (`Backend/server.js`)**: Geração de códigos de pareamento migrada de `Math.random()` para `crypto.randomBytes()`. Adicionada proteção contra força bruta no endpoint `/api/pair/link` (máximo 10 requisições/minuto) e `/api/pair/generate` (5 requisições/minuto).
  - **CORS Restrito (`Backend/server.js`)**: Origens limitadas aos domínios oficiais e ambiente de desenvolvimento local.
  - **Proteção Anti-XSS (`Frontend/html/dashboard.html`)**: Função sanitizadora `escapeHTML` implementada para neutralizar injeções de script persistentes (Stored XSS) nos nomes de rotinas e tarefas.
  - **Controle de Acesso no Realtime Database (`database/database.rules.json`)**: Eliminado o acesso global irrestrito (`auth != null`), aplicando validação rigorosa de propriedade baseada no `owner_uid` de cada dispositivo.
  - **Cabeçalhos de Segurança HTTP (`firebase.json`)**: Adicionados `Content-Security-Policy`, `X-Frame-Options: DENY` (anti-Clickjacking), `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` e `Permissions-Policy` (bloqueio total de câmera/microfone/geolocalização em conformidade com LGPD/COPPA).
  - **Política de Senhas Fortes (`Frontend/html/cadastro.html`)**: Validação client-side para exigir no mínimo 8 caracteres contendo letras e números.

---

## [1.4.0] — 2026-09-10

### Alterado
- **Reorganização Arquitetural de Pastas**:
  - **`Backend/`**: Agora abriga oficialmente o servidor da UTOME API Node.js/Express (`server.js`, `firebase-admin.js`, `package.json`, etc.), eliminando a pasta `db/` que causava ambiguidade de nomenclatura.
  - **`database/`**: Criado diretório exclusivo para as regras e índices de segurança do Firebase (`firestore.rules`, `firestore.indexes.json`, `database.rules.json`).
  - **`firebase.json`**: Atualizados os apontamentos das regras para `database/` e adicionada blindagem no `hosting.ignore` para impedir publicação acidental de chaves de serviço e arquivos de ambiente.
  - **`docs/prompts/`**: Criada subpasta para organizar prompts externos (`corretor.txt`, `segurity.txt`), deixando a raiz da documentação focada nas especificações canônicas do projeto.

---

## [1.3.1] — 2026-09-10

### Corrigido
- **Sintaxe HTML (`index.html`)**: Removida tag de fechamento `</section>` duplicada e órfã após a seção `#painel`.

### Removido
- **Limpeza de Arquivos Redundantes**:
  - `Backend/firebase.txt` (snippet temporário duplicado).
  - `db/.env.example` (arquivo auxiliar dispensável).
  - `docs/termos_de_uso.md` e `docs/politica_de_privacidade.md` (rascunhos em Markdown substituídos oficialmente pelas páginas funcionais `Frontend/html/termos.html` e `Frontend/html/privacidade.html`).

---

## [Unreleased] — Em Desenvolvimento Ativo

---

## [1.3.0] — 2026-09-08

### Adicionado
- **Dashboard do Responsável (`Frontend/dashboard.html`)**: Criada a interface completa da área logada, contendo:
  - **Sidebar de Navegação**: Acesso rápido às abas "Rotinas", "Perfil" e "Dispositivo".
  - **Aba "Rotinas"**: Visão geral de métricas (rotinas ativas, tarefas do dia) e cards de rotinas expansíveis. É possível adicionar novas rotinas, adicionar tarefas dentro delas e visualizar ações como "Enviar" ou "Excluir".
  - **Aba "Perfil"**: Formulários separados para gerenciar os dados do Responsável (nome, telefone) e da Criança (idade, observações/preferências).
  - **Aba "Dispositivo"**: Interface para configurar o UTOME. Inclui um card visual simulando o rosto OLED do robô e seu status de conexão atual, opções para renomear o robô, vincular um ID de hardware (`device_id`) e *toggles* estilo "interruptor" para ativar o **Modo Calmante** e Sons de Celebração.
  - Lógica JavaScript nativa (Vanilla JS) adicionada no próprio arquivo para manipular a alternância de abas, abertura de modais e simulação de salvamento com alertas *Toast*.

---

## [docs-1.1] — 2026-09-08

### Adicionado
- **Modal de Aceite de Termos (`Frontend/index.html`)**: Adicionado um pop-up (modal) que é acionado ao clicar no botão "Criar conta" na seção de CTA.
  - O modal bloqueia a criação da conta até que o usuário marque duas checkboxes obrigatórias confirmando a leitura e o aceite dos Termos de Uso e da Política de Privacidade.
  - O botão "Criar Minha Conta" dentro do modal permanece desabilitado (cinza) até que as condições sejam satisfeitas.
  - Estilos dedicados (`.modal-overlay`, `.modal-content`, `.checkbox-container`) adicionados em `Frontend/css/styles.css`, incluindo foco na acessibilidade e feedback visual claro para os checkboxes marcados (estilo verde "concluído").
  - Lógica JavaScript (`openTermsModal`, `closeTermsModal`, `validateTerms`) adicionada em `Frontend/js/main.js` para manipular o estado do modal e a validação.
- **Páginas HTML de Documentos Legais (`Frontend/termos.html` e `Frontend/privacidade.html`)**: Os documentos em Markdown foram convertidos para páginas HTML dedicadas, mantendo o mesmo padrão visual (estilo Duolingo/3D, Navbar e Footer integrados) para garantir uma experiência de navegação contínua e profissional.
- **Links no Footer e Modal (`Frontend/index.html`)**: Adicionados links diretos para as novas páginas HTML de "Termos de Uso" e "Política de Privacidade" no rodapé do site e dentro das caixas de seleção do modal de aceite.
  - **Política de Privacidade**: Foco rigoroso na privacidade infantil (compatível com LGPD/COPPA). Destaca a ausência de câmeras e gravação de áudio, funcionamento offline e uso restrito do Firebase para sincronização do fluxo (Modo Companhia / Tarefa / Concluída).
  - **Termos de Uso**: Alinhado com o `conceito.md`, define o UTOME como apoio auxiliar (nunca substituto médico ou parental), estabelece que contas só podem ser gerenciadas pelo Responsável Legal e explica as limitações de conexão (Modo Offline).

### Alterado
- **CTA Final (`Frontend/index.html`)**: Substituído o ícone genérico do robô pelo adesivo ilustrativo oficial (`adesivo-4.png`) na chamada para ação "Pronto para conectar seu UTOME?". E o botão "Criar conta" agora abre o modal em vez de redirecionar diretamente.

---

## [1.2.0] — 2026-09-08

### Adicionado
- **Nova Seção "Ciclo do Modo Companhia"** (`#ciclo`): Adicionada uma seção visual completa (logo após "Como Funciona") para explicar o loop de interação aos responsáveis.
  - O layout utiliza 3 cards interligados por setas: **Modo Companhia** (estado padrão calmo), **Tarefa Pendente** (destaque escuro, robô em espera) e **Celebração** (feedback de conquista).
  - Inclui detalhes visuais com checkmarks (Icons8) para as características de cada estado.
  - Adicionada uma nota explicativa de rodapé destacando os benefícios psicológicos da previsibilidade da rotina para crianças com TEA.
- **Novos Estilos CSS** (`Frontend/css/styles.css`): Implementados estilos robustos e responsivos para a nova seção `.section-ciclo`, `.ciclo-card`, `.ciclo-icon` e setas de transição adaptativas (reorganizam de linha para coluna em telas menores).

### Alterado
- **Fluxo do Robô Atualizado**: Na seção "Como Funciona", o fluxo foi ajustado de 4 para 5 passos, encapsulando a interação com o estado inicial e final como "Modo Companhia", reforçando visualmente que o ciclo é contínuo e retorna sempre a um estado calmo.

---

## [docs-1.0] — 2026-09-08

### Documentação
- **`docs/arquitetura.md` — Seção 19 adicionada: Modo Companhia e Ciclo de Rotinas**
  - 19.1 Visão geral do ciclo de estados (diagrama completo)
  - 19.2 Modo Companhia: estado padrão do UTOME quando não há rotina pendente, evolução do `IDLE` do conceito
  - 19.3 Bloqueio por rotina pendente: fluxo completo Site → API → Firebase Realtime DB → ESP32 → OLED
  - 19.4 Confirmação por 3 toques: justificativa do design para TEA, pseudocódigo do firmware
  - 19.5 Confirmação na API: persistência no Firestore (histórico) e Realtime DB (estado em tempo real)
  - 19.6 Comportamento offline: tabela de 4 cenários (online, offline sem/com rotina, reconexão)
  - 19.7 Compatibilidade com conceito.md: tabela cruzando todos os 6 princípios do projeto com o Modo Companhia
  - 19.8 Máquina de estados completa do firmware: `BOOT → WELCOME → COMPANION → ROUTINE_PENDING → ROUTINE_COMPLETE → COMPANION`

### Analise de compatibilidade (conceito.md x proposta)
- Proposta **100% compatível** com o conceito original.
- O Modo Companhia é a evolução natural do estado `IDLE` ja definido em conceito.md.
- Os 3 toques no TTP223 utilizam o hardware ja especificado, sem custo adicional.
- O ciclo respeita todos os principios: previsibilidade, baixo estimulo, simplicidade, acolhimento, feedback positivo e apoio em rotinas.

---

## [1.1.1] — 2026-09-08

### Alterado
- **Navbar**: Removido o texto "UTOME" ao lado da logo. A barra de navegação agora exibe apenas a imagem da logomarca, deixando o design mais limpo e profissional.
- **Footer**: Substituído o texto "UTOME" pela imagem da logomarca oficial (`assets/logo.png`), com fallback para ícone externo caso a imagem não seja encontrada.
- **Seção Protótipo**: Timeline atualizada para refletir o progresso real do projeto. Etapas 01, 02 e 03 marcadas como concluídas (ponto verde). Etapa 04 "Circuito e Programação" marcada como **Em andamento** (badge laranja + animação de pulso). Etapas 05 e 06 marcadas como bloqueadas/futuras (opacidade reduzida).
- **Seção Como Funciona**: Adicionado segundo bloco de fluxo "Plataforma do Responsável" com 4 passos: Responsável entra / **Cria uma rotina** (passo de destaque em fundo escuro) / UTOME recebe / Responsável acompanha. A criação de rotina é destacada visualmente como o passo mais importante.
- **Card Modo Calmante**: O ícone genérico foi substituído pelo adesivo oficial `adesivo-3.png` diretamente no card, com dimensão de 80x80px e sem caixa de ícone.
- **Travessões (em-dashes `—`)**: Todos os travessões presentes nos textos foram substituídos por vírgulas ou reescrita natural das frases, conforme solicitação do usuário.

---



### Adicionado
- **Seção "O Problema"** (`#problema`): Grid de 4 cards explicando sobrecarga sensorial, mudanças de rotina, ansiedade e falta de acesso. Ícones via Icons8 Fluency.
- **Seção "Nossa Solução"** (`#solucao`): Layout de duas colunas com adesivo à esquerda, texto descritivo e lista de diferenciais com ícones de checkmark.
- **Seção "Como Funciona"** (`#como-funciona`): Fluxo visual em 4 passos com numeração em bolha laranja sobreposta, setas de navegação e hover effect.
- **Seção "Funcionalidades"** (`#funcionalidades`): Grid de 6 cards cobrindo Baixo Estímulo, Apoio em Rotinas, Feedback Positivo, Modo Offline, Modo Calmante e Plataforma do Responsável.
- **Seção "Protótipo"** (`#prototipo`): Timeline vertical de 6 etapas (Pesquisa → UTOME Gen 1) com linha conectora e card de destaque na etapa final.
- **Seção "Demo Interativa"** (`#demo`): Simulação do robô em fundo escuro com face OLED (olhos + boca) que reage ao clique do botão "Tocar no UTOME" com mensagens positivas aleatórias.
- **Seção "CTA Final"** (`#painel`): Card de chamada para ação com botões "Criar conta" e "Já tenho conta".
- **Footer completo**: Grid de 3 colunas com brand, links de navegação e copyright.
- **`Frontend/js/main.js`**: Lógica da Demo Interativa com 5 mensagens positivas aleatórias, timeout de 2.5s para retornar ao estado neutro e suporte a navegação por teclado (Enter/Espaço).

### Alterado
- **Animação da imagem hero removida** (`Frontend/css/styles.css`): Removida a animação de flutuação e sombra/borda da classe `.floating-robot` para que adesivos PNG com fundo transparente renderizem corretamente.
- **CSS totalmente reestruturado** (`Frontend/css/styles.css`): Cada seção agora possui bloco de estilos isolado e comentado. Novas variáveis CSS adicionadas (`--primary-light`, `--dark-color`, `--dark-shadow`, `--radius-xl`, etc.).
## [1.1.0] — 2026-09-09

### Adicionado
- **Serviço de Pareamento (API Gen 1)** (`db/`): 
  - Criado o servidor Node.js (Express) independente.
  - Endpoint `POST /api/pair/generate` para criar códigos temporários de 6 caracteres.
  - Endpoint `POST /api/pair/link` preparado para receber conexão e pareamento do hardware (.ino).
  - Integrado mecanismo Cron para deleção automática de códigos após 5 minutos.
  - Dashboard atualizado: A tela agora gera um código dinâmico com temporizador de expiração, substituindo a entrada manual do MAC/ID.

### Alterado
- **Dashboard Refeita do Zero** (`Frontend/html/dashboard.html`): 
  - Layout reconstruído com visual clean, moderno e mais 3D (estilo referência), com sidebar lateral branca e card blocks estruturados.
  - Informações falsas/placeholders foram completamente removidas; o painel agora inicia em estado "vazio" e amigável.
  - Conectividade 100% via Firebase (Firestore e Realtime DB), com gestão real de perfil, criação dinâmica de Rotinas/Tarefas e sincronismo de Device.
  - Lógica do `dashboard.js` foi consolidada num bloco unificado em módulo na própria página, simplificando as importações (e o arquivo antigo `dashboard.js` foi deletado).
  - Atualização real do estado offline/online do Utome e sincronização fidedigna com os estados detalhados na Arquitetura (COMPANION, PENDING).
  - Logo original (completa) reinserida na sidebar do painel.
  - Suporte completo ao upload de Foto de Perfil (Responsável e Criança), com redimensionamento inteligente da foto pelo navegador e salvamento no Firestore via base64, sem consumo do Firebase Storage.

### Corrigido
- **Página de Cadastro** (`cadastro.html`): Corrigido bug (`TypeError: Cannot read properties of null (reading 'value')`) onde a lógica de cadastro buscava o ID `name` em vez de `first-name` e `last-name`. Agora, a submissão interliga os campos Nome e Sobrenome corretamente.

---

## [1.0.1] — 2026-09-08

### Alterado
- **Design System**: Atualização das variáveis CSS para a paleta oficial (Laranja `#F57C00`, Areia `#E6CDAA`, Marrom `#4A1F14`). Fundo aquecido `#FFFCF7`.
- **Interface e Layout**: Visual 3D lúdico (estilo Duolingo): tipografia `Nunito`, sombras sólidas em botões e cards, bordas espessas.
- **Layout Hero & Features**: Estrutura de duas colunas para o Hero e grid de funcionalidades inicial (4 cards).
- **Ícones**: Substituição de emojis por ícones do **Icons8 Fluency** via CDN.

---

## [1.0.0] — 2026-09-08

### Adicionado
- Estrutura base de diretórios: `Frontend/`, `Backend/`, `db/`, `docs/`.
- Documentação inicial `conceito.md` e `arquitetura.md` movidas para `docs/`.
- `Frontend/index.html`: Boilerplate HTML5 com estrutura semântica, tags SEO e placeholders para assets (logo, favicon, adesivos).
- `Frontend/css/styles.css`: CSS Variables (`:root`) com sistema de design base.
- `Frontend/js/main.js`: Setup de evento `DOMContentLoaded`.
- `docs/CHANGELOG.md`: Este arquivo, para registro contínuo do projeto.

### Decisões de Arquitetura (ADR)
- **Frontend Stack**: HTML + CSS + JS puros (Vanilla) — máxima simplicidade de manutenção, zero dependências de framework, performance crua e controle total do visual.
- **Backend Stack**: Firebase (Auth + Firestore + Cloud Functions + Realtime DB) conforme documentado em `docs/arquitetura.md`.
- **Registro Contínuo**: O `CHANGELOG.md` deve ser atualizado a cada alteração de código, servindo como base de conhecimento para mantenedores futuros.
- **Ícones**: Utilizar sempre o padrão **Icons8 Fluency** via CDN — proibido uso de emojis nativos do sistema operacional para garantir consistência visual entre plataformas.

---

*Mantido com rigor técnico para garantir total transparência e transferência de conhecimento no ciclo de vida do UTOME.*
