# Plano de Migracao — Execution State como Plano de Controle Ativo

> **Data:** 2026-03-23 | **Status:** PROPOSTA | **Escopo:** 29 skills, 12 modulos

## Contexto

Hoje o `.agents/execution-state/MOD-{NNN}.json` e um **log passivo**: 4 skills escrevem apos execucao (app-scaffold, codegen, codegen-agent, validate-all) e 1 skill le para relatorio (action-plan).

O objetivo desta migracao e transformar o JSON em um **plano de controle ativo** que todas as skills leem **antes** de executar para tomar decisoes inteligentes: skip trabalho ja feito, validar pre-condicoes, detectar dados stale, e resumir execucoes interrompidas.

---

## Arquitetura Alvo

```
                        .agents/execution-state/MOD-{NNN}.json
                        ┌─────────────────────────────────────┐
                        │ scaffold    → completed, timestamp   │
                        │ enrichment  → agents[11], status     │  ← NOVO
                        │ promotion   → completed, dor_check   │  ← NOVO
                        │ codegen     → agents[6], status      │
                        │ validations → 5 validators, verdict  │
                        │ tests       → pnpm_test, pnpm_lint   │
                        └───────────┬─────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │ LEITURA (pre-exec)      │ ESCRITA (pos-exec)      │
          │                         │                         │
          │ forge-module       ─────┤──── forge-module        │
          │ enrich / enrich-agent ──┤──── enrich-agent        │
          │ enrich-all         ─────┤──── (via enrich-agent)  │
          │ promote-module     ─────┤──── promote-module      │
          │ app-scaffold       ─────┤──── app-scaffold        │
          │ codegen            ─────┤──── codegen             │
          │ codegen-agent      ─────┤──── codegen-agent       │
          │ codegen-all        ─────┤──── (via codegen)       │
          │ validate-all       ─────┤──── validate-all        │
          │ manage-pendentes   ─────┤──── manage-pendentes    │
          │ action-plan        ─────┤                         │
          └─────────────────────────┴─────────────────────────┘
```

---

## Schema JSON Expandido

