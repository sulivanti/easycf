**EasyCodeFramework (ECF)**

Documento de Projeto --- Engenharia Reversa

  ----------------------- -----------------------------------------------
  **Versão**              1.0 --- Março 2026

  **Status**              RASCUNHO (Para Revisão)

  **Owner**               Arquitetura

  **Módulos**             MOD-000 (Foundation), MOD-001 (Backoffice
                          Admin), MOD-002 (Cadastro Usuários)

  **Sub-histórias**       17 Features (MOD-000-F01--F17) + 3 Features
                          (MOD-001-F01--F03)

  **Base normativa**      DOC-DEV-001, DOC-GNP-00, DOC-ESC-001,
                          DOC-ARC-001/002/003, SEC-000-01, LGPD
  ----------------------- -----------------------------------------------

*Gerado por engenharia reversa a partir das User Stories e Features
existentes*

**1. Visão Geral do Projeto**

**1.1 Propósito**

O EasyCodeFramework (ECF) é um framework de automação e geração de
código voltado para a construção de aplicações B2B com arquitetura
multi-tenant, RBAC granular, rastreabilidade E2E (correlação UI → API →
Domain Events) e conformidade com padrões normativos internos. O
objetivo é que todo código scaffoldado pelo framework nasça
automaticamente conforme, sem necessidade de correções manuais de
padrão.

**1.2 Arquitetura de Alto Nível**

O projeto é organizado em módulos independentes, cada um com seu épico
balizador (User Story de governança) e suas sub-histórias de
funcionalidade. A hierarquia é:

-   MOD-000 --- Foundation: núcleo de autenticação, autorização,
    multi-tenant, observabilidade e infraestrutura compartilhada

-   MOD-001 --- Backoffice Admin: primeiro módulo de negócio, abordagem
    UX-First com Screen Manifests YAML

-   MOD-002 --- Cadastro de Usuários: módulo de onboarding e gestão de
    identidades

-   MOD-00N --- Módulos futuros: construídos sobre a fundação MOD-000

**1.3 Princípios Arquiteturais Fundamentais**

-   OpenAPI como única fonte de verdade do contrato HTTP (Spectral lint
    no CI)

-   X-Correlation-ID obrigatório em todas as requisições e domain events

-   RFC 9457 (Problem Details) para todas as respostas de erro

-   Soft-delete obrigatório --- hard deletes proibidos em dados
    faturáveis/auditáveis

-   Redis apenas como broker (BullMQ) e cache efêmero --- proibido como
    banco primário

-   Idempotência via middleware central (@easycf/core-api/idempotency)
    em todas as rotas de mutação

