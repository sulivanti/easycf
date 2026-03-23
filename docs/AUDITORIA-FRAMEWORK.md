# Auditoria Completa — EasyCodeFramework

> **Data da re-auditoria:** 2026-03-20
> **Versão do projeto:** 0.5.0
> **Escopo:** Documentação, Skills, Agentes, Normativos, Infraestrutura

---

## Sumário Executivo

| Métrica | Valor Anterior | Valor Atual | Δ |
|---------|----------------|-------------|---|
| Módulos | 12 (MOD-000 a MOD-011) | 12 (MOD-000 a MOD-011) | = |
| Status geral | Todos DRAFT | Todos DRAFT | = |
| Skills/Commands | 23 | 24 | **+1** (`merge-amendment`) |
| Agentes de enriquecimento | 11 (AGN-DEV-01 a AGN-DEV-11) | 11 | = |
| Documentos normativos | 18 (DOC-*) | 18 | = |
| User stories | 77 (11 epics + 66 features) | 76 (12 epics + 63 features + 1 template) | ~ |
| Screen manifests | 25 YAML | 25 YAML + 1 schema | = |
| Erros de lint | **89** | **0** | **↓ 100%** |
| IDs de exemplo indefinidos | **64** (21 IDs) | **0** (0 IDs) | **↓ 100%** |

---

## Legenda de Status

| Tag | Significado |
|-----|-------------|
| ✅ CORRIGIDO | Problema identificado na auditoria anterior e já resolvido |
| ⚠️ PENDENTE | Problema ainda aberto, precisa de ação |
| 🔘 NÃO APLICÁVEL | Falso positivo ou item que não precisa de ajuste |

---

## 1. Erros de Lint e Validação

**Fonte anterior:** `lint-errors.json` — 89 erros.
**Estado atual:** `lint-errors.json` — **0 erros**.

### 1.1 Referências de Arquivo Quebradas — ✅ CORRIGIDO (10 → 0)

| Item | Status | Detalhe |
|------|--------|---------|
| `mod-007/requirements/data/DATA-007.md` | ✅ CORRIGIDO | Arquivo criado via `/enrich` |
| `mod-007/requirements/data/DATA-003.md` | ✅ CORRIGIDO | Arquivo criado via `/enrich` |
| `mod-007/requirements/int/INT-007.md` | ✅ CORRIGIDO | Arquivo criado via `/enrich` |
| `mod-007/requirements/sec/SEC-007.md` | ✅ CORRIGIDO | Arquivo criado via `/enrich` |
| `mod-007/requirements/sec/SEC-002.md` | ✅ CORRIGIDO | Arquivo criado via `/enrich` |
| `mod-007/requirements/ux/UX-007.md` | ✅ CORRIGIDO | Arquivo criado via `/enrich` |
| `mod-007/requirements/nfr/NFR-007.md` | ✅ CORRIGIDO | Arquivo criado via `/enrich` |
| `mod-007/requirements/pen-007-pendente.md` | ✅ CORRIGIDO | Arquivo criado via `/enrich` |
| `mod-005/UX-005.md` ref `ux-proc-001.editor-visual.yaml` | 🔘 NÃO APLICÁVEL | Path `../../../../05_manifests/screens/` está correto (4 níveis acima resolve para `docs/05_manifests/`). Arquivo YAML existe. Auditoria anterior errou a contagem de `../` |
| `mod-005/UX-005.md` ref `ux-proc-002.config-estagio.yaml` | 🔘 NÃO APLICÁVEL | Idem acima |

### 1.2 IDs de Exemplo Indefinidos — ✅ CORRIGIDO (64 → 0)

**Todos os 21 IDs EX-\* agora definidos** em normativos (32 definições detectadas pelo linter, 301 referências resolvidas):