```json
{
  "$schema": "execution-state.v2",
  "module_id": "MOD-000",
  "module_path": "docs/04_modules/mod-000-foundation/",
  "last_updated": "2026-03-23T14:30:00Z",

  "forge": {
    "completed": true,
    "completed_at": "2026-03-15T10:00:00Z",
    "version": "0.1.0"
  },

  "enrichment": {
    "started_at": "2026-03-17T09:00:00Z",
    "completed_at": "2026-03-18T16:00:00Z",
    "agents": {
      "AGN-DEV-01": { "status": "done", "completed_at": "...", "items_generated": 14 },
      "AGN-DEV-02": { "status": "done", "completed_at": "...", "items_generated": 14 },
      "AGN-DEV-03": { "status": "done", "completed_at": "...", "items_generated": 19 },
      "AGN-DEV-04": { "status": "done", "completed_at": "...", "items_generated": 42 },
      "AGN-DEV-05": { "status": "done", "completed_at": "...", "items_generated": 6 },
      "AGN-DEV-06": { "status": "done", "completed_at": "...", "items_generated": 12 },
      "AGN-DEV-07": { "status": "done", "completed_at": "...", "items_generated": 8 },
      "AGN-DEV-08": { "status": "done", "completed_at": "...", "items_generated": 5 },
      "AGN-DEV-09": { "status": "done", "completed_at": "...", "items_generated": 4 },
      "AGN-DEV-10": { "status": "done", "completed_at": "...", "items_generated": 7 },
      "AGN-DEV-11": { "status": "done", "completed_at": "...", "items_generated": 0 }
    }
  },

  "promotion": {
    "completed": true,
    "completed_at": "2026-03-23T09:00:00Z",
    "from_version": "0.10.0",
    "to_version": "1.0.0",
    "dor_check": {
      "dor_1_pendentes": true,
      "dor_2_requisitos": true,
      "dor_3_lint": true,
      "dor_4_manifests": true,
      "dor_5_adrs": true,
      "dor_6_changelog": true,
      "dor_7_bloqueios": true
    }
  },

  "scaffold": {
    "completed": true,
    "completed_at": "2026-03-23T10:00:00Z",
    "apps_created": ["api", "web"],
    "pnpm_workspace_updated": true
  },

  "pnpm_install": {
    "completed": true,
    "completed_at": "2026-03-23T10:05:00Z"
  },

  "codegen": {
    "started_at": null,
    "completed_at": null,
    "agents": {
      "AGN-COD-DB":   { "status": "pending", "completed_at": null, "files_generated": 0, "files": [] },
      "AGN-COD-CORE": { "status": "pending", "completed_at": null, "files_generated": 0, "files": [] },
      "AGN-COD-APP":  { "status": "pending", "completed_at": null, "files_generated": 0, "files": [] },
      "AGN-COD-API":  { "status": "pending", "completed_at": null, "files_generated": 0, "files": [] },
      "AGN-COD-WEB":  { "status": "pending", "completed_at": null, "files_generated": 0, "files": [] },
      "AGN-COD-VAL":  { "status": "pending", "completed_at": null, "files_generated": 0, "files": [] }
    }
  },

  "validations": {
    "last_run": null,
    "qa":       { "status": null, "run_at": null },
    "manifest": { "status": null, "run_at": null, "total": 0, "passed": 0 },
    "openapi":  { "status": null, "run_at": null },
    "drizzle":  { "status": null, "run_at": null },
    "endpoint": { "status": null, "run_at": null },
    "verdict":  { "ready_for_promotion": null, "blockers": 0, "critical_violations": 0 }
  },

  "tests": {
    "pnpm_test": { "status": null, "run_at": null },
    "pnpm_lint": { "status": null, "run_at": null }
  },

  "pendentes": {
    "total": 12,
    "aberta": 0,
    "em_analise": 0,
    "decidida": 0,
    "implementada": 12,
    "cancelada": 0,
    "last_updated": "2026-03-22T15:00:00Z"
  }
}
```

### Diferencas v1 → v2

| Secao | v1 (atual) | v2 (proposta) | Motivo |
|-------|-----------|---------------|--------|
| `forge` | nao existe | **NOVO** | Saber se o scaffold do modulo existe, quando foi criado |
| `enrichment` | nao existe | **NOVO** | Resume de enriquecimento, skip agentes ja executados |
| `enrichment.agents[11]` | nao existe | **NOVO** | Status individual dos 11 agentes DEV |
| `promotion` | nao existe | **NOVO** | Saber se modulo foi promovido, resultado do DoR |
| `promotion.dor_check` | nao existe | **NOVO** | Resultado individual dos 7 criterios DoR |
| `pendentes` | nao existe | **NOVO** | Contagem rapida sem precisar parsear pen-NNN.md |
| `scaffold` | existe | mantido | Sem mudanca |
| `codegen` | existe | mantido | Sem mudanca |
| `validations` | existe | mantido | Sem mudanca |
| `tests` | existe | mantido | Sem mudanca |

---

## Migracao por Skill — Detalhamento

### Grupo 1: Skills que CRIAM o JSON (inicializam)

#### 1.1 — `forge-module` (Fase 1 — Genese)

**Hoje:** Cria estrutura do modulo, nao toca no execution-state.

**Proposta:** Apos criar a pasta `mod-{NNN}-{name}/`, inicializa o JSON com skeleton:

```
PASSO novo (apos PASSO 5 — Mermaid):
  Criar .agents/execution-state/MOD-{NNN}.json com:
  - forge.completed = true
  - forge.completed_at = now
  - forge.version = "0.1.0"
  - Demais secoes: null/vazio
```

**Beneficio:** Todos os demais skills podem assumir que o JSON existe se o modulo existe. Elimina a necessidade de "se existir, leia; senao, crie" em cada skill.

**Referencia no PLANO-ACAO-MOD-000 (linha 61):**
```
3    /forge-module MOD-000  Scaffold completo gerado:                        CONCLUIDO
                           mod.md, CHANGELOG.md, requirements/              v0.1.0 (2026-03-15)
```

