> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.23.0 | 2026-03-24 | Marcos Sulivan | PENDENTE-009 → IMPLEMENTADA — correção lint 3 fases (format + lint:fix + refactor hooks) |
> | 0.22.0 | 2026-03-24 | Marcos Sulivan | PENDENTE-009 → DECIDIDA (Opção A) — correção incremental em 3 fases |
> | 0.21.0 | 2026-03-24 | validate-all  | Adição PENDENTE-009 — erros lint codegen (7 ocorrências) |
> | 0.20.0 | 2026-03-24 | Marcos Sulivan | PENDENTE-007 → IMPLEMENTADA — interceptor 401 global no apiRequest() + AMD-SEC-001-001 |
> | 0.19.0 | 2026-03-24 | Marcos Sulivan | PENDENTE-007 → DECIDIDA (Opção A) — centralizar redirect 401 no apiRequest() |
> | 0.18.0 | 2026-03-24 | Marcos Sulivan | PENDENTE-008 → IMPLEMENTADA — timeout opcional em RequestOptions + use-auth-me 3s + AMD-INT-005-001 |
> | 0.17.0 | 2026-03-24 | Marcos Sulivan | PENDENTE-008 → DECIDIDA (Opção A) — timeout opcional em RequestOptions |
> | 0.16.0 | 2026-03-24 | Marcos Sulivan | PENDENTE-005 → IMPLEMENTADA — 10 arquivos de teste (3 domain + 1 data + 6 component) + vitest config |
> | 0.15.0 | 2026-03-24 | Marcos Sulivan | PENDENTE-006 → IMPLEMENTADA — telemetry.ts + integração hooks (6 arquivos) |
> | 0.14.0 | 2026-03-24 | Marcos Sulivan | PENDENTE-005 → DECIDIDA (Opção C) — testes unitários domain/data + testes componente |
> | 0.13.0 | 2026-03-24 | Marcos Sulivan | PENDENTE-006 → DECIDIDA (Opção A) — telemetry.ts + integração hooks |
> | 0.12.0 | 2026-03-18 | Marcos Sulivan | PENDENTE-003 → IMPLEMENTADA — FR-007, INT-006, DATA-003 v0.5.0 (submit_change_password) |
> | 0.11.0 | 2026-03-18 | Marcos Sulivan | PENDENTE-003 → DECIDIDA (Opção A) — Criar FR-007, INT-006, UIActionEnvelope |
> | 0.10.0 | 2026-03-18 | Marcos Sulivan | PENDENTE-002 → IMPLEMENTADA — Opção B (FR-004 v0.7.0, UX-001 v0.5.0) |
> | 0.9.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-002 → DECIDIDA (Opção B) |
> | 0.8.0  | 2026-03-18 | usuário     | PENDENTE-004 implementada — fallback defensivo MFA em FR-001 v0.6.0 |
> | 0.7.0  | 2026-03-18 | usuário     | PENDENTE-004 decidida — Opção B (fallback defensivo MFA redirect) |
> | 0.6.0  | 2026-03-18 | usuário     | PENDENTE-001 implementada — cache auth_me via React Query (30s TTL) adicionado em FR-004/FR-005 |
> | 0.5.0  | 2026-03-18 | usuário     | PENDENTE-001 decidida — Opção C (React Query/SWR cache 30s) |
> | 0.4.0  | 2026-03-17 | AGN-DEV-10  | Batch 4 — adiciona PENDENTE-003 (Alterar Senha) e PENDENTE-004 (MFA UX) |
> | 0.3.0  | 2026-03-17 | AGN-DEV-10  | Re-enriquecimento — adiciona status de resolução, metadata, EX-* |
> | 0.2.0  | 2026-03-16 | AGN-DEV-10  | Enriquecimento PENDENTE (enrich-agent) |
> | 0.1.0  | 2026-03-16 | arquitetura | Baseline Inicial (forge-module) |

# PEN-001 — Questões Abertas do Backoffice Admin

