# Política de Privacidade — UTOME Gen 1

**Última atualização: Setembro de 2026**

A privacidade, a segurança e a proteção dos dados pessoais são princípios fundamentais do **Projeto UTOME**.

O UTOME é uma solução de tecnologia assistiva desenvolvida para oferecer uma interação simples, previsível e de baixo estímulo, especialmente para crianças e pessoas com Transtorno do Espectro Autista (TEA).

Esta Política de Privacidade explica quais informações podem ser coletadas durante o uso do UTOME Gen 1 e de sua plataforma, para quais finalidades essas informações são utilizadas, como são protegidas e quais são os direitos dos usuários.

---

## 1. Nosso compromisso com a privacidade

O UTOME foi projetado seguindo os princípios de **simplicidade, previsibilidade, baixo estímulo, acolhimento e minimização de dados**.

Sempre que possível, coletamos apenas as informações necessárias para o funcionamento da plataforma e do dispositivo.

O **UTOME Gen 1** possui funcionamento local para suas funções essenciais. Isso significa que determinadas interações podem ocorrer diretamente no dispositivo, sem necessidade de conexão com a internet.

O dispositivo também foi projetado sem câmera e sem microfone para gravação ou monitoramento contínuo do ambiente.

---

## 2. Quais dados podemos coletar

### 2.1. Dados do responsável

Para criar e utilizar uma conta na plataforma UTOME, podemos coletar informações necessárias para autenticação e gerenciamento da conta, como:

- Nome;
- Endereço de e-mail;
- Informações necessárias para autenticação da conta;
- Identificadores técnicos relacionados à conta.

A autenticação poderá utilizar o **Firebase Authentication**.

O UTOME não tem acesso à senha em texto simples utilizada pelo usuário. O gerenciamento das credenciais de autenticação é realizado pela infraestrutura de autenticação utilizada pela plataforma.

---

### 2.2. Dados do dispositivo

Cada UTOME possui um identificador exclusivo denominado **`device_id`**.

Esse identificador é utilizado para reconhecer o dispositivo, associá-lo à conta do responsável e permitir que a plataforma saiba qual dispositivo deve receber determinada configuração ou rotina.

Podemos armazenar informações técnicas, como:

- `device_id`;
- Modelo do dispositivo;
- Versão do firmware;
- Estado atual do dispositivo;
- Nível aproximado de bateria;
- Estado de conectividade;
- Data e horário da última comunicação;
- Informações técnicas necessárias para diagnóstico e funcionamento.

---

### 2.3. Dados de interação e rotinas

Quando o responsável utiliza a plataforma para configurar rotinas, determinadas informações poderão ser registradas para permitir o funcionamento e o acompanhamento dessas atividades.

Essas informações podem incluir:

- Tipo de rotina ou tarefa configurada;
- Data e horário programados;
- Estado da rotina, como pendente ou concluída;
- Data e horário de conclusão;
- Eventos técnicos relacionados à execução da rotina.

Quando uma rotina é concluída por meio da interação com o dispositivo, o sistema poderá registrar o evento correspondente.

**Importante:** o UTOME não precisa registrar áudio, vídeo ou imagens da criança para realizar essa função.

---

## 3. Dados que não coletamos

O UTOME Gen 1 não foi projetado para coletar continuamente:

- Áudio do ambiente;
- Gravações de voz;
- Vídeo;
- Fotografias;
- Reconhecimento facial;
- Localização GPS;
- Conteúdo de conversas;
- Dados biométricos.

O dispositivo não possui câmera e não possui microfone destinado à gravação contínua do ambiente.

---

## 4. Como utilizamos os dados

Os dados coletados poderão ser utilizados exclusivamente para finalidades relacionadas ao funcionamento, segurança e evolução do ecossistema UTOME, incluindo:

### 4.1. Funcionamento do dispositivo

Permitir que o responsável configure rotinas e que essas informações sejam disponibilizadas ao UTOME por meio da plataforma.

Também podemos utilizar informações do dispositivo para identificar seu estado de funcionamento e conectividade.

### 4.2. Acompanhamento das rotinas

Permitir que o responsável visualize informações sobre as rotinas configuradas e seus respectivos estados.

### 4.3. Segurança e manutenção

Utilizar informações técnicas e registros de eventos para identificar falhas, problemas de comunicação, erros de software e outras situações que possam comprometer o funcionamento do sistema.

### 4.4. Desenvolvimento e melhoria

Informações técnicas e estatísticas poderão ser utilizadas para melhorar a estabilidade, desempenho, segurança e experiência do UTOME.

Quando informações forem utilizadas para análise estatística ou técnica, adotaremos medidas para reduzir a possibilidade de associação dessas informações a uma pessoa específica sempre que isso for tecnicamente possível e adequado.

---

## 5. Dados relacionados a crianças

O UTOME foi desenvolvido considerando a possibilidade de utilização por crianças.

Por esse motivo, a plataforma deve ser administrada pelo **responsável legal**, que será responsável por criar a conta, configurar o dispositivo, definir as rotinas e controlar o acesso às informações.

O UTOME não tem como finalidade solicitar diretamente à criança informações pessoais, como nome completo, endereço, telefone ou outros dados cadastrais.

Sempre que possível, as informações relacionadas à utilização do dispositivo devem permanecer limitadas ao necessário para o funcionamento das rotinas e recursos escolhidos pelo responsável.

---

## 6. Compartilhamento de dados

O UTOME **não vende, aluga ou comercializa dados pessoais** dos usuários.