---

#### 1.2 — `delete-module` / `rollback-module` (cleanup)

**Hoje:** Deletam pasta do modulo, nao tocam no execution-state.

**Proposta:** Deletar tambem `.agents/execution-state/MOD-{NNN}.json`.

```
PASSO novo (dentro da etapa de delecao):
  Deletar .agents/execution-state/MOD-{NNN}.json (se existir)
```

**Beneficio:** Evita JSONs orfaos de modulos que nao existem mais.

---

### Grupo 2: Skills de Enriquecimento (leitura + escrita)

#### 2.1 — `enrich-agent` (agente individual)

**Hoje:** Executa 1 agente de enriquecimento, sem rastrear no JSON.

**Proposta — LEITURA (pre-exec):**
```
PASSO 2 (Gate) — adicionar:
  Ler execution-state → enrichment.agents.{agent_id}.status
  Se status == "done":
    Avisar: "{agent_id} ja executou em {completed_at}. Deseja re-executar? (--force para pular)"
    Se nao --force → SKIP
```

**Proposta — ESCRITA (pos-exec):**
```
PASSO novo (apos PASSO 8 — Report):
  Atualizar execution-state → enrichment.agents.{agent_id}:
    status: "done" | "error"
    completed_at: now
    items_generated: N
  Se TODOS os 11 agentes estao done/skipped:
    enrichment.completed_at = now
```

**Beneficio:**
- Resume nativo: `/enrich mod-000` pula agentes ja executados
- Auditoria: saber exatamente quais agentes rodaram e quando
- Elimina necessidade de inferir do CHANGELOG

**Referencia no PLANO-ACAO-MOD-000 (linhas 96-109):**
```
Rastreio de Agentes — MOD-000
| 1 | AGN-DEV-01 | MOD/Escala | mod.md | CONCLUIDO | CHANGELOG v0.2.0 |
...
```
→ Esses dados hoje sao inferidos do CHANGELOG. Com o JSON, seriam lidos diretamente.

---

#### 2.2 — `enrich` (orquestrador de 1 modulo)

**Hoje:** Invoca `/enrich-agent` 11 vezes em sequencia.

**Proposta — LEITURA (pre-exec):**
```
PASSO 2 (Resolve Agents) — adicionar:
  Ler execution-state → enrichment.agents.*
  Filtrar agentes com status != "done" (exceto se --force)
  Informar: "3/11 agentes ja completaram. Executando os 8 restantes."
```

**Beneficio:** Se o enriquecimento foi interrompido no agente 7, o usuario roda `/enrich mod-000` e ele automaticamente continua do agente 8.

---

#### 2.3 — `enrich-all` (orquestrador cross-modulo)

**Hoje:** Usa `.agents/enrich-all-checkpoint.json` (temporario, deletado no sucesso).

**Proposta:** Eliminar o checkpoint temporario. Ler todos os `MOD-{NNN}.json` para determinar progresso:

```
PASSO 3 (Load Checkpoint) — substituir por:
  Para cada modulo elegivel (DRAFT):
    Ler .agents/execution-state/MOD-{NNN}.json
    Se enrichment.completed_at != null → SKIP (ja enriquecido)
    Se enrichment.agents tem parciais → RESUME (continuar do ponto)
    Se enrichment == null → EXECUTAR (do zero)

  Montar plano de execucao baseado nos JSONs
```

**Proposta — ESCRITA:** Nao escreve diretamente — delegado ao `enrich-agent`.

**Beneficio:**
- Elimina `.agents/enrich-all-checkpoint.json` (arquivo temporario)
- Resume permanente (nao perde progresso quando o checkpoint e deletado)
- Estado unificado em um unico lugar por modulo

---

### Grupo 3: Skills de Validacao e Promocao (leitura + escrita)

#### 3.1 — `validate-all` (ja implementado parcialmente)

**Hoje:** Ja escreve `validations.*` no JSON (implementado nesta sessao).