---

## PENDENTE-001 — Estratégia de Cache de auth_me entre Shell e Dashboard

- **Questão:** O Shell (UX-SHELL-001) e o Dashboard (UX-DASH-001) ambos chamam `GET /auth/me` ao montar. Devem compartilhar o resultado via React Context/cache ou cada componente faz sua própria chamada?
- **Impacto:** Performance (chamada duplicada), consistência (dados sempre frescos vs. stale), complexidade (cache management)
- **Opções:**
  - **Opção A:** Cada componente chama auth_me independentemente — simplicidade máxima, 2 requisições no carregamento inicial
  - **Opção B:** Shell chama auth_me e injeta via React Context — 1 requisição, mas acoplamento Shell↔Dashboard
  - **Opção C:** React Query/SWR com cache de 30s — 1 requisição efetiva, cache automático, sem acoplamento
- **Recomendação:** Opção C (React Query/SWR) — balance entre performance e simplicidade. O cache TTL curto (30s) garante dados frescos sem duplicar chamadas. Se não houver lib de cache no projeto, Opção A é aceitável para MVP.
- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-16
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-18
- **decidido_por:** usuário
- **opcao_escolhida:** C
- **justificativa_decisao:** React Query/SWR com cache TTL 30s oferece melhor equilíbrio: 1 requisição efetiva, cache automático entre Shell e Dashboard, sem acoplamento via Context. Opção A (chamadas independentes) desperdiça uma requisição; Opção B (Context) cria acoplamento Shell↔Dashboard desnecessário.
- **modulo:** MOD-001
- **rastreia_para:** [FR-004, FR-005, INT-002, INT-005]
- **tags:** [cache, auth-me, react-query, performance]
- **sla_data:** —
- **dependencias:** []

### Resolução

> **Decisão:** Opção C — React Query/SWR com cache de 30s
> **Decidido por:** usuário em 2026-03-18
> **Justificativa:** Cache TTL curto (30s) garante dados frescos sem duplicar chamadas. Shell e Dashboard compartilham resultado via query key sem acoplamento direto. Se lib de cache já existe no projeto, custo zero de adoção.
> **Artefato de saída:** FR-004 v0.5.0, FR-005 v0.4.0 — cláusula de cache auth_me adicionada
> **Implementado em:** 2026-03-18

---

## ~~PENDENTE-002~~ — ✅ IMPLEMENTADA: Comportamento do Shell quando auth_me retorna scopes vazios

- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **domínio:** UX
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-16
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** B
- **justificativa_decisao:** Sidebar com mensagem explicativa "Nenhum módulo configurado" + ícone informativo melhora UX sem complexidade. Evita percepção de "tela quebrada" e reduz chamados de suporte. Dashboard já trata scopes=[] com mensagem própria, mas Sidebar vazia sem contexto confunde o usuário.
- **modulo:** MOD-001
- **rastreia_para:** [FR-004, UX-001, BR-005]
- **tags:** [sidebar, empty-state, scopes, ux]
- **sla_data:** —
- **dependencias:** []

### Questão

Se auth_me retorna `scopes=[]`, o Dashboard mostra "Nenhum módulo disponível". Mas a Sidebar também fica completamente vazia — apenas o Header com ProfileWidget é visível. Isso é aceitável do ponto de vista UX ou devemos exibir um estado vazio explicativo na Sidebar?

### Impacto

UX (primeira impressão do admin sem permissões), suporte (chamados por "tela em branco").

### Opções

**Opção A — Sidebar vazia é aceitável:**
O Dashboard já explica a situação com "Nenhum módulo disponível para seu perfil."

- Prós: Zero complexidade; já implementado no Dashboard
- Contras: Sidebar completamente vazia pode parecer bug; usuário pode não notar mensagem do Dashboard

**Opção B — Sidebar exibe mensagem "Nenhum módulo configurado" com ícone informativo:**
Quando `scopes=[]`, Sidebar exibe item placeholder com ícone `Info` e texto explicativo.