| ID | Status | Localização |
|----|--------|-------------|
| `EX-AUTH-001` | ✅ CORRIGIDO | DOC-FND-000 — Middleware RBAC (requireScope) |
| `EX-PII-001` | ✅ CORRIGIDO | DOC-FND-000 — Mascaramento de PII |
| `EX-SEC-001` | ✅ CORRIGIDO | DOC-FND-000 — Checklist de segurança por módulo |
| `EX-SEC-002` | ✅ CORRIGIDO | DOC-FND-000 — Validação de integridade de emissores |
| `EX-THREAT-001` | ✅ CORRIGIDO | DOC-FND-000 — Modelo de ameaças reutilizável |
| `EX-TRACE-001` | ✅ CORRIGIDO | DOC-GNP-00 — Rastreabilidade com correlation_id |
| `EX-API-001` | ✅ CORRIGIDO | DOC-ARC-001 — Endpoint CRUD completo (padrão OpenAPI) |
| `EX-IDEMP-001` | ✅ CORRIGIDO | DOC-GNP-00 — Idempotência em operações de escrita |
| `EX-OBS-001` | ✅ CORRIGIDO | DOC-GNP-00 — Observabilidade e telemetria estruturada |
| `EX-ADR-001` | ✅ CORRIGIDO | DOC-DEV-001 — Template de ADR |
| `EX-RES-001` | ✅ CORRIGIDO | DOC-GNP-00 — Resiliência com retry e circuit breaker |
| `EX-DB-001` | ✅ CORRIGIDO | DOC-GNP-00 — Campos obrigatórios em tabelas |
| `EX-DATA-001` | ✅ CORRIGIDO | DOC-DEV-001 — Modelo de dados canônico |
| `EX-DATA-003` | ✅ CORRIGIDO | DOC-DEV-001 — Catálogo de domain events |
| `EX-ESC-001` | ✅ CORRIGIDO | DOC-ESC-001 — Rubrica de Score Nível 2 |
| `EX-UX-010` | ✅ CORRIGIDO | DOC-DEV-001 — Catálogo de ações UX |
| `EX-UX-001` | ✅ CORRIGIDO | DOC-DEV-001 — Padrão de Screen Manifest YAML |
| `EX-INT-001` | ✅ CORRIGIDO | DOC-DEV-001 — Contrato de integração |
| `EX-NFR-001` | ✅ CORRIGIDO | DOC-DEV-001 — Requisitos não funcionais |
| `EX-PAGE-001` | ✅ CORRIGIDO | DOC-ARC-001 — Paginação padronizada |
| `EX-NAME-001` | ✅ CORRIGIDO | DOC-GNP-00 — Naming convention |

### 1.3 Seções Normativas Ausentes — 🔘 NÃO APLICÁVEL (0 erros)

> Verificação original já confirmou falso positivo: referências apontam para DOC-FND-000 §3 e DOC-GNP-00 §3, não para DOC-DEV-001 §3.

### 1.4 Referências Normativas Faltantes — ✅ CORRIGIDO

> `US-MOD-003-F01.md` linha 14 já inclui `DOC-ARC-002` e `DOC-ARC-003` em `rastreia_para`.

### 1.5 Erros de Context Map — ✅ CORRIGIDO

> Campo `path` adicionado em `context-map.json` para PKG-DEV-001, apontando corretamente para `docs/02_pacotes_agentes/PKG-DEV-001_Pacote_Agentes_Enriquecimento.md`.

### 1.6 Erros Remanescentes no lint-errors.json — ✅ CORRIGIDO (4 → 0)

| Erro | Análise | Status |
|------|---------|--------|
| DOC-ARC-002 faltante em US-MOD-003-F01.md | **Falso positivo** — `rastreia_para` já continha a referência. lint-errors.json estava stale. | ✅ CORRIGIDO |
| DOC-ARC-003 faltante em US-MOD-003-F01.md | Idem acima | ✅ CORRIGIDO |
| §5 referenciada em DOC-GNP-00 (DOC-FND-000:328) | Referência corrigida em DOC-FND-000 — tabela de ameaças EX-THREAT-001 não contém mais `§5`. | ✅ CORRIGIDO |
| §3 referenciada em DOC-ARC-001 (DOC-FND-000:329) | Referência corrigida em DOC-FND-000 — tabela de ameaças não contém mais `§3`. | ✅ CORRIGIDO |

**Verificação:** `node .agents/scripts/lint-docs.js` executa com 0 erros (2026-03-20). `lint-errors.json` zerado.

---

## 2. Módulos — Status e Saúde

### 2.1 Visão Geral (Atualizada)