**Proposta — LEITURA adicional:**
```
PASSO 2 (Descoberta de Artefatos) — adicionar:
  Ler execution-state → codegen.agents.*

  Para cada validador pos-codigo:
    Se codegen.agents.AGN-COD-DB.status == "done" → validate-drizzle APLICAVEL
    Se codegen.agents.AGN-COD-API.status == "done" → validate-endpoint APLICAVEL
    Se codegen.agents.AGN-COD-API.status == "done" → validate-openapi APLICAVEL
    Se codegen.agents.AGN-COD-*.status == "pending" → "N/A — {agente} nao executou"
```

**Proposta — Freshness check:**
```
PASSO 2.5 (novo):
  Se validations.last_run != null:
    Comparar validations.last_run vs codegen.completed_at
    Se codegen mais recente que validacoes:
      Avisar: "⚠ Validacoes desatualizadas — codigo mudou desde ultima execucao"
    Se codegen nao mudou:
      Avisar: "Validacoes ainda vigentes ({data}). Re-executar? (s/n)"
```

**Referencia no PLANO-ACAO-MOD-000 (linhas 172-180):**
```
| 3 | /validate-openapi | SIM (Nivel 2) | NAO — FUTURO (pos-codigo) |
| 4 | /validate-drizzle | SIM (Nivel 2) | NAO — FUTURO (pos-codigo) |
```
→ Com o JSON, a mensagem seria: "NAO — AGN-COD-DB pendente" (mais preciso).

---

#### 3.2 — `promote-module` (Fase 4)

**Hoje:** Verifica DoR 1-7 lendo multiplos arquivos. Nao registra no JSON.

**Proposta — LEITURA (pre-exec):**
```
PASSO Gate 0 (DoR) — adicionar:
  Ler execution-state → enrichment.completed_at
  Se null → AVISAR: "Enriquecimento nao completou. {N} agentes pendentes."

  Ler execution-state → validations.verdict.ready_for_promotion
  Se false → AVISAR: "Validacao falhou. {N} violacoes criticas."
  Se null → AVISAR: "Validacao nao executada."
```

**Proposta — ESCRITA (pos-exec):**
```
PASSO novo (apos promocao):
  Atualizar execution-state → promotion:
    completed: true
    completed_at: now
    from_version: "0.10.0"
    to_version: "1.0.0"
    dor_check: { dor_1..dor_7: true/false }
```

**Beneficio:**
- Pre-flight mais rapido: em vez de ler pen-NNN.md + requirements/ + ADRs + CHANGELOG, le um unico JSON
- Historico de promocao preservado (quando, de qual versao)
- DoR check gravado para auditoria futura

**Referencia no PLANO-ACAO-MOD-000 (linhas 186-203):**
```
6    /promote-module     Gate 0 — Definition of Ready (DoR):
                          [DoR-1] PENDENTEs resolvidos? .............. SIM
                          [DoR-2] Arquivos de requisito existem? ..... SIM
```
→ Com o JSON, action-plan leria `promotion.dor_check` diretamente.

---

#### 3.3 — `manage-pendentes` (qualquer momento)

**Hoje:** Le/escreve `pen-{NNN}-pendente.md`. Nao toca no JSON.

**Proposta — ESCRITA (apos qualquer write intent):**
```
PASSO 5 (Report) — adicionar:
  Recontar pendentes por status
  Atualizar execution-state → pendentes:
    total: N
    aberta: N
    em_analise: N
    decidida: N
    implementada: N
    cancelada: N
    last_updated: now
```

**Beneficio:**
- `action-plan` e `promote-module` leem contagem de pendentes do JSON em vez de parsear o pen file inteiro
- Deteccao rapida de bloqueadores: `pendentes.aberta > 0` → promocao bloqueada

**Referencia no PLANO-ACAO-MOD-000 (linhas 336-340):**
```
Estado atual MOD-000:
  PEN-000: 12 itens total
    12 IMPLEMENTADA (001-012) ← DoR-1 atendido
    0 ABERTA
```
→ Com o JSON, esses dados seriam `pendentes.implementada: 12, pendentes.aberta: 0`.