- Prós: UX clara; contexto imediato; reduz chamados de suporte
- Contras: Componente extra na Sidebar (complexidade mínima)

### Recomendação

Opção B — melhora a UX sem complexidade adicional.

### Resolução

> **Decisão:** Opção B — Sidebar exibe mensagem "Nenhum módulo configurado" com ícone informativo
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** Sidebar com mensagem explicativa melhora UX sem complexidade. Evita percepção de "tela quebrada" e reduz chamados de suporte. O Dashboard já trata scopes=[] com mensagem própria, mas Sidebar vazia sem contexto confunde o usuário.
> **Artefato de saída:** FR-004 v0.7.0 (empty state Sidebar), UX-001 v0.5.0 (UX-002 empty state atualizado)
> **Implementado em:** 2026-03-18

---

## ~~PENDENTE-003~~ — ✅ IMPLEMENTADA: Fluxo de "Alterar Senha" no ProfileWidget

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **domínio:** BIZ
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** O fluxo de alteração de senha é parte natural do Shell de autenticação e o endpoint já existe no Foundation (DOC-FND-000 §1.3). O custo de especificar é baixo (FR-007 + INT-006 + 1 UIActionEnvelope) e a UX fica completa. Adiar (Opção B) entregaria ProfileWidget com funcionalidade incompleta.
- **modulo:** MOD-001
- **rastreia_para:** FR-004, UX-001, INT-001, DOC-FND-000
- **tags:** alterar-senha, profile-widget, lacuna-fr
- **sla_data:** —
- **dependencias:** []

### Questão

O dropdown do ProfileWidget (FR-004, UX-002) lista a ação "Alterar Senha", que deveria disparar `POST /auth/change-password` (DOC-FND-000 §1.3). Porém, não existe nenhum FR dedicado ao fluxo de alteração de senha (campos senha_atual + nova_senha + confirmar_nova_senha), nenhum INT documentando o contrato desse endpoint e nenhum UIActionEnvelope correspondente em DATA-003.

### Impacto

Sem especificação, o fluxo de alteração de senha será implementado sem critérios de aceite definidos. A omissão pode levar a inconsistências de UX (ex.: modal vs página dedicada), falta de telemetria e ausência de testes E2E.

### Opções

**Opção A — Criar FR-007, INT-006 e UIActionEnvelope para "Alterar Senha":**
Especificar o fluxo completo: modal no ProfileWidget, campos senha_atual + nova_senha + confirmar, POST /auth/change-password, domain event `auth.password_changed` (DOC-FND-000 §1.2).

- Prós: Cobertura completa, rastreabilidade, testes E2E definidos
- Contras: Escopo adicional no MOD-001 (mais um FR + INT)

**Opção B — Adiar para MOD-002 ou sprint futuro:**
Marcar "Alterar Senha" como "roadmap futuro" no ProfileWidget dropdown (desabilitado ou oculto).

- Prós: Reduz escopo do MOD-001
- Contras: ProfileWidget entregue com funcionalidade incompleta, UX confusa

### Recomendação

Opção A — o fluxo de alteração de senha é parte natural do Shell de autenticação e o endpoint já existe no Foundation (DOC-FND-000 §1.3). O custo de especificar é baixo (FR-007 + INT-006 + 1 UIActionEnvelope) e a UX fica completa.

### Ação Sugerida

| Skill | Propósito | Quando executar |
|---|---|---|
| `/enrich-agent docs/04_modules/mod-001-backoffice-admin/ AGN-DEV-03` | Criar FR-007 (Alterar Senha) | Após decisão aceita |
| `/enrich-agent docs/04_modules/mod-001-backoffice-admin/ AGN-DEV-05` | Criar INT-006 (change-password) | Após FR-007 criado |

### Resolução