-   Taxonomia canônica: campo \`codigo\` para identificadores amigáveis;
    enum textual para status

-   Auditoria via tabela domain_events --- única fonte de eventos, sem
    tabelas de log exclusivas

**2. Base Normativa do Projeto**

Todos os geradores, agentes COD e desenvolvedores devem tratar os
documentos abaixo como lei do projeto. Qualquer divergência exige ADR
documentada.

  -------------------------------------------------------------------------------
  **Código**       **Documento**             **Papel**
  ---------------- ------------------------- ------------------------------------
  DOC-DEV-001      Especificação Executável  Base normativa principal; DoR/DoD,
                   / Golden Path             estados de item, rastreabilidade

  DOC-GNP-00       Guia Normativo e Padrões  Regras MUST/SHOULD/MAY; DX,
                                             CLI/scaffolding, boilerplate
                                             obrigatório

  DOC-ESC-001      Escala de Arquitetura     Gate de complexidade; nivela
                   0/1/2                     decisões arquiteturais e gatilhos de
                                             ADR

  DOC-GPA-001      Guia Padrão de Agente     Contrato de agentes COD/DEV; saídas
                                             estruturadas e validações mínimas

  DOC-ARC-001      Padrões OpenAPI/Swagger   OpenAPI como fonte de verdade do
                                             contrato HTTP; Spectral lint

  DOC-ARC-002      Estratégia de Testes      Pirâmide de testes; cobertura
                                             mínima; testes de contrato

  DOC-ARC-003      Ponte de Rastreabilidade  operationId ↔ action UI ↔
                   UI ↔ API ↔ Domain         correlation_id ↔ domain_event

  DOC-UX-010       Catálogo de               Actions de UI mapeadas para
                   Ações/Telemetria de UI    operationIds

  DOC-UX-011       Application Shell e       Regras mandatórias para Sidebar,
                   Navegação                 Header, Breadcrumbs, Dashboard

  DOC-UX-012       Componentes Globais e     Busca Global, Preferences e
                   Feedback                  interceptação RFC 9457 para Toasts

  DOC-PADRAO-001   Infraestrutura e Execução Docker/Node/pnpm; fail-fast de envs

  DOC-PADRAO-002   Dependências NodeJS       Versões e libs permitidas

  DOC-PADRAO-004   Variáveis de Ambiente     Padrão de validação em boot

  DOC-PADRAO-005   Armazenamento em Storage  Uploads via presigned URLs
                                             universalizadas

  SEC-000-01       Segurança e Controles de  User enumeration prevention, bcrypt,
                   Acesso                    rate limiting, RBAC

  LGPD-BASE-001    Conformidade LGPD         Tratamento de dados pessoais, PII em
                                             logs, consentimento
  -------------------------------------------------------------------------------

**3. MOD-000 --- Foundation (Épico Balizador)**

**Versão:** 0.8.0

**Status:** DRAFT → Aguardando aprovação

**Owner:** Arquitetura

**Nível Arquitetural:** 2 (DDD completo --- domain events, sessão em
banco, kill-switch, multi-tenant)

**Sub-histórias:** F01 a F17 (17 features)

**3.1 Contexto e Problema**

O framework possui um conjunto robusto de documentos normativos que
definem padrões obrigatórios, mas sem uma User Story canônica que amarre
esses documentos como fonte de verdade para geração automática de
código. Sem essa governança, geradores podem divergir dos padrões, PRs
podem ter contratos fora do padrão e novos desenvolvedores atuam sem
guardrails formais.

**3.2 Regras Críticas do MOD-000**

-   Proibido inventar padrão fora dos normativos --- qualquer
    divergência exige ADR

-   OpenAPI é fonte de verdade do contrato HTTP --- deve ser
    sincronizado na mesma mudança

-   Correlation ID e ponte UI/API/Domain são obrigatórios em todos os
    endpoints

-   Estratégia de testes: unit sem I/O; integração com DB real efêmero;
    contract test contra OpenAPI

-   Contrato de agentes: saídas estruturadas/parseáveis conforme
    DOC-GPA-001

-   Edições manuais proibidas em artefatos gerados por automação (pasta
    04_modules/)

-   Redis: apenas broker de filas (BullMQ) e mecanismos efêmeros ---
    proibido como banco primário

-   Soft-delete obrigatório: hard deletes diretos proibidos em dados
    faturáveis/auditáveis

-   Idempotência: toda rota de mutação com Idempotency-Key DEVE usar
    middleware central

-   Taxonomia: campo \`codigo\` para identificador amigável; enum
    ACTIVE/BLOCKED/INACTIVE para status

**3.3 Ciclo de Aprovação em Cascata**

A aprovação do épico US-MOD-000 é pré-requisito obrigatório para que
qualquer sub-história F01--F17 possa ter código scaffoldado. As
automações forge-module e create-amendment são bloqueadas enquanto o
épico não estiver com status APPROVED.

**3.4 OKRs do MOD-000**

  -----------------------------------------------------------------------------
  **\#**   **Métrica**                      **Baseline**   **Alvo**
  -------- -------------------------------- -------------- --------------------
  OKR-1    \% endpoints gerados com         0%             100%
           OpenAPI + operationId +                         
           correlation_id                                  

  OKR-2    \% sub-histórias (F01--F17)      0%             100%
           aprovadas sem violação CI                       
           normativa                                       

  OKR-3    Tempo de detecção de divergência Manual         Automático (\<5 min)
           normativa (CI gate)              (\~dias)       

  OKR-4    Nº de ADRs abertas sem           N/A            0
           responsável e prazo                             
  -----------------------------------------------------------------------------

**3.5 Sub-Histórias do MOD-000**

  -----------------------------------------------------------------------------
  **ID**   **Tema**                                      **Status**   **Nível
                                                                      Arq.**
  -------- --------------------------------------------- ------------ ---------
  F01      Autenticação Nativa (Login, Logout, Sessões,  DRAFT        2
           Kill-Switch, Refresh)                                      

  F02      MFA / TOTP (Google Authenticator, Authy ---   DRAFT        2
           RFC 6238)                                                  

  F03      SSO OAuth2 --- Google + Microsoft / Azure AD  DRAFT        2

  F04      Recuperação de Senha (Forgot / Reset ---      DRAFT        1
           token UUID, TTL 1h)                                        

  F05      Gestão de Usuários (CRUD + Soft Delete +      DRAFT        1
           Auto-Registro)                                             

  F06      Roles / RBAC por Escopos                      DRAFT        2
           (módulo:recurso:ação + cache Redis)                        

  F07      Filiais Multi-Tenant (CRUD + Soft Delete +    DRAFT        2
           Bloqueio)                                                  

  F08      Perfil do Usuário Autenticado (/auth/me +     DRAFT        1
           edição)                                                    

  F09      Vinculação Usuário-Filial com Role            DRAFT        2
           (tenant_users + RBAC completo)                             

  F10      Alteração de Senha Autenticada (Minha Conta → DRAFT        2
           /auth/change-password)                                     

  F11      Endpoint GET /info (Versão e Metadados do     DRAFT        0
           Sistema)                                                   

  F12      Catálogo de Permissões --- CRUD de escopos    DRAFT        2
           pré-definidos (integridade RBAC)                           

  F13      Utilitário de Telemetria UI                   DRAFT        1
           (UIActionEnvelope)                                         

  F14      Middlewares de Correlação E2E (CorrelationId  DRAFT        1
           Middleware)                                                

  F15      Motor de Gates de Pipeline CI (Screen         DRAFT        0
           Manifests Validator)                                       

  F16      Módulo de Storage e Upload Centralizado       DRAFT        1
           (Presigned URLs)                                           

  F17      Login via Sign in with Apple (Apple ID ---    DRAFT        2
           OIDC/JWKS)                                                 
  -----------------------------------------------------------------------------

**3.5.1 F01 --- Autenticação Nativa com E-mail, Senha e Gerenciamento de
Sessão**

**Referências:** DOC-DEV-001 §4.1 (FR), §4.4 (SEC), §5.3 (API) \| SEC-000-01
\| DOC-ARC-001

**Nível:** 2 (DDD --- domain events, sessão em banco, kill-switch)

**Contexto**

Formaliza os requisitos da implementação de autenticação existente em
apps/api/src/modules/auth/auth.routes.ts. O modelo de sessão NÃO é
stateless puro --- o JWT carrega um sessionId validado em banco a cada
requisição, permitindo Kill-Switch imediato.

**Endpoints**

  ------------------------------------------------------------------------------
  **Método**   **Rota**              **Descrição**
  ------------ --------------------- -------------------------------------------
  POST         /auth/login           Login com e-mail/senha; suporte a MFA e
                                     remember_me

  POST         /auth/logout          Logout --- revoga sessão atual
                                     (isRevoked=true)

  GET          /auth/me              Perfil + filiais vinculadas do usuário
                                     autenticado

  GET          /auth/sessions        Lista sessões ativas do usuário

  DELETE       /auth/sessions/:id    Kill-Switch individual de sessão

  DELETE       /auth/sessions        Kill-Switch global --- revoga todas as
                                     sessões

  POST         /auth/refresh         Renova access_token via cookie refreshToken
  ------------------------------------------------------------------------------

**TTL de Sessão**

  -------------------------------------------------------------------------
  **Modo**           **remember_me**    **TTL da Sessão** **TTL do JWT**
  ------------------ ------------------ ----------------- -----------------
  Sessão Normal      false (padrão)     12 horas          12h

  Sessão Estendida   true               30 dias           30d
  -------------------------------------------------------------------------

**Regras Críticas**

-   User Enumeration Prevention: resposta de login sempre genérica;
    actorId=undefined em falhas

-   Kill-Switch em Banco: sessionId no JWT validado no banco a cada
    request

-   Rate Limiting: 10 tentativas / 15 min / IP → 429 RFC 9457 com
    retry_after

-   Cookies httpOnly: accessToken (path=/) e refreshToken
    (path=/api/v1/auth/refresh), sameSite=lax

-   Auditoria obrigatória: auth.login.success/failure/blocked,
    auth.logout.success, auth.session.revoked

-   Desvio MFA: se mfa_secret preenchido → emite apenas temp_token
    (escopo mfa-only, TTL 5min)

-   Idempotência em POST /auth/login: Idempotency-Key com cache 30s
    previne sessões duplicadas

**3.5.2 F02 --- MFA / TOTP (RFC 6238)**

**Referências:** DOC-DEV-001 §5.3, §8.2 \| SEC-000-01 \| RFC 6238 \|
DOC-ARC-001

**Nível:** 2 (temp_token com escopo restrito, domain events de sessão)

**Fluxo**

Etapa 1 (F01): POST /auth/login → se mfa_secret presente → retorna
{mfa_required: true, temp_token, expires_in: 300}.

Etapa 2 (F02): POST /auth/mfa/verify {temp_token, totp_code} → valida
TOTP RFC 6238 (otplib, HMAC-SHA1, janela 30s) → cria UserSession → emite
access_token + refresh_token definitivos.

**Regras Críticas**

-   temp_token com escopo \'mfa-only\' e TTL 5min --- backend valida
    sessionScope antes de processar

-   Após 5 tentativas inválidas com o mesmo temp_token → revogação e
    obrigação de reiniciar login

-   Resposta de sucesso idêntica ao login nativo (F01) --- frontend não
    diferencia os fluxos

-   causation_id no evento auth.mfa.success rastreia cadeia login→MFA

**3.5.3 F03 --- SSO OAuth2 (Google + Microsoft / Azure AD)**

**Referências:** DOC-DEV-001 §4.2 \| INT-000-01 (Google) \| INT-000-02
(Microsoft) \| DOC-ARC-001

**Nível:** 2 (integração externa OAuth2, auto-provisionamento, domain
events)

**Estratégia de Auto-Provisionamento**

-   Vinculação exclusiva por e-mail --- se já existe, conta é
    reutilizada (sem criar duplicata)

-   passwordHash: \'SSO_GOOGLE_NO_PASSWORD\' ou
    \'SSO_MICROSOFT_NO_PASSWORD\' --- nunca exposto na API

-   avatarUrl: apenas Google fornece picture; Microsoft → avatarUrl =
    null

-   Auditoria diferenciada: primeiro acesso (.register) vs. subsequentes
    (.login)

-   Usuário BLOCKED: auto-provisionamento não reativa contas; redirect
    para erro

-   Sem MFA no fluxo SSO Fase 1 --- segurança de 2º fator é
    responsabilidade do provider

**Variáveis de Ambiente Obrigatórias**

GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URI,
MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_CALLBACK_URI,
FRONTEND_URL

**3.5.4 F04 --- Recuperação de Senha por E-mail**

**Referências:** DOC-DEV-001 §5.1 \| SEC-000-01 \| DOC-ARC-001 \|
DOC-PADRAO-004

**Nível:** 1 (token de reset em banco, MailService, anti-enumeration)

Implementa o fluxo Forgot Password / Reset Password com token UUID de
TTL 1 hora. A resposta do endpoint POST /auth/forgot-password é sempre a
mesma independente de o e-mail existir ou não (user enumeration
prevention). O token é invalidado após o primeiro uso.

**3.5.5 F05 --- Gestão de Usuários (CRUD + Soft Delete +
Auto-Registro)**

**Referências:** DOC-DEV-001 §5.1 \| DOC-ARC-001 \| DOC-ARC-002 \| LGPD

**Nível:** 1 (CRUD + soft delete + cursor pagination)

CRUD completo de usuários com soft delete (deleted_at), paginação por
cursor, e suporte a auto-registro via SSO. Listagens não expõem campos
sensíveis (PII minimizada). Auditoria de criação, atualização e exclusão
lógica obrigatória.

**3.5.6 F06 --- Roles / RBAC por Escopos**

**Referências:** DOC-DEV-001 §6 \| DOC-ARC-001 \| DOC-GNP-00 §RBAC \|
DOC-ESC-001

**Nível:** 2 (RBAC + cache Redis + domain events de permissões)

Sistema hierárquico de papéis com escopos no formato
módulo:recurso:ação. Cache Redis de permissões por sessão com
invalidação automática ao alterar vinculos. Toda verificação de scope
passa pelo middleware central de autorização.

**3.5.7 F07 --- Gestão de Filiais Multi-Tenant**

**Referências:** DOC-DEV-001 §7 \| DOC-ARC-001 \| DOC-ESC-001 \|
DOC-GNP-00 §Multi-Tenant \| LGPD

**Nível:** 2 (multi-tenant isolado, kill-switch org, domain events)

CRUD de filiais (tenants) com isolamento de dados por tenant_id. Suporte
a bloqueio de filial (kill-switch org) que revoga sessões ativas de
todos os usuários vinculados. Soft delete obrigatório. Cada filial
possui campo codigo único e alfanumérico.

**3.5.8 F08 --- Perfil do Usuário Autenticado**

**Referências:** DOC-DEV-001 §4.1 \| DOC-ARC-003 \| DOC-UX-010 \|
DOC-ARC-001

**Nível:** 1 (leitura enriquecida de sessão, correlação UI→API)

Endpoint GET /auth/me retorna perfil completo com filiais vinculadas,
escopos do usuário e flag force_pwd_reset. Edição de perfil (nome,
avatar) via PATCH /auth/me. Avatar via presigned URL (integra com F16).
É a fonte de dados do Header do Application Shell.

**3.5.9 F09 --- Vinculação Usuário-Filial com Role (tenant_users)**

**Referências:** DOC-DEV-001 §7 \| DOC-ESC-001 §Multi-Tenant \|
DOC-GNP-00 §RBAC \| DOC-ARC-001

**Nível:** 2 (multi-tenant isolado, RBAC pivot, invalidação de cache
Redis, audit trail)

Tabela pivot tenant_users gerencia a relação N:N entre usuários e
filiais com uma role específica por vínculo. Ao alterar ou remover um
vínculo, o cache Redis de permissões do usuário é invalidado
imediatamente. Um usuário pode ter roles diferentes em filiais
diferentes.

**3.5.10 F10 --- Alteração de Senha Autenticada**

**Referências:** DOC-DEV-001 §4.1, §5.1 \| SEC-000-01 \| DOC-ARC-001 \|
DOC-ARC-003

**Nível:** 2 (sessão em banco, kill-switch, domain events, bcrypt
compare)

Endpoint POST /auth/change-password exige senha atual (compare bcrypt),
nova senha e confirmação. Após alteração bem-sucedida, todas as outras
sessões do usuário são revogadas (kill-switch seletivo), mantendo apenas
a sessão atual. Gate force_pwd_reset resetado.

**3.5.11 F11 --- Endpoint GET /info**

**Módulo Destino:** ECF Core (@easycf/core-api)

**Nível:** 0 (infraestrutura do framework --- sem domínio de negócio)

Endpoint público (sem autenticação) que retorna versão do sistema,
ambiente, data do build e metadados de health. Permite que operações e
monitoramento identifiquem a versão deployada sem acesso ao CI/CD.

**3.5.12 F12 --- Catálogo de Permissões (CRUD de Escopos)**

**Referências:** DOC-DEV-001 §6 \| DOC-ARC-001 \| DOC-GNP-00 §RBAC

**Nível:** 2 (integridade referencial RBAC + domain events + validação
cruzada)

CRUD de escopos pré-definidos no catálogo de permissões. Garante
integridade referencial: um escopo não pode ser deletado se estiver em
uso por algum role. Validação semântica (formato módulo:recurso:ação) no
momento do cadastro. Inicia o seed de escopos padrão do sistema.

**3.5.13 F13 --- Utilitário de Telemetria UI (UIActionEnvelope)**

**Referências:** DOC-ARC-003 §2 --- O Idioma Operacional do Frontend

**Nível:** 1 (Frontend Tooling --- pacote \@easycf/ui-telemetry)

Cria e exporta o pacote \@easycf/ui-telemetry que implementa o contrato
UIActionEnvelope definido em DOC-ARC-003. Permite que desenvolvedores
front-end construam payloads de telemetria de forma segura e
padronizada, sempre anexando o correlation_id.

**UIActionEnvelope --- Campos principais**

-   screen_id: identificador da tela (ex: UX-AUTH-001)

-   action: tipo da ação (view, submit, click)

-   operation_id: operationId do OpenAPI associado

-   status: requested → succeeded \| failed

-   tenant_id: omitido em ações pré-autenticação

-   correlation_id: propagado do header X-Correlation-ID

-   duration_ms: preenchido em succeeded e failed

**3.5.14 F14 --- Middlewares de Correlação E2E**

**Referências:** DOC-ARC-003 §1 Dogma 3, §3 Domain Events Bridge

**Nível:** 1 (API Core --- middleware obrigatório no pipeline do
framework)

Middleware central que garante que cada requisição à API tenha um
X-Correlation-ID único (gerado ou propagado do header de entrada). O ID
é injetado no contexto da request, propagado para domain_events e
incluído em todas as respostas (sucesso e erro RFC 9457).

**3.5.15 F15 --- Motor de Gates de Pipeline CI (Screen Manifests
Validator)**

**Referências:** DOC-ARC-003 §8 Gates de Validação em CI

**Nível:** 0 (CI/CD DevOps --- sem domínio de negócio)

Script/runner de CI que valida a coerência dos Screen Manifests YAML em
docs/05_manifests/screens/ contra o OpenAPI versionado e as roles do
banco. Um PR que quebre essa paridade falha o build automaticamente,
impedindo que telas fiquem desincronizadas com contratos de API.

**3.5.16 F16 --- Módulo de Storage e Upload Centralizado**

**Referências:** DOC-PADRAO-005 \| DOC-ARC-003

**Nível:** 1 (Infraestrutura de Negócio / Foundation)

Módulo centralizado de storage que abstrai o provedor (S3 compatível) e
expõe presigned URLs para upload direto do frontend. Nenhum módulo de
negócio faz upload direto --- todos delegam ao Storage Service. Inclui
validação de tipo e tamanho, TTL das URLs e eventos de domínio para
auditoria de uploads.

**3.5.17 F17 --- Login via Sign in with Apple (Apple ID --- OIDC/JWKS)**

**Referências:** DOC-DEV-001 §4.2 \| INT-000-03 (Apple OIDC) \|
DOC-ARC-001 \| DOC-PADRAO-004

**Nível:** 2 (integração externa OIDC/OAuth2, auto-provisionamento,
domain events)

Terceiro provider SSO além de Google e Microsoft. Segue o mesmo padrão
de auto-provisionamento (vinculação por email,
passwordHash=SSO_APPLE_NO_PASSWORD). Particularidade: Apple só envia
nome e email no primeiro request do usuário --- o sistema deve persistir
esses dados imediatamente. Validação via JWKS público da Apple.

**4. MOD-001 --- Backoffice Admin (Épico UX-First)**

**Versão:** 0.1.0

**Status:** DRAFT → Aguardando aprovação

**Owner:** Arquitetura

**Abordagem:** UX-First --- Screen Manifests YAML antes da geração de
código

**Sub-histórias:** F01 a F03 (3 features)

**4.1 Abordagem UX-First**

O MOD-001 é o primeiro módulo de negócio construído sobre o Foundation.
Cada tela possui um Screen Manifest declarativo (YAML, schema v1) criado
antes de qualquer geração de código backend. O fluxo é:

-   Screen Manifest (YAML) → User Story (UX) → Geração de Código →
    Backend

**4.2 Screen Manifests do MOD-001**

  ------------------------------------------------------------------------------
  **Manifest**                  **Screen ID**  **Tipo**    **Status**
  ----------------------------- -------------- ----------- ---------------------
  ux-auth-001.login.yaml        UX-AUTH-001    auth        READY

  ux-shell-001.app-shell.yaml   UX-SHELL-001   shell       READY

  ux-dash-001.main.yaml         UX-DASH-001    dashboard   READY
  ------------------------------------------------------------------------------

**4.3 Dependências do MOD-000**

  ------------------------------------------------------------------------------
  **operationId**        **Feature de     **Uso no MOD-001**
                         Origem**         
  ---------------------- ---------------- --------------------------------------
  auth_login             US-MOD-000-F01   UX-AUTH-001 --- Login

  auth_logout            US-MOD-000-F01   UX-SHELL-001 --- Logout

  auth_me                US-MOD-000-F08   UX-SHELL-001 (Header) + UX-DASH-001
                                          (saudação)

  auth_forgot_password   US-MOD-000-F04   UX-AUTH-001 --- Recuperação de senha

  auth_reset_password    US-MOD-000-F04   UX-AUTH-001 --- Reset de senha
  ------------------------------------------------------------------------------

**4.4 OKRs de UX**

  ----------------------------------------------------------------------------
  **\#**   **Métrica**                                   **Alvo**
  -------- --------------------------------------------- ---------------------
  OKR-1    Screen Manifests validados contra schema v1   3/3 manifests
           (0 erros)                                     

  OKR-2    operation_ids dos manifests existentes no     100% paridade
           OpenAPI MOD-000                               

  OKR-3    Critérios Gherkin cobertos por testes de      F01--F03 completas
           contrato ou E2E                               
  ----------------------------------------------------------------------------

**4.5 Sub-Histórias do MOD-001**

**F01 --- Shell de Autenticação e Layout Base**

**Rastreia para:** US-MOD-001, DOC-UX-010/011/012, DOC-ARC-003,
US-MOD-000-F01, F04

Formaliza os requisitos de interface para a tela de Login (UX-AUTH-001)
com fluxo integrado de recuperação de senha (sem reload), e o
Application Shell persistente (UX-SHELL-001) com Sidebar filtrada por
permissões, Header com perfil e Breadcrumb de navegação.

**Regras Críticas da F01**

-   Mensagem de erro de login DEVE ser unificada: \'E-mail ou senha
    inválidos.\' (user enumeration prevention)

-   Botão de submit DEVE entrar em isLoading após clique (DOC-UX-012
    §5.1)

-   Toast de erro DEVE exibir correlationId propagado do header
    X-Correlation-ID

-   Sidebar DEVE filtrar itens de menu com base nos scopes do JWT
    (DOC-UX-011 §3.2)

-   Nenhum tenant_id no UIActionEnvelope de ações pré-autenticação

**F02 --- Telemetria de UI e Rastreabilidade do Shell**

**Rastreia para:** US-MOD-001, DOC-ARC-003, DOC-UX-010/012,
US-MOD-000-F13, F14

Aplica o pacote ui-telemetry (definido em F13) especificamente às 3
telas do Shell do MOD-001. Garante que ações pré-autenticação
(UX-AUTH-001) emitam UIActionEnvelope sem tenant_id, enquanto ações
pós-autenticação emitam com tenant_id correto.

**Regras Críticas da F02**

-   tenant_id DEVE ser null/omitido em toda ação de UX-AUTH-001 (fase
    pré-autenticação)

-   X-Correlation-ID DEVE estar presente em toda requisição API
    não-client_only

-   status DEVE transitar: requested → succeeded (2xx) ou failed
    (4xx/5xx)

-   duration_ms DEVE ser preenchido em todos os envelopes de succeeded e
    failed

**F03 --- Dashboard Administrativo Executivo**

**Rastreia para:** US-MOD-001, DOC-UX-011/012, DOC-ARC-003,
US-MOD-000-F08

Tela inicial pós-login (UX-DASH-001) com saudação personalizada via GET
/auth/me, atalhos de módulos filtrados por scopes do JWT, skeleton
screen durante carregamento e proteção de rota (JWT inválido redireciona
para /login).

**Regras Críticas da F03**

-   Dashboard DEVE chamar GET /auth/me para obter nome do usuário ---
    nunca usar localStorage

-   Skeleton screen DEVE ser exibido durante carregamento (DOC-UX-012
    §5.1)

-   Atalhos de módulos DEVEM ser filtrados por scopes --- módulos sem
    permissão não aparecem

-   Erros de /auth/me DEVEM exibir Toast com correlationId (DOC-UX-012
    §2.1)

**5. MOD-002 --- Cadastro de Usuários**

**Status:** DRAFT

**Owner:** Product Owner

**Nível Arquitetural:** 1

**Referências:** DOC-DEV-001, DOC-ARC-001, SEC-000-01, LGPD-BASE-001

**5.1 Contexto e Problema**

O sistema não possui fluxo estruturado para cadastro de novos usuários,
causando: duplicidade de contas, inconsistência de dados obrigatórios,
vulnerabilidades de autenticação, não conformidade com LGPD e
dificuldade de auditoria. É necessário um cadastro seguro, validado e
aderente às regras de negócio.

**5.2 User Story**

Como administrador do sistema, quero cadastrar novos usuários na
plataforma informando seus dados obrigatórios, para permitir que essas
pessoas tenham acesso controlado ao sistema conforme seu perfil de uso.

**5.3 Fluxos de Cadastro**

**Fluxo 1 --- Cadastro com senha definida no ato**

O administrador informa dados e define uma senha temporária. O sistema
exige troca de senha no primeiro acesso (force_pwd_reset=true).

**Fluxo 2 --- Cadastro com convite por e-mail**

O administrador cadastra dados básicos. O sistema envia link de ativação
com token temporário (TTL configurável). Falhas no envio de e-mail não
corrompem o cadastro (Outbox Pattern + DLQ).

**5.4 Campos do Formulário**

  ------------------------------------------------------------------------
  **Campo**            **Tipo**      **Obrigatório**
  -------------------- ------------- -------------------------------------
  Nome completo        texto         Sim (tamanho min/max configurável)

  E-mail               email         Sim (único no sistema)

  Perfil de acesso     seleção       Sim (deve existir e estar ativo)

  Status inicial       enum          Sim (Ativo / Pendente / Inativo /
                                     Bloqueado)

  Senha inicial / modo texto/opção   Sim (conforme política)
  de ativação                        

  Telefone             texto         Opcional

  Documento            texto         Opcional (mascaramento quando
                                     presente)

  Cargo                texto         Opcional

  Departamento         texto         Opcional

  Observações internas texto         Opcional
  ------------------------------------------------------------------------

**5.5 Regras Críticas**

-   E-mail único no sistema --- impede duplicidade de contas

-   Apenas usuários com permissão explícita (RBAC) podem cadastrar novos
    usuários

-   Erros de validação (422) usam RFC 9457 com
    extensions.invalid_fields\[\]

-   Senhas armazenadas com bcrypt (mínimo 12 rounds) --- nunca texto
    puro

-   Auditoria na tabela domain_events com X-Correlation-ID e
    sensitivity_level=2 (PII)

-   Perfil de acesso deve existir e estar ativo no catálogo RBAC

-   LGPD: dados sensíveis (e-mail, documento) ofuscados em logs comuns

-   Falhas de integração de e-mail não corrompem cadastro (Outbox
    Pattern + DLQ)

-   Token de ativação possui expiração configurável

-   Formulário previne caracteres inválidos; WAF e Rate Limiting ativos

-   Criação transacional com suporte a Idempotency-Key

**5.6 Requisitos Funcionais**

  --------------------------------------------------------------------------
  **ID**   **Requisito**
  -------- -----------------------------------------------------------------
  RF01     Permitir cadastro manual de novo usuário

  RF02     Formulário com campos obrigatórios e opcionais

  RF03     Validar unicidade de e-mail/login

  RF04     Selecionar perfil de acesso

  RF05     Definir status inicial conforme regra de negócio

  RF06     Validar formato dos dados informados

  RF07     Persistir dados após validação bem-sucedida

  RF08     Mensagens claras de sucesso e erro

  RF09     Registrar log de auditoria da operação

  RF10     Envio de convite/ativação quando aplicável

  RF11     Aplicar política de senha quando há senha inicial

  RF12     Impedir acesso sem autorização adequada
  --------------------------------------------------------------------------

**5.7 Requisitos Não Funcionais**

  --------------------------------------------------------------------------
  **ID**   **Requisito**
  -------- -----------------------------------------------------------------
  RNF01    Segurança: CSRF, Helmet.js Headers, Rate Limiting via Redis

  RNF02    LGPD: PII ofuscada em logs comuns; tratamento conforme normativos
           internos

  RNF03    Tempo de resposta compatível com UX esperada

  RNF04    Rastreabilidade: X-Correlation-ID propagado em todas as camadas

  RNF05    Formulário responsivo para dispositivos móveis

  RNF06    Mensagens de erro RFC 9457 sem detalhes técnicos sensíveis

  RNF07    Rate Limiting e WAF para proteção contra abuso

  RNF08    Cobertura por testes automatizados; contrato no OpenAPI
  --------------------------------------------------------------------------

**6. Mapa de Dependências Entre Módulos**

O diagrama abaixo representa as dependências entre módulos e features no
sentido de consumo:

  -----------------------------------------------------------------------
  **MOD-001 depende de MOD-000**

  auth_login (F01) → UX-AUTH-001 --- Tela de Login do Backoffice

  auth_logout (F01) → UX-SHELL-001 --- Botão de Logout no Header

  auth_me (F08) → UX-SHELL-001 + UX-DASH-001 --- Header e Saudação do
  Dashboard

  auth_forgot_password (F04) → UX-AUTH-001 --- Recuperação de Senha

  auth_reset_password (F04) → UX-AUTH-001 --- Reset de Senha

  ui-telemetry package (F13) → MOD-001-F02 --- Telemetria de UI do Shell

  X-Correlation-ID Middleware (F14) → MOD-001-F02 --- Rastreabilidade das
  Requisições
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  **MOD-002 depende de MOD-000**

  RBAC / Roles (F06) → Permissão para cadastrar usuários

  Catálogo de Permissões (F12) → Perfis de acesso elegíveis para o novo
  usuário

  Autenticação (F01) → Sessão do administrador que realiza o cadastro

  Storage (F16) → Upload de avatar do usuário quando aplicável

  Auditoria (domain_events) → Rastreabilidade da criação do usuário
  -----------------------------------------------------------------------

**7. Padrões Técnicos Obrigatórios**

**7.1 Contratos de API**

-   Todos os endpoints documentados em OpenAPI/Swagger (DOC-ARC-001)

-   operationId único e estável por endpoint (formato:
    módulo_recurso_ação)

-   Paths sob /api/v{X} --- versão explícita na URL

-   X-Correlation-ID declarado e propagado em cada operação

-   Erros em formato RFC 9457 (Problem Details) com correlationId no
    extensions

-   Idempotency-Key em toda rota de mutação com efeito colateral

**7.2 Estratégia de Testes (DOC-ARC-002)**

  --------------------------------------------------------------------------
  **Camada**   **Escopo**           **Regra**
  ------------ -------------------- ----------------------------------------
  Unit         Sem I/O (sem banco,  Funções puras, regras de domínio,
               sem rede)            utilitários

  Integração   DB real efêmero      Repositórios, casos de uso com
                                    persistência

  Contrato     OpenAPI como         Testes contra especificação --- CI falha
               referência           em divergência

  E2E          Fluxo completo       Cenários Gherkin críticos --- mínimo nos
                                    fluxos de auth
  --------------------------------------------------------------------------

**7.3 Observabilidade**

-   domain_events: única fonte de eventos de domínio --- sem tabelas de
    log exclusivas

-   Campos obrigatórios: tenant_id, entity_type, entity_id, event_type,
    payload, correlation_id, created_by

-   sensitivity_level: 0 (público), 1 (interno), 2 (PII/sensível)

-   visibility_level: define quais camadas podem ler o evento

-   causation_id: para rastrear cadeias de eventos (ex: login → MFA →
    sessão criada)

**7.4 Segurança**

-   bcrypt com mínimo 12 rounds para senhas

-   User Enumeration Prevention em todos os endpoints de autenticação

-   Rate Limiting via Redis (Leaky Bucket ou Token Bucket) em endpoints
    sensíveis

-   Cookies httpOnly + sameSite para tokens de sessão

-   RBAC: validação de escopo antes de toda operação protegida

-   WAF ativo em endpoints públicos ou de registro

**7.5 Infraestrutura e Ambiente**

-   Runtime: Node.js (versão definida em DOC-PADRAO-002)

-   Gerenciador de pacotes: pnpm com workspaces monorepo

-   Containerização: Docker com variáveis de ambiente validadas em boot
    (fail-fast)

-   Redis: apenas broker BullMQ e cache efêmero --- proibido como banco
    primário

-   Banco de dados: PostgreSQL com soft-delete obrigatório em dados
    auditáveis

**8. Definition of Ready (DoR) e Definition of Done (DoD) Globais**

**8.1 DoR --- Critérios para Iniciar Desenvolvimento**

-   Owner claro definido para a feature

-   Épico pai aprovado (pré-requisito de cascata)

-   Cenários Gherkin revisados e aprovados pelo time

-   Contrato de API documentado no OpenAPI (endpoints + operationIds)

-   Variáveis de ambiente documentadas em DOC-PADRAO-004 (quando
    aplicável)

-   Contratos de integração externa (INT-000-XX) criados com
    retry/timeout/fallback (quando aplicável)

-   Sem pendências críticas (PENDENTE-XXX) em aberto

-   ADRs documentadas para divergências de padrão conhecidas

**8.2 DoD --- Critérios para Encerramento**

-   Funcionalidade implementada conforme todos os critérios de aceite
    Gherkin

-   Contrato OpenAPI atualizado e validado pelo Spectral lint

-   Testes unitários, de integração e de contrato implementados e
    passando

-   CI pipeline verde (Spectral lint, contract tests, cobertura mínima)

-   Auditoria via domain_events implementada com X-Correlation-ID e
    sensitivity_level

-   Mensagens de erro RFC 9457 sem vazamento de informação técnica/PII

-   Documentação técnica (OpenAPI .yaml) atualizada

-   Evidências documentadas no arquivo da feature (links de PR/issue)

**9. Roadmap e Pontos Abertos para Revisão**

**9.1 Itens para Revisão Imediata**

  -----------------------------------------------------------------------
  **MOD-000 --- Pontos a decidir**

  Status de aprovação do épico: US-MOD-000 precisa sair de DRAFT para
  iniciar scaffolding

  F17 (Sign in with Apple) está em DRAFT --- precisaria de aprovação
  separada ou junto ao épico?

  Política de ativação do MOD-002: senha temporária ou convite por
  e-mail? (depende de decisão de produto)

  Campos obrigatórios do MOD-002: confirmar se CPF/documento é realmente
  obrigatório

  Rate limit específico por IP vs. por usuário vs. por temp_token (F02
  usa por temp_token)
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  **MOD-001 --- Pontos a decidir**

  Screen Manifests YAML ainda precisam ser criados nos paths declarados
  (docs/05_manifests/screens/)

  Schema v1 do Screen Manifest precisa ser formalizado (DOC-UX-010
  §Manifestos de Infra/Shell)

  Verificação de paridade: todos os operationIds dos manifests devem
  existir no OpenAPI do MOD-000
  -----------------------------------------------------------------------

**9.2 Roadmap Futuro (Fora do Escopo Atual)**

  -----------------------------------------------------------------------
  **Item**                           **Gatilho**
  ---------------------------------- ------------------------------------
  Lint automático de documentos      Quando o time atingir 3+ módulos em
  normativos em cada PR              produção

  Dashboard de cobertura normativa   Pós-MVP
  (% endpoints conformes com         
  OpenAPI/Spectral)                  

  Integração com diretório externo   Confirmar necessidade com
  ou IAM corporativo (LDAP, Okta)    stakeholders

  Importação em massa de usuários    Roadmap futuro do MOD-002

  Aprovação em múltiplos níveis para Roadmap futuro do MOD-002
  criação de conta                   

  Notificações e alertas no          Roadmap futuro do MOD-001
  Dashboard                          

  Personalização de layout pelo      Roadmap futuro do MOD-001
  usuário                            

  MFA no fluxo SSO                   Fase 2 de segurança
  (Google/Microsoft/Apple)           

  Métricas, KPIs e gráficos          Roadmap futuro do MOD-001
  operacionais no Dashboard          
  -----------------------------------------------------------------------

**10. Changelog do Documento**

  ----------------------------------------------------------------------------------
  **Versão**   **Data**   **Responsável**   **Descrição**
  ------------ ---------- ----------------- ----------------------------------------
  1.0          Mar 2026   Arquitetura       Criação inicial por engenharia reversa a
                                            partir de US-MOD-000, US-MOD-001,
                                            US-MOD-002 e features F01--F17 +
                                            F01--F03

  ----------------------------------------------------------------------------------

*Este documento foi gerado por engenharia reversa e deve ser revisado
pelo time antes de ser utilizado como base para novas User Stories.*