| Módulo | Nome | Status | Saúde Anterior | Saúde Atual | Δ |
|--------|------|--------|----------------|-------------|---|
| **MOD-000** | Foundation | DRAFT | Alta | Alta | = |
| **MOD-001** | Backoffice Admin | DRAFT | Alta | Alta | = |
| **MOD-002** | Gestão de Usuários | DRAFT | Média | Média | = |
| **MOD-003** | Estrutura Organizacional | DRAFT | Média | **Alta** | **↑** |
| **MOD-004** | Identidade Avançada | DRAFT | Média | Média | = |
| **MOD-005** | Modelagem de Processos | DRAFT | Média | Média | = |
| **MOD-006** | Execução de Casos | DRAFT | Baixa | Baixa | = |
| **MOD-007** | Parametrização Contextual | DRAFT | **Crítica** | **Média** | **↑↑** |
| **MOD-008** | Integração Protheus | DRAFT | **Crítica** | **Média** | **↑↑** |
| **MOD-009** | Movimentos e Aprovação | DRAFT | **Crítica** | **Média** | **↑↑** |
| **MOD-010** | MCP e Automação | DRAFT | **Crítica** | **Média** | **↑↑** |
| **MOD-011** | SmartGrid | DRAFT | **Crítica** | **Média** | **↑↑** |

### 2.2 Nível de Arquitetura — ✅ CORRIGIDO

| Módulo | Status |
|--------|--------|
| MOD-003 | ✅ CORRIGIDO — Promovido para Nível 2 (5/6) com tabela de evidências por gatilho no manifesto do módulo §3 |
| Demais (MOD-000 a 006) | 🔘 NÃO APLICÁVEL — Níveis corretos conforme DOC-ESC-001 |

### 2.3 Módulos MOD-007 a MOD-011 — ✅ CORRIGIDO

Todos os 5 módulos agora possuem estrutura completa de requirements:

| Tipo | MOD-007 | MOD-008 | MOD-009 | MOD-010 | MOD-011 |
|------|---------|---------|---------|---------|---------|
| BR-NNN.md | ✅ | ✅ | ✅ | ✅ | ✅ |
| FR-NNN.md | ✅ | ✅ | ✅ | ✅ | ✅ |
| DATA-NNN.md | ✅ | ✅ | ✅ | ✅ | ✅ |
| DATA-003.md | ✅ | ✅ | ✅ | ✅ | ✅ |
| INT-NNN.md | ✅ | ✅ | ✅ | ✅ | ✅ |
| SEC-NNN.md | ✅ | ✅ | ✅ | ✅ | ✅ |
| SEC-002.md | ✅ | ✅ | ✅ | ✅ | ✅ |
| UX-NNN.md | ✅ | ✅ | ✅ | ✅ | ✅ |
| NFR-NNN.md | ✅ | ✅ | ✅ | ✅ | ✅ |
| pen-NNN-pendente.md | ✅ | ✅ | ✅ | ✅ | ✅ |

### 2.4 Dependências Cross-Módulo — ✅ CORRIGIDO

Grafo de dependências centralizado em [`docs/04_modules/DEPENDENCY-GRAPH.md`](04_modules/DEPENDENCY-GRAPH.md) (DOC-DEP-001 v1.0.0):

- **Grafo de adjacência YAML** (12 módulos) com delimitadores `BEGIN/END:DEPENDENCY_GRAPH` para consumo pelo linter
- **Tipos de dependência** detalhados (consome, herda) com 30 arestas documentadas
- **Bloqueios conhecidos** (4 BLK-*) com status e razão
- **Diagrama Mermaid** para visualização
- **Ordem topológica** de implementação (7 camadas)
- **Linter Pass E** (`lint-docs.js`) detecta ciclos via DFS e valida consistência do manifesto do módulo §4 vs grafo central
- **Skills atualizadas** em `context-map.json`: `forge-module`, `enrich`, `promote-module`, `delete-module` consomem DOC-DEP-001

Bloqueios mapeados:

```
BLK-001: MOD-002 ←blocks← MOD-000 (amendment F05: users_invite_resend)
BLK-002: MOD-006 ←blocks← MOD-005 (blueprints + cycle_version_id freeze)
BLK-003: MOD-005 ←blocks← MOD-004 (org_scopes para filtering)
BLK-004: MOD-008 ←blocks← MOD-005 (processos para rotinas de integração)
```

---

## 3. Skills — Análise e Recomendações

### 3.1 Inventário — ✅ ATUALIZADO (24 skills)

| Categoria | Skills | Status |
|-----------|--------|--------|
| **Criação** | `forge-module`, `create-amendment`, `create-specification`, `create-oo-doc`, `skill-creator` | OK |
| **Enriquecimento** | `enrich`, `enrich-agent`, `enrich-all` | ✅ Decision tree documentado |
| **Validação** | `validate-all`, `validate-openapi`, `validate-manifest`, `validate-drizzle`, `validate-endpoint`, `qa` | ✅ Hierarquia documentada |
| **Lifecycle** | `promote-module`, `rollback-module`, `delete-module`, `merge-amendment` | ✅ dry-run + backup + merge |
| **Gestão** | `manage-pendentes`, `update-index`, `update-specification`, `git`, `readme-blueprint` | OK |
| **Referência** | `drizzle-ref` | OK |
| **Outro** | `ralph-wiggum:*` (loop, help, cancel) | Experimental |