> **Decisão:** Opção A — Criar FR-007, INT-006 e UIActionEnvelope para "Alterar Senha"
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** O fluxo de alteração de senha é parte natural do Shell de autenticação e o endpoint já existe no Foundation (DOC-FND-000 §1.3). O custo de especificar é baixo (FR-007 + INT-006 + 1 UIActionEnvelope) e a UX fica completa. Adiar (Opção B) entregaria ProfileWidget com funcionalidade incompleta e UX confusa.
> **Artefato de saída:** FR-007 v0.1.0 (Alterar Senha via modal ProfileWidget), INT-006 v0.1.0 (POST /auth/change-password), DATA-003 v0.5.0 (UIActionEnvelope submit_change_password + correlação auth.password_changed), INT-001 v0.5.0 (tabela resumo atualizada)
> **Implementado em:** 2026-03-18

---

## PENDENTE-004 — Tela MFA (/login/mfa) referenciada mas nao especificada

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** BIZ
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-18
- **decidido_por:** usuário
- **opcao_escolhida:** B
- **justificativa_decisao:** Manter MFA como roadmap futuro conforme mod.md §2, mas implementar fallback defensivo no redirect. Garante que o princípio Zero-Blank-Screen (ADR-003) não seja violado caso o MOD-000 ative MFA antes do MOD-001 especificar a tela. Opção A (especificar tela MFA completa) aumenta escopo significativamente sem necessidade imediata.
- **modulo:** MOD-001
- **rastreia_para:** FR-001, UX-001, MOD-001
- **tags:** mfa, login, roadmap, lacuna-ux
- **sla_data:** —
- **dependencias:** []

### Questao

FR-001 especifica que login com `mfa_required=true` redireciona para `/login/mfa?session=temp_token`. Porem, o mod.md §2 lista "MFA/TOTP na tela de login (UX-MFA-001 — roadmap futuro)" no escopo "Nao Inclui". Nao ha FR, UX, INT ou Screen Manifest para a tela MFA. Se o MOD-000 ja suporta MFA, o redirect vai para uma rota inexistente.

### Impacto

Se o Foundation ativar MFA para algum tenant antes do MOD-001 especificar a tela, o usuario sera redirecionado para uma rota sem componente — resultando em 404 ou tela branca (viola principio Zero-Blank-Screen, ADR-003).

### Opcoes

**Opcao A — Especificar tela MFA minima no MOD-001 (UX-MFA-001):**
Criar FR, UX e INT para um fluxo MFA basico (input de codigo TOTP, validacao, redirect). Mover MFA de "Nao Inclui" para "Inclui" no mod.md.

- Pros: Evita rota orfao, cobertura completa
- Contras: Aumenta escopo significativamente

**Opcao B — Manter MFA como roadmap, mas adicionar fallback no redirect:**
Se `mfa_required=true` e a rota /login/mfa nao existe, exibir Toast informativo: "MFA requerido. Contate o administrador." e nao redirecionar.

- Pros: Escopo minimo, sem tela branca, graceful degradation
- Contras: Funcionalidade MFA indisponivel ate ser especificada

### Recomendacao

Opcao B — manter MFA como roadmap futuro conforme mod.md, mas implementar fallback defensivo no redirect. Isso garante que o principio Zero-Blank-Screen (ADR-003) nao seja violado mesmo se o MOD-000 ativar MFA antes do MOD-001 especificar a tela.

### Acao Sugerida (se aplicavel)

| Skill | Proposito | Quando executar |
|---|---|---|
| — | Adicionar tratamento defensivo de `mfa_required` em FR-001 | Apos decisao aceita |

### Resolução

> **Decisão:** Opção B — Manter MFA como roadmap, mas adicionar fallback no redirect
> **Decidido por:** usuário em 2026-03-18
> **Justificativa:** MFA permanece roadmap futuro (mod.md §2). Fallback defensivo evita rota órfã/tela branca caso MOD-000 ative MFA antes da tela ser especificada. Zero-Blank-Screen (ADR-003) preservado.
> **Artefato de saída:** FR-001 v0.6.0 — fallback defensivo mfa_required (Toast + não redireciona)
> **Implementado em:** 2026-03-18