---

### Grupo 4: Skills de Codegen (ja implementado parcialmente)

#### 4.1 — `codegen-agent` (ja escreve, adicionar leitura)

**Hoje:** Ja escreve `codegen.agents.{agent_id}` (implementado nesta sessao).

**Proposta — LEITURA adicional:**
```
PASSO 2 (Gate) — adicionar:
  Ler execution-state → codegen.agents.{agent_id}.status
  Se status == "done":
    Avisar: "{agent_id} ja executou em {completed_at} ({N} arquivos). Re-executar? (--force)"
    Se nao --force → SKIP

  Ler depends_on do registry
  Para cada dependencia:
    Ler execution-state → codegen.agents.{dep_id}.status
    Se != "done":
      ABORTAR: "{dep_id} nao completou. Execute primeiro ou use /codegen all."
```

**Beneficio:**
- Impede gerar codigo na camada APP referenciando tipos do CORE que nao existem
- Resume nativo sem re-executar agentes ja concluidos

**Referencia no PLANO-ACAO-MOD-000 (linhas 248-255):**
```
| 1 | AGN-COD-DB   | infrastructure | ... | A EXECUTAR | 0 |
| 2 | AGN-COD-CORE | domain         | ... | A EXECUTAR | 0 |
```
→ Com o JSON, os status seriam lidos de `codegen.agents.*.status`.

---

#### 4.2 — `codegen` (ja escreve, adicionar leitura)

**Hoje:** Ja escreve `codegen.*` consolidado (implementado nesta sessao).

**Proposta — LEITURA adicional:**
```
PASSO 5 (Execucao Sequencial) — modificar:
  Para cada agente na sequencia:
    Ler execution-state → codegen.agents.{agent_id}.status
    Se "done" → SKIP (ja executou)
    Se "error" → RE-EXECUTAR (retry)
    Se "skipped" → SKIP (nivel N/A)
    Se "pending" → EXECUTAR

  Informar ao usuario: "Resumindo execucao: {N} agentes done, {M} pendentes."
```

**Flag `--force`:** Ignora o estado e re-executa todos.

---

#### 4.3 — `codegen-all` (eliminar checkpoint)

**Hoje:** Usa `.agents/codegen-all-checkpoint.json` (temporario).

**Proposta — Substituir checkpoint:**
```
PASSO 3 (Load Checkpoint) — substituir por:
  Para cada modulo READY na ordem topologica:
    Ler .agents/execution-state/MOD-{NNN}.json
    Se codegen.completed_at != null → SKIP (ja gerado)
    Se codegen.agents tem parciais → RESUME (continuar)
    Se codegen == null ou todos pending → EXECUTAR

  Informar: "Topological scan: {N} done, {M} parciais, {K} pendentes."

PASSO 5.5 (novo — dependencia upstream):
  Antes de processar MOD-{NNN}:
    Para cada dependencia upstream (DEPENDENCY-GRAPH):
      Ler .agents/execution-state/MOD-{DEP}.json → codegen.completed_at
      Se null → AVISAR: "Upstream MOD-{DEP} nao tem codigo. Pular MOD-{NNN}? (s/n)"

PASSO 8 (Clean Checkpoint) — REMOVER:
  Nao ha mais checkpoint para limpar — estado vive nos JSONs individuais
```

**Beneficio:**
- Elimina `.agents/codegen-all-checkpoint.json`
- Progresso permanente (nao perde ao completar)
- Visibilidade cross-modulo natural

---

### Grupo 5: Skills de Suporte (leitura apenas)

#### 5.1 — `action-plan` (ja le, expandir)

**Hoje:** Le `scaffold.*`, `codegen.*`, `validations.*` (implementado nesta sessao).

**Proposta — Expandir leitura para novas secoes:**