### 3.2 Problemas — ✅ CORRIGIDO

#### Sobreposição de responsabilidade — ✅ RESOLVIDO

| Par | Status | Evidência |
|-----|--------|-----------|
| `enrich` vs `enrich-agent` vs `enrich-all` | ✅ CORRIGIDO | `enrich.md` linhas 7-15: decision tree explícito (1 agente → `/enrich-agent`, N agentes/1 módulo → `/enrich`, N módulos → `/enrich-all`) |
| `validate-all` vs `qa` | ✅ CORRIGIDO | `qa.md` linhas 4-10: tabela de cenários (qa=sintaxe/links, validate-all=orquestrador semântico que inclui qa) |
| `update-specification` vs `create-amendment` | ✅ CORRIGIDO | `update-specification.md` linhas 11-35: roteamento por `estado_item` (DRAFT=edição direta, READY=delega para create-amendment) |

#### Skills destrutivas — ✅ RESOLVIDO

| Skill | Status | Evidência |
|-------|--------|-----------|
| `rollback-module` | ✅ CORRIGIDO | `--dry-run` (linhas 14-16, 38), gates de segurança, backup via `git stash` |
| `delete-module` | ✅ CORRIGIDO | `--dry-run` (linhas 13-15, 62), gate de dependentes, backup via `git stash`, `--force` para override |

#### Skills faltantes sugeridas

| Skill | Status |
|-------|--------|
| `detect-cycles` | ✅ CORRIGIDO — implementado como linter Pass E (DFS cycle detection em `lint-docs.js`) |
| `merge-amendment` | ✅ CORRIGIDO — skill criada em `.claude/commands/merge-amendment.md`, wired em `context-map.json` |

### 3.3 Template de Skills — ✅ CORRIGIDO

Template padrão criado em `.agents/templates/skill-template.md` (2589 bytes) com seções: frontmatter, argumento, gates, workflow PASSO, error handling, notas.

---

## 4. Agentes de Enriquecimento

### 4.1 Registro — ✅ PARCIALMENTE CORRIGIDO

| Item | Status Anterior | Status Atual |
|------|-----------------|--------------|
| AGN-DEV-05 dependências | Faltava AGN-DEV-04 (DATA) | ✅ CORRIGIDO — agora depende de AGN-DEV-01 e AGN-DEV-04 |
| AGN-DEV-10 `skill_prompt` | Referenciava arquivo inexistente | ✅ CORRIGIDO — campo removido |
| AGN-DEV-10 `skill_command` | Violava separação de concerns | ✅ CORRIGIDO — campo removido |
| AGN-DEV-08 dependências | Poderia depender de INT e SEC | 🔘 NÃO APLICÁVEL — decisão de design, não erro |

### 4.2 Fases de Execução — 🔘 NÃO APLICÁVEL

Questionamento sobre INT + NFR juntos na fase 4 e ADR + PENDENTE na fase 7 são decisões de design, não erros. Com AGN-DEV-05 agora dependendo de AGN-DEV-04, a sequência está mais coerente.

---

## 5. Configuração e Infraestrutura

### 5.1 Context Map — ✅ CORRIGIDO

| Item | Status |
|------|--------|
| PKG-DEV-001 path incorreto | ✅ CORRIGIDO — path aponta para `docs/02_pacotes_agentes/` |
| Skills destrutivas sem docs | ✅ CORRIGIDO — `delete-module` wired com DOC-DEP-001 (verifica dependentes), `rollback-module` com DOC-DEV-001 |
| Formato misto de `sections` | 🔘 NÃO APLICÁVEL — flexibilidade intencional (`"*"`, arrays, labels) |

### 5.2 Paths.json — ✅ CORRIGIDO

| Item | Status |
|------|--------|
| Glob patterns não validados | 🔘 NÃO APLICÁVEL — paths futuros (`apps/api/src/modules/`) documentados como "future paths" |
| Paths faltantes | ✅ CORRIGIDO — `enrichment_registry`, `pkg_dev_001`, `skill_templates` adicionados |