---

## ~~PENDENTE-005~~ — ✅ IMPLEMENTADA: Testes unitários para os 16 artefatos gerados

- **Questão:** Nenhum arquivo de teste foi gerado pelo AGN-COD-WEB. Os 16 artefatos (data, domain, ui) não possuem testes unitários correspondentes. Os cenários Gherkin em FR-001..FR-007 não possuem testes E2E/integração associados.
- **Impacto:** Qualidade de código: regressões não detectadas, FR sem critérios de aceite automatizados, cobertura zero.
- **Opções:**
  - **Opção A:** Criar testes unitários para camada domain (greeting.ts, sidebar-config.ts, shortcut-config.ts) e data (api-client.ts, hooks)
  - **Opção B:** Criar testes de componente (React Testing Library) para LoginPage, DashboardPage, AppShell, ChangePasswordModal, Toast
  - **Opção C:** Ambos A + B
- **Recomendação:** Opção C — testes de domain/data são rápidos e de alto valor; testes de componente cobrem os cenários Gherkin.
- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **domínio:** QA
- **tipo:** LACUNA
- **origem:** AGN-COD-VAL (codegen)
- **criado_em:** 2026-03-23
- **criado_por:** AGN-COD-VAL
- **decidido_em:** 2026-03-24
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** C
- **justificativa_decisao:** Ambas as camadas de teste são necessárias: testes unitários de domain/data garantem lógica pura e hooks isolados; testes de componente (React Testing Library) cobrem cenários Gherkin de FR-001..FR-007 e validam integração UI. Opção A sozinha não cobre interações de tela; Opção B sozinha não testa lógica isolada. Cobertura completa é requisito MUST (NFR-001).
- **modulo:** MOD-001
- **rastreia_para:** [FR-001, FR-002, FR-003, FR-004, FR-005, FR-007, NFR-001]
- **tags:** [testes, cobertura, qualidade, codegen-val]
- **sla_data:** —
- **dependencias:** []

### Resolução

> **Decisão:** Opção C — Ambos A + B (testes unitários domain/data + testes de componente)
> **Decidido por:** Marcos Sulivan em 2026-03-24
> **Justificativa:** Testes unitários de domain/data são rápidos e de alto valor para lógica pura (greeting, sidebar-config, shortcut-config, api-client, hooks). Testes de componente (React Testing Library) cobrem cenários Gherkin e validam integração UI (LoginPage, DashboardPage, AppShell, ChangePasswordModal, Toast). Cobertura completa é requisito MUST (NFR-001).
> **Artefato de saída:** vitest.config.ts, test-setup.ts, __tests__/test-utils.tsx, greeting.test.ts, sidebar-config.test.ts, shortcut-config.test.ts, api-client.test.ts, Toast.test.tsx, ChangePasswordModal.test.tsx, ProfileWidget.test.tsx, LoginPage.test.tsx, DashboardPage.test.tsx, AppShell.test.tsx
> **Implementado em:** 2026-03-24

---

## ~~PENDENTE-006~~ — ✅ IMPLEMENTADA: UIActionEnvelope / Telemetria (FR-006)

- **Questão:** FR-006 requer integração com `@easycf/ui-telemetry` emitindo UIActionEnvelope para todas as ações não-client_only (submit_login, submit_logout, load_current_user, etc.). Nenhum dos 16 arquivos implementa telemetria. O catálogo DATA-003 define 12 UIActionEnvelopes que não possuem código correspondente.
- **Impacto:** Observabilidade: sem correlação UI↔backend, sem rastreabilidade de ações, sem dados para auditoria/timeline. Afeta SEC-002 (matriz de autorização depende de UIActionEnvelopes), NFR-001 §3 (requisito MUST).
- **Opções:**
  - **Opção A:** Criar `data/telemetry.ts` com helpers de emissão e integrar em cada hook de mutação/query
  - **Opção B:** Adiar para sprint dedicado de observabilidade