```
PASSO 1.12 — expandir:
  Ler execution-state completo:

  forge.completed → Fase 1 diagnostico preciso
  enrichment.agents.* → Fase 2 com status individual (substitui inferencia CHANGELOG)
  enrichment.completed_at → Fase 2 CONCLUIDA (sem precisar contar arquivos)
  promotion.completed → Fase 4 confirmada com timestamp
  promotion.dor_check → DoR resultado individual
  pendentes.aberta → Bloqueador de promocao rapido
  validations.last_run vs codegen.completed_at → Freshness warning
```

**Impacto no Checklist (referencia linhas 422-432 do PLANO-ACAO-MOD-000):**

ANTES (inferencia):
```
- [x] Executar `/app-scaffold all` ✓ (2026-03-23)     ← inferido de package.json existir
- [ ] Executar `/codegen mod-000` — 6 agentes          ← generico
```

DEPOIS (dados reais do JSON):
```
- [x] Executar `/app-scaffold all` ✓ (2026-03-23T10:00:00Z)     ← scaffold.completed_at
- [ ] Executar `/codegen mod-000` — 0/6 agentes (DB pending, CORE pending, ...)  ← codegen.agents.*
```

---

#### 5.2 — `app-scaffold` (ja escreve, melhorar leitura)

**Hoje:** Verifica existencia de `apps/api/package.json` para skip.

**Proposta — LEITURA adicional:**
```
PASSO 1 (Gate) — enriquecer:
  Ler execution-state de QUALQUER modulo → scaffold.completed
  Se true → SKIP (com timestamp: "Scaffold criado em {data}")
```

---

### Grupo 6: Skills sem impacto (nao precisam de mudanca)

| Skill | Motivo |
|-------|--------|
| `create-amendment` | Opera sobre documentos individuais, nao tem estado cross-fase |
| `merge-amendment` | Idem |
| `create-specification` | Nao e vinculada a modulo especifico |
| `create-oo-doc` | Documenta componentes de codigo, nao lifecycle |
| `update-specification` | Delega para create-amendment se READY |
| `update-index` | Utilitario de indice, sem estado |
| `drizzle-ref` | Referencia apenas (informacional) |
| `readme-blueprint` | Gera README, sem estado de execucao |
| `skill-creator` | Meta-skill, sem estado |
| `git` | Assistente git, sem estado |
| `qa` | Executada via validate-all, sem estado proprio |
| `validate-manifest` | Executada via validate-all, sem estado proprio |
| `validate-openapi` | Executada via validate-all, sem estado proprio |
| `validate-drizzle` | Executada via validate-all, sem estado proprio |
| `validate-endpoint` | Executada via validate-all, sem estado proprio |

---

## Fases de Migracao

### Fase A — Fundacao (ja feita parcialmente nesta sessao)

| Item | Skill | Tipo | Status |
|------|-------|------|--------|
| A1 | Criar `.agents/execution-state/` | Diretorio + schema | FEITO |
| A2 | Registrar path em `paths.json` | Config | FEITO |
| A3 | `app-scaffold` → escrita `scaffold.*` | ESCRITA | FEITO |
| A4 | `codegen` → escrita `codegen.*` | ESCRITA | FEITO |
| A5 | `codegen-agent` → escrita `codegen.agents.{id}` | ESCRITA | FEITO |
| A6 | `validate-all` → escrita `validations.*` | ESCRITA | FEITO |
| A7 | `action-plan` → leitura 1.12 + regra 19 | LEITURA | FEITO |

### Fase B — Inicializacao e Cleanup

| Item | Skill | Tipo | Impacto |
|------|-------|------|---------|
| B1 | `forge-module` → criar JSON skeleton | ESCRITA | Garante que JSON existe desde a genese |
| B2 | `delete-module` → deletar JSON | CLEANUP | Evita orfaos |
| B3 | `rollback-module` → deletar JSON | CLEANUP | Evita orfaos |

### Fase C — Enriquecimento

| Item | Skill | Tipo | Impacto |
|------|-------|------|---------|
| C1 | `enrich-agent` → escrita `enrichment.agents.{id}` | ESCRITA | Rastrear cada agente DEV |
| C2 | `enrich-agent` → leitura (skip se done) | LEITURA | Resume nativo |
| C3 | `enrich` → leitura (filtrar agentes pendentes) | LEITURA | Resume no orquestrador |
| C4 | `enrich-all` → substituir checkpoint por JSONs | LEITURA | Elimina arquivo temporario |

