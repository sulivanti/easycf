# US-MOD-001-F01 — Shell de Autenticação e Layout Base

**Status Ágil:** `DRAFT`
**Versão:** 0.1.0  
**Data:** 2026-03-08  
**Autor(es):** Produto + Arquitetura  
**Módulo Destino:** **MOD-001** (Backoffice Admin)

## Metadados de Governança

- **status_agil:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-08
- **rastreia_para:** US-MOD-001, DOC-UX-010, DOC-UX-011, DOC-UX-012, DOC-ARC-003, US-MOD-000-F01, US-MOD-000-F04
- **evidencias:** N/A (aguardando aprovação do épico US-MOD-001)

---

## 1. Contexto e Problema

O módulo Backoffice Admin requer uma tela de Login com fluxo integrado de Recuperação de Senha e um Application Shell persistente (Sidebar + Header + Breadcrumb) que envolva todas as rotas protegidas. Sem um contrato declarativo formal (Screen Manifest), a geração de código pode produzir interfaces inconsistentes com os padrões UX definidos nos normativos.

Esta feature formaliza os requisitos de interface para:

- `UX-AUTH-001` — tela de Login e Recuperação de Senha
- `UX-SHELL-001` — container de navegação (Application Shell)

---

## 2. A Solução (Linguagem de Negócio)

Como **usuário administrador**, quero:

- Fazer login de forma segura, com mensagens de erro que não revelem dados de enumeração de usuário
- Recuperar minha senha via e-mail sem sair da tela atual
- Após autenticado, ver o sistema com layout consistente (Sidebar filtrada por permissões, Header com dados do meu perfil, Breadcrumb de navegação)

---

## 3. Escopo

### Inclui

- Contrato UX da tela de Login (contextos: login, forgot-password, reset-password)
- Fluxo de recuperação de senha como sub-painel (sem reload de página)
- Application Shell com Sidebar, Header e Breadcrumb
- Widget de Perfil no Header (Tenant ativo, nome, e-mail, "Alterar Senha", "Sair")
- Tradução de erros HTTP para mensagens via RFC 9457 com `correlationId`

### Não inclui

- Implementação de backend dos endpoints (coberta por US-MOD-000-F01 e US-MOD-000-F04)
- MFA/TOTP ou SSO (cobertos por US-MOD-000-F02 e US-MOD-000-F03)
- Lógica de telemetria detalhada (coberta por US-MOD-001-F02)

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Shell de Autenticação e Layout Base do MOD-001

  Cenário: Login bem-sucedido redireciona para o Dashboard
    Dado que o usuário está na tela de login
    Quando ele preenche credenciais válidas e clica em "Entrar"
    Então o sistema deve chamar auth_login (POST /auth/login)
    E redirecionar para /dashboard (DOC-UX-011 §5)
    E o Application Shell deve ser exibido com Sidebar, Header e Breadcrumb

  Cenário: Erro de login não revela enumeração de usuário
    Dado que o usuário está na tela de login
    Quando ele preenche e-mail inexistente ou senha incorreta
    Então a mensagem exibida deve ser "E-mail ou senha inválidos."
    E um Toast de erro deve exibir o correlationId (DOC-UX-012 §2.1)

  Cenário: Botão de submit exibe isLoading após clique
    Dado que o usuário preencheu o formulário de login
    Quando ele clica em "Entrar"
    Então o botão deve entrar em estado isLoading (DOC-UX-012 §5.1)
    E permanecer desabilitado até a resposta da API

  Cenário: Recuperação de senha sem reload de página
    Dado que o usuário está na tela de login
    Quando ele clica em "Esqueci minha senha"
    Então o sistema deve exibir o sub-painel de recuperação (client-only, sem reload)
    E o campo de e-mail deve ser o único campo visível

  Cenário: Application Shell filtra Sidebar por scopes do usuário
    Dado que o usuário está autenticado
    Quando ele navega para qualquer rota protegida
    Então o Shell deve exibir apenas os módulos para os quais o usuário tem permissão (DOC-UX-011 §3.2)

  Cenário: Widget de Perfil no Header exibe dados corretos
    Dado que o usuário está autenticado no Shell
    Então o Header deve exibir: Tenant ativo, nome completo, e-mail
    E os links "Alterar Senha" e "Sair" devem estar acessíveis
```

---

## 5. Definition of Ready (DoR)

- [ ] Screen Manifests criados: `ux-auth-001.login.yaml`, `ux-shell-001.app-shell.yaml`
- [ ] operationIds mapeados: `auth_login`, `auth_forgot_password`, `auth_reset_password`, `auth_me`, `auth_logout`
- [ ] Épico pai US-MOD-001 definido
- [ ] Rastreabilidade com US-MOD-000-F01 e US-MOD-000-F04 declarada
- [ ] US-MOD-001 aprovada pelo owner

## 6. Definition of Done (DoD)

- [ ] Screen Manifests validados contra schema v1 (skill `validate-screen-manifest`)
- [ ] Critérios Gherkin cobertos por testes de contrato ou E2E
- [ ] Integração com pacote `ui-telemetry` validada (US-MOD-001-F02)
- [ ] Evidências (PR/issue) documentadas neste arquivo

---

## 7. Manifests Vinculados

| Manifest | Screen ID | Propósito |
| --- | --- | --- |
| [ux-auth-001.login.yaml](file:///d:/Dev/EasyCodeFramework/docs/05_manifests/screens/ux-auth-001.login.yaml) | UX-AUTH-001 | Login + Recuperação de Senha |
| [ux-shell-001.app-shell.yaml](file:///d:/Dev/EasyCodeFramework/docs/05_manifests/screens/ux-shell-001.app-shell.yaml) | UX-SHELL-001 | Application Shell |

---

## 8. Regras Críticas

1. Mensagem de erro de login DEVE ser unificada (user enumeration prevention): `"E-mail ou senha inválidos."`
2. Botão de submit DEVE entrar em `isLoading` após clique (DOC-UX-012 §5.1)
3. Toast de erro DEVE exibir `correlationId` propagado do header `X-Correlation-ID` (DOC-UX-012 §2.1, DOC-ARC-003 §3)
4. Sidebar DEVE filtrar itens de menu com base nos scopes do JWT (DOC-UX-011 §3.2)
5. Nenhum `tenant_id` no `UIActionEnvelope` de ações pré-autenticação (DOC-ARC-003 §2)