- **Recomendação:** Opção A — é um requisito MUST (NFR-001 §3). O módulo de telemetria pode ser um wrapper simples que emite para console/endpoint.
- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **domínio:** ARC
- **tipo:** LACUNA
- **origem:** AGN-COD-VAL (codegen)
- **criado_em:** 2026-03-23
- **criado_por:** AGN-COD-VAL
- **decidido_em:** 2026-03-24
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Telemetria UIActionEnvelope é requisito MUST (NFR-001 §3). Criar data/telemetry.ts com helpers de emissão e integrar em cada hook de mutação/query garante observabilidade completa, correlação UI↔backend e rastreabilidade para auditoria (SEC-002). Adiar (Opção B) viola o requisito MUST e deixa o módulo sem observabilidade.
- **modulo:** MOD-001
- **rastreia_para:** [FR-006, BR-006, SEC-002, DATA-003, NFR-001]
- **tags:** [telemetria, ui-action-envelope, observabilidade, codegen-val]
- **sla_data:** —
- **dependencias:** []

### Resolução

> **Decisão:** Opção A — Criar `data/telemetry.ts` com helpers de emissão e integrar em cada hook de mutação/query
> **Decidido por:** Marcos Sulivan em 2026-03-24
> **Justificativa:** Telemetria UIActionEnvelope é requisito MUST (NFR-001 §3). Helpers centralizados em telemetry.ts garantem consistência na emissão dos 12 UIActionEnvelopes catalogados em DATA-003. Integração nos hooks existentes (useLogin, useLogout, useAuthMe, etc.) minimiza impacto. Adiar deixaria o módulo sem observabilidade, violando NFR-001 e comprometendo SEC-002.
> **Artefato de saída:** telemetry.ts (novo), use-login.ts, use-logout.ts, use-forgot-password.ts, use-reset-password.ts, use-change-password.ts, use-auth-me.ts (integração UIActionEnvelope)
> **Implementado em:** 2026-03-24

---

## ~~PENDENTE-007~~ — ✅ IMPLEMENTADA: Interceptor HTTP 401 não é global

- **Questão:** SEC-001 §6 exige interceptor HTTP global que redireciona para /login em qualquer 401. Atualmente, o tratamento de 401 está disperso em componentes individuais (AppShell.tsx, DashboardPage.tsx). O api-client.ts lança ApiError(401) mas não redireciona.
- **Impacto:** Se uma nova tela for adicionada sem tratar 401 explicitamente, o redirect não ocorrerá — sessão expirada sem feedback ao usuário.
- **Opções:**
  - **Opção A:** Centralizar redirect 401 no `apiRequest()` do api-client.ts
  - **Opção B:** Criar React context/provider de auth que intercepta erros 401 globalmente
- **Recomendação:** Opção A — mais simples, garante que qualquer chamada via apiRequest() trate 401.
- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** ARC
- **tipo:** LACUNA
- **origem:** AGN-COD-VAL (codegen)
- **criado_em:** 2026-03-23
- **criado_por:** AGN-COD-VAL
- **decidido_em:** 2026-03-24
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Centralizar redirect 401 no apiRequest() do api-client.ts é a abordagem mais simples e robusta. Qualquer chamada HTTP via apiRequest() terá tratamento automático de sessão expirada, sem depender de cada componente tratar 401 individualmente. Opção B (React context/provider) adiciona complexidade desnecessária — o interceptor na camada de rede é suficiente e cobre chamadas fora de componentes React.
- **modulo:** MOD-001
- **rastreia_para:** [SEC-001, FR-004, NFR-001]
- **tags:** [interceptor, 401, segurança, codegen-val]
- **sla_data:** —
- **dependencias:** []

### Resolução