Também não utilizamos os dados de rotina para publicidade direcionada ou para criação de perfis comerciais.

Os dados poderão ser processados por fornecedores de infraestrutura tecnológica necessários para a operação da plataforma.

Atualmente, o ecossistema UTOME utiliza serviços da infraestrutura **Google Firebase**, que podem incluir:

- Firebase Authentication;
- Cloud Firestore;
- Firebase Realtime Database;
- Firebase Cloud Functions.

Esses serviços são utilizados para autenticação, armazenamento, comunicação e funcionamento da plataforma.

Os dados também poderão ser disponibilizados quando houver obrigação legal, ordem judicial ou outra hipótese prevista na legislação aplicável.

---

## 7. Armazenamento e segurança

Adotamos medidas técnicas e organizacionais destinadas a proteger os dados contra acesso não autorizado, perda, alteração, divulgação ou destruição indevida.

Entre as medidas utilizadas pelo projeto estão:

- Comunicação segura por HTTPS;
- Regras de segurança para acesso aos dados;
- Autenticação de usuários;
- Associação dos dispositivos às respectivas contas;
- Controle de acesso baseado na conta responsável;
- Identificação exclusiva dos dispositivos por meio do `device_id`;
- Separação entre dados permanentes e informações temporárias do dispositivo;
- Monitoramento de eventos técnicos necessários para segurança e manutenção.

O `device_id` é utilizado para identificação do dispositivo, mas **não deve ser considerado, isoladamente, uma senha ou mecanismo suficiente de autenticação**.

O acesso aos dados da plataforma depende das credenciais e das regras de autorização implementadas pelo sistema.

---

## 8. Onde os dados são armazenados

Os dados da plataforma poderão ser armazenados na infraestrutura do **Google Firebase** e em serviços relacionados utilizados pelo projeto.

Dependendo da configuração e localização dos serviços utilizados, os dados poderão ser processados ou armazenados em servidores localizados fora do Brasil.

Nessas situações, serão observados os requisitos aplicáveis da legislação de proteção de dados.

---

## 9. Retenção dos dados

Os dados serão mantidos pelo período necessário para cumprir as finalidades descritas nesta Política de Privacidade.

O período de armazenamento poderá variar de acordo com o tipo de informação.

Por exemplo:

- Dados da conta: enquanto a conta estiver ativa ou enquanto houver necessidade legítima de manutenção;
- Configurações do dispositivo: enquanto o dispositivo estiver vinculado à conta;
- Histórico de rotinas: enquanto for necessário para disponibilizar o recurso ao responsável ou até sua exclusão;
- Registros técnicos e de segurança: pelo período necessário para diagnóstico, segurança e cumprimento de obrigações legais.

Quando os dados não forem mais necessários e não houver obrigação legal de retenção, poderão ser excluídos ou anonimizados.

---

## 10. Seus direitos

Nos termos da legislação aplicável, especialmente da **Lei Geral de Proteção de Dados Pessoais (LGPD)**, o titular dos dados possui direitos relacionados ao tratamento de seus dados pessoais.

Dependendo da situação, esses direitos podem incluir:

- Confirmar a existência de tratamento de dados;
- Solicitar acesso aos dados;
- Solicitar correção de dados incompletos, inexatos ou desatualizados;
- Solicitar a exclusão de dados pessoais, quando aplicável;
- Solicitar informações sobre o tratamento dos dados;
- Solicitar informações sobre compartilhamento de dados;
- Revogar consentimentos, quando o tratamento estiver baseado em consentimento;
- Solicitar a portabilidade dos dados, quando aplicável;
- Solicitar a revisão de determinadas decisões automatizadas, quando aplicável.

Alguns direitos podem estar sujeitos às limitações previstas na legislação.

---

## 11. Exclusão da conta e dos dados

O responsável poderá solicitar a exclusão de sua conta e dos dados associados a ela.

Quando a exclusão for realizada, os dados vinculados à conta e ao dispositivo serão removidos ou anonimizados, salvo quando a manutenção de determinadas informações for necessária para cumprimento de obrigação legal, exercício regular de direitos ou outra hipótese prevista na legislação.

A exclusão de uma conta também poderá resultar na desvinculação do respectivo UTOME.

---

## 12. Uso offline

Uma das características do UTOME Gen 1 é a possibilidade de funcionamento local.

Quando o dispositivo estiver sem conexão com a internet, suas funções essenciais que não dependem da plataforma poderão continuar funcionando diretamente no ESP32-C3.

Quando a conexão estiver disponível, informações necessárias para sincronização poderão ser enviadas à plataforma.

Dessa forma, a ausência temporária de internet não deve impedir necessariamente o funcionamento básico do dispositivo.

---

## 13. Alterações nesta Política de Privacidade

Esta Política de Privacidade poderá ser atualizada para refletir mudanças no projeto, nos recursos da plataforma, nas tecnologias utilizadas ou na legislação aplicável.

Quando houver alterações relevantes, a nova versão será disponibilizada na plataforma, acompanhada da respectiva data de atualização.

Recomendamos que o responsável consulte periodicamente esta página para verificar a versão mais recente.

---

## 14. Contato

Caso tenha dúvidas sobre esta Política de Privacidade, sobre o tratamento de dados ou sobre o funcionamento do UTOME, entre em contato por meio do canal oficial de suporte do projeto.

**Projeto UTOME**  
**Tecnologia que acolhe.**

E-mail de contato: **alejandrothalysonpg@gmail.com**

---

**Última atualização:** Setembro de 2026