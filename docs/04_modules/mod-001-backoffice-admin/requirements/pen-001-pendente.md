> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-16 | arquitetura | Baseline Inicial (forge-module) |
> | 0.12.0 | 2026-03-18 | Marcos Sulivan | PENDENTE-003 → IMPLEMENTADA — FR-007, INT-006, DATA-003 v0.5.0 (submit_change_password) |
| 0.11.0 | 2026-03-18 | Marcos Sulivan | PENDENTE-003 → DECIDIDA (Opção A) — Criar FR-007, INT-006, UIActionEnvelope |
| 0.10.0 | 2026-03-18 | Marcos Sulivan | PENDENTE-002 → IMPLEMENTADA — Opção B (FR-004 v0.7.0, UX-001 v0.5.0) |
| 0.9.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-002 → DECIDIDA (Opção B) |
| 0.8.0  | 2026-03-18 | usuário     | PENDENTE-004 implementada — fallback defensivo MFA em FR-001 v0.6.0 |
| 0.7.0  | 2026-03-18 | usuário     | PENDENTE-004 decidida — Opção B (fallback defensivo MFA redirect) |
| 0.6.0  | 2026-03-18 | usuário     | PENDENTE-001 implementada — cache auth_me via React Query (30s TTL) adicionado em FR-004/FR-005 |
> | 0.5.0  | 2026-03-18 | usuário     | PENDENTE-001 decidida — Opção C (React Query/SWR cache 30s) |
> | 0.4.0  | 2026-03-17 | AGN-DEV-10  | Batch 4 — adiciona PENDENTE-003 (Alterar Senha) e PENDENTE-004 (MFA UX) |
> | 0.3.0  | 2026-03-17 | AGN-DEV-10  | Re-enriquecimento — adiciona status de resolução, metadata, EX-* |
> | 0.2.0  | 2026-03-16 | AGN-DEV-10  | Enriquecimento PENDENTE (enrich-agent) |

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

> **Nota de governanca:** Todos os PENDENTEs devem ser resolvidos antes de promover o modulo para `estado_item: READY`. Resolucao = tomar a decisao, incorporar no requisito afetado e atualizar status para RESOLVIDO.

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-18
- **rastreia_para:** US-MOD-001, FR-001, FR-004, FR-005, UX-001, BR-005, NFR-001, DOC-FND-000, ADR-003
- **referencias_exemplos:** EX-CI-007
- **evidencias:** N/A
