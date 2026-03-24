> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 1.2.0  | 2026-03-24 | Marcos Sulivan | PENDENTE-005 → IMPLEMENTADA — Opção A (12 subclasses → DomainError, code→type /problems/identity/*, httpStatus→statusHint) |
| 1.1.0  | 2026-03-24 | Marcos Sulivan | PENDENTE-005 → DECIDIDA (Opção A — refatorar IdentityDomainError → DomainError) |
| 1.0.0  | 2026-03-24 | Marcos Sulivan | PENDENTE-004 → IMPLEMENTADA — Opção A (4x no-explicit-any removidos, Prettier aplicado) |
| 0.9.0  | 2026-03-24 | Marcos Sulivan | PENDENTE-004 → DECIDIDA (Opção A — correção incremental lint 3 fases) |
| 0.8.0  | 2026-03-24 | validate-all  | Adição PENDENTE-005 — IdentityDomainError não estende DomainError (type+statusHint) |
> | 0.7.0  | 2026-03-24 | validate-all  | Adição PENDENTE-004 — erros lint codegen (18 ocorrências) |
> | 0.1.0  | 2026-03-17 | AGN-DEV-10  | Criação Batch 4 (enrich-agent) |
> | 0.2.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-001 → DECIDIDA (Opção A) |
> | 0.3.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-001 → IMPLEMENTADA (DOC-FND-000 §2.2) |
> | 0.4.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-003 → IMPLEMENTADA — Opção A (TTL 300s no cache Redis, INT-001.1 v0.4.0) |
> | 0.5.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-002 → DECIDIDA (Opção A) |
> | 0.6.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-002 → IMPLEMENTADA — Opção A (INT-001.5 v0.5.0) |

# PEN-004 — Questões Abertas da Identidade Avançada

- **estado_item:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-24
- **rastreia_para:** MOD-004, SEC-001, DOC-FND-000, UX-001, INT-001, DOC-PADRAO-002, DOC-GNP-00, DOC-ARC-001
- **evidencias:** PENDENTE-004 — 18 erros lint codegen; PENDENTE-005 — IdentityDomainError não estende DomainError (type+statusHint)

---

## Painel de Controle

| # | Sev | Status | Título | Domínio | Tipo |
|---|:---:|:---:|---|---|---|
| PENDENTE-001 | 🟠 ALTA | ✅ IMPLEMENTADA | ~~Scopes MOD-004 ausentes no catálogo canônico DOC-FND-000 §2.2~~ | SEC | LACUNA |
| PENDENTE-002 | 🟡 MÉDIA | ✅ IMPLEMENTADA | ~~Contrato de consumo de user_org_scopes por módulos dependentes~~ | INT | LACUNA |
| PENDENTE-003 | 🟡 MÉDIA | ✅ IMPLEMENTADA | ~~Estratégia de expiração do cache Redis (TTL vs invalidação pura)~~ | ARC | DEC-TEC |
| PENDENTE-004 | 🟡 MÉDIA | ✅ IMPLEMENTADA | ~~Erros de lint do codegen (ESLint + Prettier) — 18 ocorrências~~ | ARC | CONTRADIÇÃO |
| PENDENTE-005 | 🟠 ALTA | ✅ IMPLEMENTADA | ~~IdentityDomainError não estende DomainError (type+statusHint)~~ | ARC | CONTRADIÇÃO |

---

## PENDENTE-001 — Scopes MOD-004 Ausentes no Catálogo Canônico DOC-FND-000 §2.2

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **domínio:** SEC
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Registrar os 8 scopes agora desbloqueia Gate 3 e segue o padrão já aplicado por MOD-003 e MOD-005
- **modulo:** MOD-004
- **rastreia_para:** SEC-001, DOC-FND-000, MOD-000
- **tags:** scopes, catalogo-canonico, rbac, gate-3
- **sla_data:** —
- **dependencias:** []

### Questão

O SEC-001 §2.1 define 8 escopos para o MOD-004 (`identity:org_scope:read`, `identity:org_scope:write`, `identity:share:read`, `identity:share:write`, `identity:share:revoke`, `identity:share:authorize`, `identity:delegation:read`, `identity:delegation:write`). Porém, o catálogo canônico em DOC-FND-000 §2.2 NÃO lista nenhum desses scopes. Conforme DOC-FND-000 §2.2: "Todo módulo que adiciona novos scopes DEVE registrá-los via PR atualizando o catálogo canônico." Adicionalmente, a regra de Gate 3 (DOC-ARC-003B) determina que o CI DEVE falhar se encontrar scope não registrado.

### Impacto

Sem o registro no catálogo canônico, o Gate 3 do CI falhará ao validar os Screen Manifests do MOD-004. Os 8 scopes ficam sem rastreabilidade centralizada e outros módulos não podem referenciar os scopes de identidade avançada.

### Opções

**Opção A — PR para DOC-FND-000 §2.2 agora:**
Registrar os 8 scopes no catálogo canônico imediatamente, seguindo o padrão de 3 segmentos já adotado.

- Prós: desbloqueia Gate 3; rastreabilidade imediata; padrão seguido
- Contras: requer revisão da DOC-FND-000 (documento normativo)

**Opção B — Registrar junto com a primeira implementação:**
Adiar o registro para quando o primeiro PR de código do MOD-004 for aberto.

- Prós: registro junto com implementação real; menos churn em docs
- Contras: Gate 3 falha até o PR; outros módulos não podem referenciar os scopes antecipadamente

### Recomendação

Opção A — Registrar agora. O registro é simples (adicionar 8 linhas na tabela), segue o padrão já aplicado por MOD-003 e MOD-005, e desbloqueia Gate 3 para validação dos Screen Manifests.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| Edição direta em DOC-FND-000 §2.2 | Adicionar 8 scopes do MOD-004 | Ao decidir Opção A |

### Resolução (preenchido quando DECIDIDA)

> **Decisão:** Opção A — PR para DOC-FND-000 §2.2 agora
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** O registro é simples (adicionar 8 linhas na tabela), segue o padrão já aplicado por MOD-003 e MOD-005, e desbloqueia Gate 3 para validação dos Screen Manifests.
> **Artefato de saída:** DOC-FND-000 §2.2 (8 scopes identity:* adicionados ao catálogo canônico)
> **Implementado em:** 2026-03-18

---

## PENDENTE-002 — Contrato de Consumo de user_org_scopes por Módulos Dependentes

- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** INT
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Contrato de exposição centralizado no MOD-004 é mais seguro que documentação dispersa nos consumidores — permite avaliar impacto de mudanças em user_org_scopes
- **modulo:** MOD-004
- **rastreia_para:** INT-001, MOD-005, MOD-006, MOD-007, MOD-008
- **tags:** integracao, consumo, user-org-scopes, dependentes
- **sla_data:** —
- **dependencias:** []

### Questão

O mod.md §4 lista MOD-005, MOD-006, MOD-007 e MOD-008 como módulos dependentes que consomem `user_org_scopes` para filtrar dados por área organizacional. Porém, INT-001 documenta apenas as integrações que o MOD-004 CONSOME (Redis, BullMQ, MOD-000, MOD-003), e não o contrato que o MOD-004 EXPÕE para consumidores. Não existe documentação de como os módulos downstream devem consultar `user_org_scopes` (JOIN direto? API interna? Event subscription?).

### Impacto

Sem contrato explícito, cada módulo consumidor pode implementar o consumo de forma diferente, gerando acoplamento inconsistente. Se o MOD-004 mudar a estrutura de `user_org_scopes`, não há referência para avaliar impacto nos dependentes.

### Opções

**Opção A — Documentar contrato de exposição em INT-001:**
Adicionar seção INT-001.5 com o contrato que o MOD-004 expõe: tabela `user_org_scopes` via JOIN direto (banco compartilhado), com campos, índices e regras de filtragem documentados.

- Prós: contrato explícito; impacto avaliável em mudanças; padrão INT reaproveitável
- Contras: pode ser prematuro se os módulos consumidores ainda não estão especificados

**Opção B — Delegar aos módulos consumidores:**
Cada MOD-005/006/007/008 documenta em seu próprio INT como consome `user_org_scopes`.

- Prós: responsabilidade do consumidor; documentação onde é usada
- Contras: risco de inconsistência; sem visão centralizada no MOD-004

### Recomendação

Opção A — Documentar o contrato de exposição no INT-001 do MOD-004. Quando os módulos consumidores forem especificados, eles referenciam o contrato do MOD-004 em seus respectivos INTs.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| `/enrich-agent MOD-004 AGN-DEV-05` | Enriquecer INT-001 com seção INT-001.5 (contrato de exposição) | Ao decidir Opção A |

### Resolução (preenchido quando DECIDIDA)

> **Decisão:** Opção A — Documentar contrato de exposição em INT-001 (seção INT-001.5)
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** Contrato de exposição centralizado no INT-001 do MOD-004 permite avaliar impacto de mudanças em `user_org_scopes` nos módulos consumidores (MOD-005/006/007/008). Documentação dispersa nos consumidores geraria inconsistência e perda de visão centralizada.
> **Artefato de saída:** INT-001.5 v0.5.0 (contrato de exposição user_org_scopes — tabela exposta, regras de consumo, padrão JOIN, invalidação, módulos consumidores registrados)
> **Implementado em:** 2026-03-18

---

## ~~PENDENTE-003 — Estratégia de Expiração do Cache Redis (TTL vs Invalidação Pura)~~

- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** TTL de 300s como safety net contra falha dupla (Worker + DEL), alinhado com OKR-3 (< 5min). Custo aceitável (1 query extra/usuário/5min).
- **modulo:** MOD-004
- **rastreia_para:** INT-001.1, NFR-001.1, DATA-001, ADR-003
- **tags:** redis, cache, ttl, invalidacao, performance
- **sla_data:** —
- **dependencias:** []

### Questão

INT-001.1 define invalidação de cache Redis via `DEL auth:org_scope:user:{userId}` em mutações (create/delete/expire). Porém, não está definido se a chave de cache é populada com TTL (auto-expira) ou se depende exclusivamente de invalidação explícita. Se o Worker de expiração (INT-001.2) falhar e a invalidação Redis também falhar (fallback: log + continue), um usuário poderia manter cache stale indefinidamente com escopos organizacionais já expirados.

### Impacto

Sem TTL no cache, uma falha dupla (Worker parado + Redis DEL falhando) pode manter escopos organizacionais desatualizados no cache por tempo indeterminado, afetando a filtragem por área em módulos consumidores (MOD-005–008).

### Opções

**Opção A — TTL no cache (ex: 5 minutos):**
Definir TTL na chave `auth:org_scope:user:{userId}` igual ao intervalo do job de expiração. O cache auto-expira mesmo se a invalidação explícita falhar.

- Prós: safety net contra falha dupla; comportamento previsível; alinhado com OKR-3 (< 5min)
- Contras: cache miss mais frequente (a cada 5 min mesmo sem mutação); leve aumento de carga no DB

**Opção B — Invalidação pura (sem TTL):**
Confiar exclusivamente no `DEL` explícito. Se falhar, o próximo acesso usa cache stale até a próxima mutação.

- Prós: cache hit máximo; sem round-trips desnecessários ao DB
- Contras: risco de stale cache em falha dupla; sem safety net

### Recomendação

Opção A — Usar TTL de 5 minutos, alinhado com o intervalo do background job. O custo de cache miss eventual (1 query extra por usuário a cada 5 min) é aceitável como safety net contra falha dupla.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| `/enrich-agent MOD-004 AGN-DEV-05` | Atualizar INT-001.1 com definição de TTL | Ao decidir Opção A |

### Resolução (preenchido quando DECIDIDA)

> **Decisão:** Opção A — TTL de 300s (5 minutos) no cache Redis
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** Safety net contra falha dupla (Worker parado + Redis DEL falhando). TTL alinhado com intervalo do background job (5min) e OKR-3. Custo aceitável: 1 query extra por usuário a cada 5 min sem mutação.
> **Artefato de saída:** INT-001.1 v0.4.0 (contrato SET com EX 300 + nota safety net)
> **Implementado em:** 2026-03-18

---

## PENDENTE-004 — Erros de lint do codegen (ESLint + Prettier)

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
- **justificativa_decisao:** Correção incremental em 3 fases (format → lint:fix → refactor), consistente com PEN-000 PENDENTE-018 já implementada. Fases 1-2 automatizáveis, fase 3 segue padrão repetitivo.
- **modulo:** MOD-004
- **rastreia_para:** DOC-PADRAO-002, DOC-ARC-002, PEN-000/PENDENTE-018
- **tags:** lint, eslint, prettier, codegen
- **sla_data:** 2026-04-23
- **dependencias:** []

### Questão

Código gerado pelo codegen não passa em `pnpm lint`. 18 ocorrências de lint neste módulo (web/identity-advanced: 16, api/identity-advanced: 2). Parte do problema cross-module documentado em PEN-000 PENDENTE-018 (55 errors + 91 warnings em 19 módulos). Viola DOC-PADRAO-002 §4.3.

### Impacto

Gate `lint` do DOC-ARC-002 falharia se ativado. Erros incluem `react-hooks/set-state-in-effect` (cascading renders), `no-unused-vars` e formatação Prettier divergente.

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

### Resolução (preenchido quando DECIDIDA)

> **Decisão:** Opção A — Correção incremental em 3 fases
> **Decidido por:** Marcos Sulivan em 2026-03-24
> **Justificativa:** Correção incremental (format → lint:fix → refactor) é baixo risco, cada fase independente e reversível. Consistente com decisão já tomada em PEN-000 PENDENTE-018 (IMPLEMENTADA). Fases 1-2 automatizáveis, fase 3 segue padrão repetitivo (extrair setState para callback).
> **Artefato de saída:** identity-advanced.route.ts (4x `no-explicit-any` removidos, Prettier aplicado)
> **Implementado em:** 2026-03-24

---

## PENDENTE-005 — IdentityDomainError não estende DomainError (type+statusHint)

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **domínio:** ARC
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE
- **criado_em:** 2026-03-24
- **criado_por:** validate-all
- **decidido_em:** 2026-03-24
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Refatorar para estender DomainError. Custo baixo (12 classes, rename de 2 propriedades), benefício alto (compliance total com error handler Foundation + RFC 9457). Todos os outros módulos já seguem este padrão.
- **modulo:** MOD-004
- **rastreia_para:** DOC-GNP-00, DOC-ARC-001, DOC-ARC-002
- **tags:** domain-error, rfc-9457, error-handler, base-class
- **sla_data:** 2026-04-07
- **dependencias:** []

### Questão

O MOD-004 define uma base class `IdentityDomainError` própria em `apps/api/src/modules/identity-advanced/domain/errors/identity-errors.ts` com propriedades `code: string` e `httpStatus: number`. Essa classe NÃO estende a `DomainError` da Foundation (`apps/api/src/modules/foundation/domain/errors/domain-errors.ts`), que usa `type: string` (RFC 9457 URI) e `statusHint: number`. Todos os outros módulos (mcp, movement-approval, org-units) estendem corretamente `DomainError`.

### Impacto

O error handler global da Foundation (que converte `DomainError` em RFC 9457 Problem Details responses) não reconhecerá os erros do MOD-004. Em vez de respostas estruturadas com `type`, `title`, `status`, `detail`, o handler retornará 500 genérico para todos os erros de domínio do MOD-004. Isso afeta os 12 erros definidos (DuplicatePrimaryScopeError, OrgUnitNotN1N4Error, etc.).

### Opções

**Opção A — Refatorar IdentityDomainError para estender DomainError:**
Alterar `IdentityDomainError extends Error` para `IdentityDomainError extends DomainError`. Renomear `code` para `type` (prefixando com `/problems/identity/`), renomear `httpStatus` para `statusHint`. Atualizar todas as 12 subclasses.

- Prós: alinhamento total com Foundation; error handler funciona; RFC 9457 compliance
- Contras: refatoração de 12 classes (impacto moderado)

**Opção B — Registrar handler secundário para IdentityDomainError:**
Manter a base class separada e registrar um mapeador adicional no error handler.

- Prós: sem alteração nas classes existentes
- Contras: duplicação de lógica; divergência arquitetural mantida; debt técnico crescente

### Recomendação

Opção A — Refatorar para estender DomainError. O custo é baixo (12 classes, rename de 2 propriedades) e o benefício é compliance total com o error handler e RFC 9457.

### Resolução (preenchido quando DECIDIDA)

> **Decisão:** Opção A — Refatorar IdentityDomainError para estender DomainError
> **Decidido por:** Marcos Sulivan em 2026-03-24
> **Justificativa:** Custo baixo (12 classes, rename code→type + httpStatus→statusHint), benefício alto (error handler Foundation reconhece erros MOD-004, RFC 9457 compliance). Todos os outros módulos já estendem DomainError.
> **Artefato de saída:** identity-errors.ts (12 subclasses agora estendem DomainError, type=/problems/identity/*, statusHint preservado)
> **Implementado em:** 2026-03-24