### 5.3 Settings.local.json — ✅ CORRIGIDO

| Item | Status |
|------|--------|
| `Bash(pnpm run:*)` muito amplo | ✅ CORRIGIDO — agora granular: `pnpm run qa:*`, `pnpm run lint:*`, `pnpm run validate:*` |
| `ralph-wiggum:ralph-loop` | 🔘 NÃO APLICÁVEL — ferramenta experimental documentada |

### 5.4 Arquivos Orphan — ✅ CORRIGIDO

| Arquivo | Status |
|---------|--------|
| `_forge_mod007.mjs` | ✅ CORRIGIDO — deletado (git status mostra `D`) |
| `_forge_mod007.py` | ✅ CORRIGIDO — deletado (git status mostra `D`) |
| `@incorporar/` | ✅ CORRIGIDO — diretório removido |

---

## 6. Duplicação de Conteúdo

### 6.1 Templates DATA-003 e SEC-002 — ✅ CORRIGIDO

| Item | Status |
|------|--------|
| Template DATA-003 | ✅ CORRIGIDO — `docs/04_modules/_templates/DATA-003-template.md` criado |
| Template SEC-002 | ✅ CORRIGIDO — `docs/04_modules/_templates/SEC-002-template.md` criado |
| Regra DOC-DEV-001 §0.4 | ✅ CORRIGIDO — classificação cross-cutting vs. domínio documentada |
| `enrich-agent.md` AGN-DEV-04/06 | ✅ CORRIGIDO — MUST usar template base, boilerplate canônico imutável |

### 6.2 Nomenclatura PENDENTE — ✅ CORRIGIDO

Convenção formalizada em `manage-pendentes.md` e aplicada:

| Contexto | Convenção | Exemplo |
|----------|-----------|---------|
| Arquivo container | `PEN-{NNN}` / `pen-{NNN}-pendente.md` | `PEN-007` = `pen-007-pendente.md` |
| Item individual | `PENDENTE-{NNN}` | `## PENDENTE-001 — ...` dentro de `pen-007-pendente.md` |
| Variante module-scoped | `PEN-{MOD}-{NNN}` | `PEN-009-001` (pen-009, usado em MOD-009) |

12 arquivos existentes, todos seguindo `pen-NNN-pendente.md`. pen-007-pendente.md corrigido de `## PEN-00N` para `## PENDENTE-00N` (13 arquivos, 66 referências atualizadas).

---

## 7. Governança e Processos Ausentes — ✅ CORRIGIDO

### 7.1 Critérios DRAFT → READY — ✅ CORRIGIDO

Formalizados como **Gate 0 (Definition of Ready)** obrigatório em `promote-module.md`. A skill ABORTA se qualquer gate falhar:

- [x] **DoR-1:** Todos PENDENTEs resolvidos (status IMPLEMENTADA, CANCELADA ou DECIDIDA)
- [x] **DoR-2:** Todos arquivos de requisito existem (BR, FR, DATA, SEC, INT, UX, NFR)
- [x] **DoR-3:** Zero erros de lint no módulo (`node .agents/scripts/lint-docs.js`)
- [x] **DoR-4:** Screen manifests validados (se o módulo possui telas)
- [x] **DoR-5:** ADRs conforme nível de arquitetura (Nível 0-1: mínimo 1, Nível 2: mínimo 3)
- [x] **DoR-6:** CHANGELOG atualizado com versão de promoção
- [x] **DoR-7:** Bloqueios cross-módulo resolvidos (DEPENDENCY-GRAPH.md §3)

### 7.2 Workflow de Amendments — ✅ CORRIGIDO

Ciclo completo documentado em `create-amendment.md` + `merge-amendment.md`:

| Aspecto | Onde | Detalhe |
|---------|------|---------|
| Criação | `/create-amendment` | Cria amendment sem tocar o base (DRAFT) |
| Aprovação | Edição direta do `estado_item` | DRAFT → APPROVED pelo owner/revisor |
| Merge | `/merge-amendment` | Aplica no base, sela como MERGED |
| Stale detection | `merge-amendment` Gate 4 | Compara versão do base na criação vs atual, avisa se bumped |
| Conflitos | `merge-amendment` Gate 5 | Detecta amendments concorrentes para o mesmo base |
| Naming convention | `create-amendment` + `merge-amendment` | `{Pilar}-{ID}-{Natureza}{Sequencial}.md` |
| Reconciliação | Coberta por stale detection + conflitos | Gates 4-5 do merge-amendment |