### Fase D — Promocao e Pendentes

| Item | Skill | Tipo | Impacto |
|------|-------|------|---------|
| D1 | `promote-module` → escrita `promotion.*` | ESCRITA | Historico de promocao |
| D2 | `promote-module` → leitura pre-flight | LEITURA | Pre-flight mais rapido |
| D3 | `manage-pendentes` → escrita `pendentes.*` | ESCRITA | Contagem rapida |

### Fase E — Resume e Gates Inteligentes

| Item | Skill | Tipo | Impacto |
|------|-------|------|---------|
| E1 | `codegen-agent` → leitura (skip done + gate deps) | LEITURA | Resume + prevencao de erros |
| E2 | `codegen` → leitura (resume parcial) | LEITURA | Resume no orquestrador |
| E3 | `codegen-all` → substituir checkpoint por JSONs | LEITURA | Elimina arquivo temporario |
| E4 | `validate-all` → leitura freshness check | LEITURA | Detectar validacoes stale |
| E5 | `validate-all` → leitura codegen agents para dispatch | LEITURA | Dispatch mais preciso |

### Fase F — Expansao do action-plan

| Item | Skill | Tipo | Impacto |
|------|-------|------|---------|
| F1 | `action-plan` → ler `forge.*` | LEITURA | Fase 1 diagnostico |
| F2 | `action-plan` → ler `enrichment.*` | LEITURA | Fase 2 com status individual |
| F3 | `action-plan` → ler `promotion.*` + `dor_check` | LEITURA | Fase 4 com DoR detalhado |
| F4 | `action-plan` → ler `pendentes.*` | LEITURA | Contagem rapida |
| F5 | `action-plan` → freshness warning | LEITURA | Alerta de dados stale |

---

## Resumo de Impacto por Skill

| Skill | Fase | Leitura | Escrita | Checkpoint Eliminado | Beneficio Principal |
|-------|------|---------|---------|---------------------|-------------------|
| `forge-module` | B | — | `forge.*` | — | JSON existe desde a criacao |
| `delete-module` | B | — | DELETE | — | Sem orfaos |
| `rollback-module` | B | — | DELETE | — | Sem orfaos |
| `enrich-agent` | C | skip done | `enrichment.agents.*` | — | Resume nativo |
| `enrich` | C | filtrar pendentes | — | — | Resume no orquestrador |
| `enrich-all` | C | scan todos JSONs | — | `enrich-all-checkpoint.json` | Checkpoint permanente |
| `promote-module` | D | pre-flight | `promotion.*` | — | Pre-flight rapido + historico |
| `manage-pendentes` | D | — | `pendentes.*` | — | Contagem sem parsear pen file |
| `codegen-agent` | E | skip + gate deps | (ja feito) | — | Prevencao de erros |
| `codegen` | E | resume parcial | (ja feito) | — | Resume sem retrabalho |
| `codegen-all` | E | scan todos JSONs | — | `codegen-all-checkpoint.json` | Checkpoint permanente |
| `validate-all` | E | freshness + dispatch | (ja feito) | — | Validacoes inteligentes |
| `action-plan` | F | todas secoes | — | — | Checklist 100% data-driven |
| `app-scaffold` | A | (ja feito) | (ja feito) | — | — |

---

## Visualizacao: Fluxo MOD-000 com JSON Ativo

Usando o PLANO-ACAO-MOD-000.md como referencia, o fluxo ficaria:

