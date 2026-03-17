# US-MOD-001-F01 — Shell de Autenticação e Layout Base

**Status Ágil:** `READY`
**Versão:** 0.5.0
**Data:** 2026-03-16
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-001** (Backoffice Admin)

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-16
- **rastreia_para:** US-MOD-001, DOC-UX-010, DOC-UX-011, DOC-UX-012, DOC-ARC-003, US-MOD-000-F01, US-MOD-000-F04, US-MOD-000-F08
- **evidencias:** Transição TODO → READY (2026-03-16) — DoR verificado, conteúdo revisado
- **wave_entrega:** Wave 1
- **epico_pai:** US-MOD-001
- **manifests_vinculados:** ux-auth-001, ux-shell-001
- **pendencias:** N/A

---

## 1. Contexto e Problema

O módulo Backoffice Admin requer uma tela de Login com fluxo integrado de Recuperação de Senha (sem reload de página) e um Application Shell persistente (Sidebar + Header + Breadcrumb) que envolva todas as rotas protegidas.

Esta feature formaliza os contratos de UX para:
- `UX-AUTH-001` — tela de Login, Recuperação de Senha e Reset de Senha
- `UX-SHELL-001` — Application Shell (layout wrapper das rotas autenticadas)

---

## 2. A Solução (Linguagem de Negócio)

Como **usuário administrador**, quero:
- Fazer login de forma segura, sem mensagens que revelem se meu e-mail existe
- Recuperar minha senha via e-mail sem sair da tela atual
- Após autenticado, navegar com layout consistente filtrado pelas minhas permissões

---

## 3. Escopo

### Inclui

- Contrato UX completo da tela de Login com 3 painéis: `login`, `forgot-password`, `reset-password`
- Fluxo de recuperação como sub-painel client-only (sem reload, sem nova rota)
- Application Shell: Sidebar filtrada por scopes, Header com Breadcrumb, ProfileWidget
- Tradução de erros HTTP para mensagens via RFC 9457 com correlationId no Toast

### Não inclui