### 7.3 Outros Processos — ✅ CORRIGIDO

| Processo | Status |
|----------|--------|
| Dashboard de dependências cross-módulo | ✅ CORRIGIDO — DOC-DEP-001 (DEPENDENCY-GRAPH.md) + linter Pass E |
| SLA de resolução de PENDENTEs | ✅ CORRIGIDO — Definido em `manage-pendentes.md`: BLOQUEANTE 7d, ALTA 14d, MÉDIA 30d, BAIXA 90d |
| Reconciliação de amendments | ✅ CORRIGIDO — Coberta por Gates 4-5 do `merge-amendment` (stale detection + conflitos) |
| Naming convention para amendments | ✅ CORRIGIDO — `{Pilar}-{ID}-{Natureza}{Seq}.md` documentado em `create-amendment` e `merge-amendment` |
| Gate CI (DOC-ARC-003B) | ✅ CORRIGIDO — Documento READY v1.0.0 com 9 Gates CI. Implementação CI é P3 (#15) |

---

## 8. Normativos — Gaps

### 8.1 Exemplos Canônicos (EX-*) — ✅ CORRIGIDO

- **Definidos:** 21 de 21 IDs (32 definições no total, distribuídas entre DOC-FND-000, DOC-GNP-00, DOC-DEV-001, DOC-ARC-001, DOC-ESC-001)
- **Referências pendentes:** 0 (linter valida 301 referências com sucesso)
- **Distribuição:** DOC-FND-000 (5), DOC-GNP-00 (6+4 OAS), DOC-DEV-001 (8), DOC-ARC-001 (2), DOC-ESC-001 (1)

### 8.2 Normativos Incompletos — ✅ CORRIGIDO

| Documento | Status Anterior | Status Atual |
|-----------|-----------------|--------------|
| DOC-DEV-001 §3 | Faltante | ✅ CORRIGIDO — §3 "Regras de Negócio (BR-xxx)" existe (linha 296) |
| DOC-ARC-003B | Gate CI não auditado | ✅ CORRIGIDO — Documento completo (status READY v1.0.0): 9 Gates CI documentados, manifestos declarativos com caso de referência |
| DOC-ESC-001 | Scoring matrix incompleto | 🔘 NÃO APLICÁVEL — matrix funcional, MOD-003 já validado com ela |
| DOC-PADRAO-003 | Sem propósito claro | ✅ CORRIGIDO — ID reservado (descontinuado). Arquivo `DOC-PADRAO-003__Reservado.md` criado para preservar sequência de IDs sem quebrar referências |
| DOC-GNP-00 §5 | Lint error referencia | ✅ CORRIGIDO — referência removida de DOC-FND-000, linter passa |
| DOC-ARC-001 §3 | Lint error referencia | ✅ CORRIGIDO — referência removida de DOC-FND-000, linter passa |

### 8.3 Scope Migration — 🔘 NÃO APLICÁVEL

Migração 2-seg → 3-seg (`dominio:entidade:acao`) documentada em DOC-FND-000 CHANGELOG v1.2.0. Catálogo migrado.

---

## 9. Screen Manifests e User Stories

### 9.1 Manifests — 🔘 SEM ALTERAÇÃO

25 manifests + 1 schema (`screen-manifest.schema.v1.yaml`). Cobertura completa por módulo.

### 9.2 User Stories — ✅ CORRIGIDO

| Item | Status |
|------|--------|
| `US-MOD-003-F01.md` rastreia_para | ✅ CORRIGIDO — DOC-ARC-002 e DOC-ARC-003 presentes |
| Validação automatizada de rastreia_para | ✅ CORRIGIDO — Implementada no linter Pass Original (linhas 71-137): extrai `rastreia_para` de cada US e valida presença de referências normativas |
| Gate 3 scope validation | ✅ CORRIGIDO — Regra documentada em DOC-ARC-003B (READY v1.0.0, Gate 3). Skill `validate-manifest` verifica permissions contra DOC-FND-000 §2. Automação CI é P3 (#16) |

---

## 10. Resumo Consolidado

### O que foi CORRIGIDO (36 itens)

| # | Item | Seção |
|---|------|-------|
| 1 | 8 arquivos faltantes MOD-007 criados | §1.1 |
| 2 | MOD-008 a MOD-011 enriquecidos (todos requirements existem) | §2.3 |
| 3 | 21 IDs EX-* definidos em normativos (DOC-FND-000, DOC-GNP-00, DOC-DEV-001, DOC-ARC-001, DOC-ESC-001) | §1.2 |
| 4 | PKG-DEV-001 path corrigido em context-map.json | §5.1 |
| 5 | US-MOD-003-F01.md rastreia_para completo | §1.4 |
| 6 | Arquivos orphan removidos (_forge_mod007.*) | §5.4 |
| 7 | Diretório @incorporar removido | §5.4 |
| 8 | MOD-003 nível de arquitetura: Nível 2 (5/6) | §2.2 |
| 9 | AGN-DEV-10 skill_prompt/skill_command removidos | §4.1 |
| 10 | AGN-DEV-05 dependência de AGN-DEV-04 adicionada | §4.1 |
| 11 | Templates DATA-003 e SEC-002 criados | §6.1 |
| 12 | DOC-DEV-001 §0.4 regra cross-cutting documentada | §6.1 |
| 13 | enrich-agent.md atualizado para usar templates | §6.1 |
| 14 | Paths.json: paths faltantes adicionados | §5.2 |
| 15 | Settings.local.json: permissões granulares | §5.3 |
| 16 | DOC-DEV-001 §3 confirmado existente | §8.2 |
| 17 | Erros de lint reduzidos de 89 para 0 | §1.6 |
| 18 | MOD-007 a 011 saúde: Crítica → Média | §2.1 |
| 19 | MOD-003 saúde: Média → Alta | §2.1 |
| 20 | 16 IDs EX-* restantes definidos em normativos (DOC-DEV-001, DOC-GNP-00, DOC-ARC-001, DOC-ESC-001) | §1.2 |
| 21 | lint-errors.json zerado (4 → 0) | §1.6 |
| 22 | DOC-GNP-00 §5 e DOC-ARC-001 §3 referências corrigidas | §8.2 |
| 23 | DEPENDENCY-GRAPH.md (DOC-DEP-001) criado com grafo, bloqueios, Mermaid, ordem topológica | §2.4 |
| 24 | Linter Pass E (cycle detection + consistência manifesto do módulo §4 vs grafo central) | §2.4 |
| 25 | Decision tree enrich/enrich-agent/enrich-all documentado | §3.2 |
| 26 | Distinção validate-all vs qa e update-specification vs create-amendment documentada | §3.2 |
| 27 | dry-run + gates + backup em rollback-module e delete-module | §3.2 |
| 28 | Template padrão de skill criado (.agents/templates/skill-template.md) | §3.3 |
| 29 | Skills destrutivas wired em context-map.json com DOC-DEP-001 | §3.2 |
| 30 | Nomenclatura PENDENTE unificada: pen-007 corrigido (PEN-00N → PENDENTE-00N, 66 refs em 13 arquivos) | §6.2 |
| 31 | Skill `merge-amendment` criada — fecha ciclo de amendments (create → merge) | §3.2 |
| 32 | Workflow de amendments documentado em create-amendment + merge-amendment | §7.2 |
| 33 | Definition of Ready (Gate 0, 7 critérios) formalizado em promote-module.md | §7.1 |
| 34 | Stale detection + conflitos de amendments (Gates 4-5 merge-amendment) | §7.2 |
| 35 | SLA de resolução de PENDENTEs definido em manage-pendentes.md (7d/14d/30d/90d) | §7.3 |
| 36 | Seção §7 inteira marcada como CORRIGIDO (governança e processos) | §7 |

### O que NÃO precisa de ajuste (9 itens)

| # | Item | Razão | Seção |
|---|------|-------|-------|
| 1 | UX-005.md paths relativos | Falso positivo — path `../../../../` resolve corretamente | §1.1 |
| 2 | Seções normativas DOC-DEV-001 §3 | Falso positivo — referências apontam para DOC-FND-000 | §1.3 |
| 3 | AGN-DEV-08 dependências | Decisão de design, não erro | §4.1 |
| 4 | Fases de execução AGN-DEV | Decisão de design | §4.2 |
| 5 | Formato misto de sections em context-map | Flexibilidade intencional | §5.1 |
| 6 | Glob patterns futuros em paths.json | Documentados como "future paths" | §5.2 |
| 7 | ralph-wiggum:ralph-loop | Experimental, documentado | §5.3 |
| 8 | DOC-ESC-001 scoring matrix | Funcional, MOD-003 validado | §8.2 |
| 9 | Scope migration 2→3 segmentos | Migração documentada e realizada | §8.3 |

### O que AINDA precisa de ajuste (2 itens)

#### P0 — ✅ CONCLUÍDO

| # | Ação | Status |
|---|------|--------|
| 1 | ~~Definir 16 IDs EX-\* restantes~~ | ✅ Todos os 21 IDs definidos em normativos (§1.2) |
| 2 | ~~Investigar 4 erros remanescentes no lint-errors.json~~ | ✅ Linter passa com 0 erros (§1.6) |
| 3 | ~~Verificar existência de DOC-GNP-00 §5 e DOC-ARC-001 §3~~ | ✅ Referências corrigidas (§8.2) |

#### P1 — Curto Prazo

| # | Ação | Impacto |
|---|------|---------|
| 4 | ~~Definir critérios formais DRAFT→READY~~ | ✅ Gate 0 (DoR) com 7 critérios obrigatórios em `promote-module.md` (§7.1) |
| 5 | ~~Documentar decision tree enrich vs enrich-agent vs enrich-all~~ | ✅ Documentado em `enrich.md` linhas 7-15 (§3.2) |
| 6 | ~~Adicionar dry-run a rollback-module/delete-module~~ | ✅ Ambos com `--dry-run`, gates, backup via `git stash` (§3.2) |
| 7 | ~~Criar template padrão de skill~~ | ✅ `.agents/templates/skill-template.md` criado (§3.3) |
| 8 | ~~Documentar distinção validate-all vs qa, update-specification vs create-amendment~~ | ✅ Hierarquia pai/filho e roteamento por estado documentados (§3.2) |
| 9 | ~~Adicionar docs a skills destrutivas em context-map.json~~ | ✅ `delete-module` com DOC-DEP-001 para verificar dependentes (§2.4) |

#### P2 — Médio Prazo

| # | Ação | Impacto |
|---|------|---------|
| 10 | **Promover MOD-000 para READY** | Marco de estabilidade |
| 11 | ~~Documentar workflow de amendments~~ | ✅ Ciclo completo: `/create-amendment` (cria) → `/merge-amendment` (aplica). Workflow documentado em ambas as skills |
| 12 | ~~Criar skill detect-cycles~~ | ✅ Implementado como linter Pass E (DFS cycle detection) |
| 13 | ~~Criar dashboard dependências cross-módulo~~ | ✅ DOC-DEP-001 (DEPENDENCY-GRAPH.md) + linter Pass E + context-map atualizado |
| 14 | ~~Unificar nomenclatura PENDENTE~~ | ✅ Convenção em manage-pendentes.md + pen-007 corrigido (§6.2) |

#### P3 — Longo Prazo

| # | Ação | Impacto |
|---|------|---------|
| 15 | **Automatizar lint via CI** | Prevenção de regressão |
| 16 | **Implementar Gate 3 automatizado** | Validação de scopes em manifests |

---

## Apêndice A — IDs de Exemplo — ✅ TODOS DEFINIDOS

Todos os 21 IDs EX-* estão definidos em normativos. Distribuição:

| Documento | IDs definidos |
|-----------|---------------|
| DOC-FND-000 | EX-AUTH-001, EX-PII-001, EX-SEC-001, EX-SEC-002, EX-THREAT-001 |
| DOC-GNP-00 | EX-OAS-001..004, EX-IDEMP-001, EX-RES-001, EX-OBS-001, EX-TRACE-001, EX-DB-001, EX-NAME-001, EX-DOC-004 |
| DOC-DEV-001 | EX-DEV-001, EX-ADR-001, EX-DATA-001, EX-DATA-003, EX-INT-001, EX-NFR-001, EX-UX-001, EX-UX-010 |
| DOC-ARC-001 | EX-API-001, EX-PAGE-001 |
| DOC-ESC-001 | EX-ESC-001 |

## Apêndice B — Comparativo de Erros de Lint

| Categoria | Antes | Depois | Redução |
|-----------|-------|--------|---------|
| Ref. arquivo quebradas | 10 | 0 | **100%** |
| IDs indefinidos (referências) | 64 | 0 | **100%** |
| Seções faltantes | 2 | 0 | **100%** |
| Ref. normativas faltantes | 2 | 0 | **100%** |
| Context map | 2 | 0 | **100%** |
| Outros (lint-errors.json) | 9 | 0 | **100%** |
| **Total** | **89** | **0** | **100%** |

> Linter executado em 2026-03-20: 32 definições EX-*, 301 referências validadas, 0 erros.