> **Decisão:** Opção A — Centralizar redirect 401 no `apiRequest()` do api-client.ts
> **Decidido por:** Marcos Sulivan em 2026-03-24
> **Justificativa:** Interceptor na camada de rede (apiRequest) é mais simples e cobre 100% das chamadas HTTP. Componentes individuais não precisam tratar 401 — o redirect para /login ocorre automaticamente. Opção B (React context) adiciona complexidade sem benefício adicional.
> **Artefato de saída:** AMD-SEC-001-001 (emenda), api-client.ts v0.3.0 (interceptor 401 global com redirect /login)
> **Implementado em:** 2026-03-24

---

## ~~PENDENTE-008~~ — ✅ IMPLEMENTADA: Timeout de auth_me (5s vs 3s especificado)

- **Questão:** O api-client.ts usa timeout fixo de 5000ms para todas as requisições. INT-005 especifica timeout de 3000ms para auth_me. O DashboardPage implementa skeleton timeout de 3s, mas a requisição fetch pode rodar por mais 2s em background.
- **Impacto:** Desalinhamento entre timeout de rede e timeout de UI. Requisição pode completar após o estado de erro já ser exibido.
- **Opções:**
  - **Opção A:** Aceitar parâmetro `timeout` opcional em `RequestOptions`
  - **Opção B:** Manter timeout fixo 5s e confiar no skeleton timeout de 3s como guard de UX
- **Recomendação:** Opção A — permite configurar timeout por endpoint, alinhando fetch e UX.
- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **domínio:** ARC
- **tipo:** LACUNA
- **origem:** AGN-COD-VAL (codegen)
- **criado_em:** 2026-03-23
- **criado_por:** AGN-COD-VAL
- **decidido_em:** 2026-03-24
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Parâmetro timeout opcional em RequestOptions permite alinhar timeout de rede com timeout de UX por endpoint. INT-005 especifica 3000ms para auth_me enquanto o default geral é 5000ms — sem configurabilidade, o skeleton timeout de 3s exibe estado de erro enquanto o fetch ainda roda por mais 2s em background, causando race condition visual.
- **modulo:** MOD-001
- **rastreia_para:** [INT-005, BR-009, NFR-001]
- **tags:** [timeout, auth-me, api-client, codegen-val]
- **sla_data:** —
- **dependencias:** []

### Resolução

> **Decisão:** Opção A — Aceitar parâmetro `timeout` opcional em `RequestOptions`
> **Decidido por:** Marcos Sulivan em 2026-03-24
> **Justificativa:** Configurar timeout por endpoint alinha fetch e UX. INT-005 especifica 3000ms para auth_me; sem isso, o skeleton timeout de 3s entra em estado de erro enquanto o fetch de 5s ainda roda em background.
> **Artefato de saída:** AMD-INT-005-001 (emenda), api-client.ts v0.2.0 (timeout opcional), use-auth-me.ts v0.2.0 (timeout: 3000)
> **Implementado em:** 2026-03-24

---

## ~~PENDENTE-009~~ — ✅ IMPLEMENTADA: Erros de lint do codegen (ESLint + Prettier)

- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** ARC
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE
- **criado_em:** 2026-03-24
- **criado_por:** validate-all
- **decidido_em:** 2026-03-24
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Correção incremental em 3 fases (format → lint:fix → refactor hooks), consistente com PEN-000 PENDENTE-018 já implementada. Fases 1 e 2 são automatizáveis, fase 3 segue padrão repetitivo.
- **modulo:** MOD-001
- **rastreia_para:** DOC-PADRAO-002, DOC-ARC-002, PEN-000/PENDENTE-018
- **tags:** lint, eslint, prettier, codegen
- **sla_data:** 2026-04-23
- **dependencias:** []

### Questão

Código gerado pelo codegen (PKG-COD-001) para o MOD-001 não passa em `pnpm lint` nem `pnpm format:check`. São 7 ocorrências de lint no módulo `web/backoffice-admin`. Isto viola DOC-PADRAO-002 §4.3 (regra MUST: todo código novo DEVE passar em `pnpm lint` sem erros antes de merge) e o gate `lint` do DOC-ARC-002. Parte do problema cross-module documentado em PEN-000 PENDENTE-018 (55 errors + 91 warnings em 19 módulos).