- Implementação de endpoints backend (MOD-000-F01, MOD-000-F04)
- MFA/TOTP — quando necessário, redireciona para /login/mfa (escopo futuro)
- SSO — fluxo redireciona para provider, retorna para /sso-success (MOD-000-F03)
- Telemetria detalhada (coberta em F02)

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Shell de Autenticação e Layout Base — UX-AUTH-001 e UX-SHELL-001

  # ── Login ───────────────────────────────────────────────────
  Cenário: Login bem-sucedido redireciona para o Dashboard
    Dado que o usuário está na tela /login (painel login ativo)
    Quando ele preenche email e senha válidos e clica em "Entrar"
    Então o botão deve entrar em isLoading (desabilitado + spinner)
    E o sistema deve chamar POST /api/v1/auth/login (auth_login)
    E ao receber 200, redirecionar para /dashboard
    E o Application Shell (UX-SHELL-001) deve ser exibido com Sidebar, Header e Breadcrumb

  Cenário: Login com MFA obrigatório redireciona para /login/mfa
    Dado que o usuário tem MFA configurado
    Quando o login retorna 200 com mfa_required=true e temp_token
    Então o sistema deve redirecionar para /login/mfa?session=<temp_token>
    E NÃO deve exibir o Application Shell ainda

  Cenário: Erro de login não revela enumeração de usuário
    Dado que o usuário preenche e-mail inexistente ou senha incorreta
    Quando POST /api/v1/auth/login retorna 401
    Então a mensagem exibida DEVE ser exatamente: "E-mail ou senha inválidos."
    E um Toast de erro deve aparecer com o correlationId no rodapé
    E o botão deve sair do estado isLoading e ficar habilitado novamente

  Cenário: Conta bloqueada retorna mensagem específica
    Dado que o usuário tem status BLOCKED
    Quando POST /api/v1/auth/login retorna 403
    Então o Toast deve exibir: "Sua conta está bloqueada. Entre em contato com o suporte."
    E deve incluir correlationId

  Cenário: Rate limit exibido com tempo de espera
    Dado que o IP excedeu o limite de tentativas
    Quando POST /api/v1/auth/login retorna 429 com retry_after
    Então o Toast deve exibir: "Muitas tentativas. Tente novamente em X segundos."
    E o botão deve ficar desabilitado pelo período de retry_after

  # ── Recuperação de Senha ─────────────────────────────────────
  Cenário: Abertura do painel de recuperação sem reload
    Dado que o usuário está no painel login da UX-AUTH-001
    Quando ele clica em "Esqueci minha senha"
    Então o painel DEVE mudar para forgot-password sem reload de página
    E sem alteração da URL /login
    E apenas o campo de e-mail deve ser visível

  Cenário: Solicitação de recuperação com resposta genérica
    Dado que o usuário está no painel forgot-password
    Quando ele preenche qualquer e-mail e clica em "Enviar link"
    Então o Toast de sucesso DEVE exibir: "Se o e-mail estiver cadastrado, você receberá um link em breve."
    E esta mensagem DEVE ser a mesma para e-mail existente E inexistente

  Cenário: Reset de senha via token na URL
    Dado que o usuário acessa /login?token=<uuid-valido>
    Então o painel reset-password DEVE ser ativado automaticamente
    E apenas os campos nova_senha e confirmar_senha devem ser visíveis
    E o token NÃO deve ser validado antecipadamente (apenas no submit)

  Cenário: Token de reset expirado
    Dado que o usuário submete o reset com token expirado
    Quando POST /api/v1/auth/reset-password retorna 400/422
    Então o Toast deve exibir: "Link inválido ou expirado. Solicite um novo link."
    E deve exibir link para voltar ao painel forgot-password

  # ── Application Shell ────────────────────────────────────────
  Cenário: Sidebar filtra itens por scopes do JWT
    Dado que o usuário está autenticado com scopes ["users:user:read", "tenants:branch:read"]
    Quando o Shell carrega após auth_me retornar
    Então a Sidebar DEVE exibir apenas os itens "Usuários" e "Filiais"
    E NÃO deve exibir "Perfis e Permissões" (requer users:role:read) nem "Auditoria"

  Cenário: Sidebar não exibe item de módulo sem permissão (nem desabilitado)
    Dado que o usuário NÃO tem o scope "system:audit:read"
    Quando o Shell é renderizado
    Então o item "Auditoria" NÃO deve aparecer na Sidebar
    E NÃO deve aparecer desabilitado, com cadeado ou com tooltip de "sem acesso"

  Cenário: Skeleton loading no Shell durante auth_me
    Dado que o Shell está montando e aguardando auth_me
    Então o Header deve exibir skeleton nos campos avatar, nome e tenant
    E a Sidebar deve exibir skeleton nos itens de menu
    E a ContentArea deve exibir o skeleton da tela destino

  Cenário: Sessão expirada durante navegação
    Dado que o JWT expirou enquanto o usuário estava navegando
    Quando qualquer requisição HTTP retorna 401
    Então o interceptor HTTP global deve redirecionar para /login
    E deve exibir Toast: "Sua sessão expirou. Faça login novamente."

  Cenário: ProfileWidget exibe dados corretos do usuário
    Dado que o Shell carregou e auth_me retornou com sucesso
    Então o Header deve exibir: nome completo, e-mail, nome do tenant ativo
    E os links "Alterar Senha" e "Sair" devem estar acessíveis no dropdown

  Cenário: Logout encerra sessão e redireciona
    Dado que o usuário clica em "Sair" no ProfileWidget
    Então o botão deve entrar em isLoading
    E o sistema deve chamar POST /api/v1/auth/logout (auth_logout)
    E após 200, redirecionar para /login
    E em caso de erro de rede, redirecionar para /login mesmo assim (limpando estado local)