```
/forge-module MOD-000
  → CRIA MOD-000.json { forge: { completed: true, version: "0.1.0" } }

/enrich mod-000 (11 agentes)
  → LE MOD-000.json → enrichment: null → executar todos
  → Cada agente ESCREVE: enrichment.agents.AGN-DEV-{NN}.status = "done"
  → Ao final: enrichment.completed_at = now

/enrich mod-000 (re-execucao apos interrupcao no agente 7)
  → LE MOD-000.json → enrichment.agents: 6 done, 5 pending
  → SKIP agentes 01-06, EXECUTA 07-11

/validate-all mod-000
  → LE MOD-000.json → codegen.agents: null → validadores pos-codigo marcados "N/A (codegen pendente)"
  → ESCREVE: validations.qa = PASS, validations.manifest = PASS

/promote-module mod-000
  → LE MOD-000.json → enrichment.completed_at ✓, validations.verdict: PASS ✓, pendentes.aberta: 0 ✓
  → Pre-flight passa sem ler 6+ arquivos separados
  → ESCREVE: promotion = { completed: true, dor_check: { ... } }

/app-scaffold all
  → LE QUALQUER MOD-{NNN}.json → scaffold.completed: null
  → Cria apps/api + apps/web
  → ESCREVE em TODOS os MOD-{NNN}.json: scaffold.completed = true

/codegen mod-000
  → LE MOD-000.json → codegen.agents: todos "pending"
  → Executa DB → CORE → APP → API → WEB → VAL
  → Cada agente ESCREVE status "done"

/codegen mod-000 (re-execucao apos erro no APP)
  → LE MOD-000.json → DB: done, CORE: done, APP: error, API/WEB/VAL: pending
  → SKIP DB e CORE, RE-EXECUTA APP, depois API → WEB → VAL

/validate-all mod-000 (pos-codegen)
  → LE MOD-000.json → codegen.agents.AGN-COD-DB: done → validate-drizzle APLICAVEL
  → LE MOD-000.json → validations.last_run: "2026-03-22" < codegen.completed_at: "2026-03-23"
  → AVISO: "Validacoes desatualizadas — re-executando"

/codegen-all
  → LE TODOS .agents/execution-state/MOD-*.json
  → MOD-000: codegen.completed_at ✓ → SKIP
  → MOD-001: codegen: null → EXECUTAR
  → MOD-002: codegen.agents parciais → RESUME
  → SEM checkpoint temporario

/action-plan mod-000 --update
  → LE MOD-000.json COMPLETO
  → Gera checklist 100% data-driven:
    [x] forge ✓ (2026-03-15)
    [x] enrich 11/11 ✓ (2026-03-18)
    [x] validate-all PASS ✓ (2026-03-22)
    [x] promote READY v1.0.0 ✓ (2026-03-23)
    [x] app-scaffold ✓ (2026-03-23)
    [ ] codegen 2/6 agentes (DB done, CORE done, APP error, ...)
    [ ] validate-all pos-codigo (STALE — codegen mais recente)
    [ ] pnpm test
```

---

## Riscos e Mitigacoes

| Risco | Mitigacao |
|-------|----------|
| JSON corrompido (escrita parcial) | Ler com try/catch, fallback para filesystem se parse falha |
| JSON orfao (modulo deletado) | delete-module e rollback-module limpam o JSON |
| Dados stale (JSON antigo) | `last_updated` em cada secao permite detectar staleness |
| Conflito de escrita concorrente | Skills sao executadas serialmente pelo usuario — baixo risco |
| JSON muito grande | Manter apenas dados de controle, nao conteudo de arquivos |
| Skill antiga nao escreve JSON | Fallback: ler filesystem se secao do JSON for null |

---

## Prioridade de Implementacao

**Alto impacto, baixo esforco:**
1. **E1/E2** — Resume no codegen (leitura) — evita retrabalho
2. **C1/C2** — Rastreio de enrichment agents — visibilidade
3. **B1** — forge-module inicializa JSON — fundacao

**Alto impacto, medio esforco:**
4. **C4/E3** — Eliminar checkpoints temporarios — simplificacao arquitetural
5. **D1/D2** — Promote-module read/write — pre-flight rapido
6. **E4/E5** — Validate-all freshness + smart dispatch

**Medio impacto, baixo esforco:**
7. **D3** — manage-pendentes contagem — conveniencia
8. **B2/B3** — Cleanup no delete/rollback — higiene
9. **F1-F5** — action-plan expansao — checklist completo