### Impacto

- Gate `lint` do CI (DOC-ARC-002) falharia se ativado — bloqueia pipeline para MOD-001
- Erros incluem `react-hooks/set-state-in-effect` (cascading renders em produção)
- Warnings `@typescript-eslint/no-unused-vars` poluem output de lint
- Formatação Prettier divergente dificulta code review e diffs

### Detalhamento dos erros (web/backoffice-admin: 7)

| Regra | Qtd | Descrição |
|---|---|---|
| `react-hooks/set-state-in-effect` | — | setState síncrono dentro de useEffect — causa cascading renders |
| `@typescript-eslint/no-unused-vars` | — | Imports/variáveis não utilizados |
| Formatação Prettier | — | Divergência de formatação automática |

> Nota: contagem exata por regra deve ser obtida via `pnpm lint --filter @easycf/web -- --no-warn-ignored 2>&1 | grep backoffice-admin`.

### Opções

**Opção A — Correção incremental em 3 fases (alinhada com PEN-000 PENDENTE-018):**

1. `pnpm format` — corrige formatação Prettier automaticamente (0 risco)
2. `pnpm lint:fix` + remoção manual de unused imports/vars — elimina warnings
3. Refatoração dos errors React (extrair lógica de setState para callbacks/reducers)

- Prós: Baixo risco, cada fase é independente e reversível, consistente com decisão já tomada em PEN-000 PENDENTE-018
- Contras: Fase 3 requer entendimento da lógica de cada componente

**Opção B — Relaxar regras temporariamente com `eslint-disable`:**

Adicionar `eslint-disable` nos arquivos afetados e criar backlog de correção.

- Prós: Desbloqueia CI imediatamente
- Contras: Dívida técnica acumulada, esconde problemas reais (cascading renders). Opção C do PEN-000 PENDENTE-018 já foi descartada.

### Recomendação

Opção A — Correção incremental em 3 fases, consistente com a decisão já tomada em PEN-000 PENDENTE-018 (IMPLEMENTADA). As fases 1 e 2 são totalmente automatizáveis. A fase 3 segue padrão repetitivo (extrair setState para callback pattern).

### Ação Sugerida

| Skill / Comando | Propósito | Quando executar |
|---|---|---|
| `pnpm format` | Fase 1: auto-formatação Prettier | Imediatamente |
| `pnpm lint:fix` | Fase 2: auto-fix warnings ESLint | Após fase 1 |
| Refatoração manual | Fase 3: corrigir errors React hooks | Após fase 2 |

### Resolução (preenchido quando DECIDIDA)

> **Decisão:** Opção A — Correção incremental em 3 fases
> **Decidido por:** Marcos Sulivan em 2026-03-24
> **Justificativa:** Abordagem de baixo risco, cada fase independente e reversível. Consistente com PEN-000 PENDENTE-018. Fases 1-2 automatizáveis, fase 3 padrão repetitivo (extrair setState para callbacks).
> **Artefato de saída:** Verificação confirmou 0 errors ESLint + 0 divergências Prettier em backoffice-admin (já corrigidos via PEN-000/PENDENTE-018)
> **Implementado em:** 2026-03-24

---

> **Nota de governanca:** Todos os PENDENTEs devem ser resolvidos antes de promover o modulo para `estado_item: READY`. Resolucao = tomar a decisao, incorporar no requisito afetado e atualizar status para RESOLVIDO.

- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-24
- **rastreia_para:** US-MOD-001, FR-001, FR-004, FR-005, UX-001, BR-005, NFR-001, DOC-FND-000, ADR-003, DOC-PADRAO-002
- **referencias_exemplos:** EX-CI-007
- **evidencias:** PENDENTE-009 — IMPLEMENTADA (0 errors confirmados em 2026-03-24, já corrigidos via PEN-000/PENDENTE-018)