```

---

## 5. Definition of Ready (DoR)

- [x] Screen Manifest `ux-auth-001.login.yaml` criado com painéis login, forgot-password, reset-password
- [x] Screen Manifest `ux-shell-001.app-shell.yaml` criado com sidebar_menu, componentes e regras
- [x] operationIds mapeados: `auth_login`, `auth_forgot_password`, `auth_reset_password`, `auth_me`, `auth_logout`
- [x] Épico pai US-MOD-001 em estado READY
- [x] US-MOD-000-F01 (auth) e US-MOD-000-F04 (recuperação) referenciadas
- [x] Regras de user enumeration prevention documentadas nos manifests

## 6. Definition of Done (DoD)

- [ ] UX-AUTH-001: login, forgot-password e reset-password implementados conforme manifest
- [ ] UX-SHELL-001: Sidebar, Header, Breadcrumb, ProfileWidget implementados
- [ ] Sidebar filtra itens por scope — validado por teste de integração (mock de scopes)
- [ ] Mensagens de erro user-enumeration-safe validadas (login e forgot-password)
- [ ] Skeleton loading validado no Header e Sidebar durante auth_me
- [ ] Interceptor HTTP para 401 implementado e testado
- [ ] Testes E2E cobrindo: login OK, login inválido, logout, recuperação de senha, sessão expirada
- [ ] Validado contra Screen Manifests (skill `validate-screen-manifest`)

---

## 7. Manifests Vinculados

| Manifest | Screen ID | Propósito |
| --- | --- | --- |
| `docs/05_manifests/screens/ux-auth-001.login.yaml` | UX-AUTH-001 | Login + Recuperação + Reset de Senha |
| `docs/05_manifests/screens/ux-shell-001.app-shell.yaml` | UX-SHELL-001 | Application Shell (layout wrapper) |

---

## 8. Regras Críticas

1. Mensagem de erro de login **DEVE** ser sempre: `"E-mail ou senha inválidos."` — sem variações por tipo de erro (enumeration prevention, SEC-000-01)
2. Mensagem de forgot-password **DEVE** ser sempre positiva — mesma resposta para e-mail existente e inexistente
3. Botão de submit **DEVE** entrar em `isLoading` imediatamente após clique — permanece desabilitado até resposta
4. Toast de erro **DEVE** incluir `correlationId` no rodapé (pequeno, cor cinza) — nunca detalhes técnicos
5. Transição login ↔ forgot-password **DEVE** ser client-only: sem reload, sem nova URL
6. Sidebar **DEVE** ser populada pelos scopes de `auth_me` — nunca codificada estaticamente ou derivada do JWT cru
7. `tenant_id` **NÃO DEVE** estar no `UIActionEnvelope` de nenhuma ação da UX-AUTH-001 (fase pré-autenticação)

---

## 9. CHANGELOG

| Versão | Data | Responsável | Descrição |
| --- | --- | --- | --- |
| 0.5.0 | 2026-03-16 | arquitetura | Transição TODO → READY — DoR verificado, conteúdo revisado, rollback concluído |
| 0.4.0 | 2026-03-15 | arquitetura | Incorporação da revisão: +10 cenários Gherkin (MFA redirect, rate limit, conta bloqueada, token expirado, sidebar filtrada, skeleton, sessão expirada, ProfileWidget, logout com erro de rede), DoR/DoD expandidos, rastreabilidade com US-MOD-000-F08, 7 regras críticas |
| 0.3.0 | 2026-03-15 | arquitetura | Rollback de READY para TODO — scaffold destruído |
| 0.1.0 | 2026-03-08 | arquitetura | Criação inicial |

---

> ⚠️ **Atenção:** As automações (`forge-module`, `create-amendment`) **SÓ PODEM SER EXECUTADAS** com Status `APPROVED`.
