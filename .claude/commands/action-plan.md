# Skill: action-plan

Gera ou atualiza o Plano de Acao de um modulo, diagnosticando automaticamente o estado atual de cada fase do ciclo de vida (Pre-Modulo → Genese → Enriquecimento → Validacao → Promocao → Pos-READY).

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `action-plan`

> **Quando usar:** Quando quiser visualizar ou atualizar o roadmap de execucao de um modulo especifico — antes de iniciar trabalho, apos completar uma fase, ou para diagnosticar o estado atual.

## Argumento

$ARGUMENTS deve conter o caminho do modulo (ex: `docs/04_modules/mod-001-backoffice-admin/`).

Alternativamente aceita o ID do modulo (ex: `MOD-001` ou `mod-001`). Nesse caso, resolva o caminho via `docs/04_modules/mod-{NNN}-*/`.

Flags opcionais:
- `--update` — Atualiza plano existente sem recriar do zero (preserva CHANGELOG do documento)
- `--dry-run` — Apenas emite o diagnostico no chat sem gravar arquivo

Se nao fornecido, pergunte ao usuario.

---

## Gates

### Gate 1 — Modulo existe

```text
Caminho do modulo existe?
├── SIM → Prossiga
└── NAO → ABORTE: "Modulo nao encontrado em {caminho}. Verifique o path ou execute /forge-module primeiro."
```

### Gate 2 — Manifesto do módulo legível

```text
O manifesto do módulo (<dirname>.md) possui metadados basicos (id, version, estado_item)?
├── SIM → Prossiga
└── NAO → ABORTE: "Manifesto do módulo sem metadados validos. O scaffold pode estar incompleto."
```

---

## PASSO 1 — Coleta de Dados do Modulo

Leia os seguintes arquivos e extraia os metadados indicados. Registre internamente cada valor coletado — eles serao usados para preencher o template do plano.

### 1.1 — Manifesto do módulo (<dirname>.md)

| Campo | Extrair |
|-------|---------|
| `id` | MOD-NNN |
| `version` | Versao atual (ex: 0.10.0) |
| `estado_item` | DRAFT ou READY |
| `owner` | Owner do modulo |
| `data_ultima_revisao` | Data |
| `rastreia_para` | Lista de US, DOC, MOD referenciados |
| Nivel de Arquitetura | Nivel 0, 1 ou 2 (extrair do texto da secao §3) |
| Dependencias upstream | Lista de MOD-NNN dos quais depende (secao §4) |
| Dependentes downstream | Descricao textual de quem depende deste modulo |
| Features | Tabela de features com status (secao §5) |
| Itens Base | Lista de artefatos no indice (secao §6) |
| ADRs | Lista de ADRs no indice (secao §7) |
| module_paths | Caminhos declarados (secao §4) |

### 1.2 — Epico (US-MOD-NNN.md)

Localize em `docs/04_modules/user-stories/epics/US-MOD-{NNN}.md`.

| Campo | Extrair |
|-------|---------|
| `status_agil` | READY, DRAFT, TODO |
| `versao` | Versao do epico |
| Features vinculadas | Contagem e lista |
| Screen Manifests | Tabela de manifests com status |

### 1.3 — Features (US-MOD-NNN-FXX.md)

Localize em `docs/04_modules/user-stories/features/US-MOD-{NNN}-F*.md`.

Para **cada** feature, extraia:
- `status_agil` (READY, DRAFT, TODO)
- Contagem total e quantas estao READY

### 1.4 — Requirements (inventario de arquivos)

Conte arquivos existentes em cada subdiretorio de `requirements/`:

| Pilar | Path | Contagem |
|-------|------|----------|
| BR | `requirements/br/BR-*.md` | N |
| FR | `requirements/fr/FR-*.md` | N |
| DATA | `requirements/data/DATA-*.md` | N |
| INT | `requirements/int/INT-*.md` | N |
| SEC | `requirements/sec/SEC-*.md` | N |
| UX | `requirements/ux/UX-*.md` | N |
| NFR | `requirements/nfr/NFR-*.md` | N |
| PEN | `requirements/pen-*-pendente.md` | N |
| **Total** | | **Soma** |

### 1.5 — Pendentes (pen-NNN-pendente.md)

Leia o arquivo de pendentes e extraia:
- Contagem total de itens PENDENTE-NNN
- Contagem por status: ABERTA, EM_ANALISE, DECIDIDA, IMPLEMENTADA, CANCELADA
- Verificar se ha itens ABERTA ou EM_ANALISE (bloqueiam promocao)

### 1.6 — ADRs

Liste arquivos em `adr/ADR-*.md`:
- Contagem total
- Status de cada ADR (DRAFT, aceita, etc.)

### 1.7 — Amendments

Liste arquivos em `amendments/`:
- Contagem total
- Nomes dos amendments existentes (ex: DOC-FND-000-M01)

### 1.8 — CHANGELOG.md

Extraia:
- Versao mais recente
- Data da ultima entrada
- Etapa do pipeline Mermaid (1-6)

### 1.9 — Screen Manifests

Com base nos manifests referenciados no manifesto do módulo ou epico, verifique existencia em `docs/05_manifests/screens/`:
- Contagem de manifests existentes
- IDs (ex: UX-AUTH-001, UX-SHELL-001)

### 1.10 — DEPENDENCY-GRAPH.md

Leia `docs/04_modules/DEPENDENCY-GRAPH.md`:
- Dependencias upstream do modulo (secao §1)
- Bloqueios conhecidos que afetam este modulo (secao §3, filtrar BLK-* onde modulo_bloqueado = MOD-NNN)
- Camada topologica do modulo (secao §5)

---

## PASSO 2 — Diagnostico de Fases

Com base nos dados coletados, determine o estado de **cada fase** do ciclo de vida:

### Fase 0: Pre-Modulo

```text
Epico existe e status_agil = READY?
├── SIM → Fase 0: CONCLUIDA
└── NAO
    ├── Epico existe mas DRAFT/TODO → Fase 0: EM ANDAMENTO
    └── Epico nao existe → Fase 0: NAO INICIADA
```

Verificar tambem: todas as features estao READY?

### Fase 1: Genese (Scaffold)

```text
Pasta mod-NNN-*/ existe com mod-NNN-*.md + CHANGELOG.md + requirements/?
├── SIM → Fase 1: CONCLUIDA
└── NAO → Fase 1: NAO INICIADA (executar /forge-module)
```

### Fase 2: Enriquecimento

Determinar o estado do enriquecimento a partir de:

1. **CHANGELOG.md** — verificar se ha entradas de agentes AGN-DEV-*
2. **Arquivos de requisitos** — verificar se `owner` menciona AGN-DEV-* (indica agente executado)
3. **Versoes dos requisitos** — se > 0.1.0, provavelmente enriquecidos
4. **Pendentes** — se todos resolvidos (IMPLEMENTADA/CANCELADA/DECIDIDA), enriquecimento completo

```text
Agentes executaram sobre os requisitos?
├── Todos os 11 agentes rodaram (evidencia em CHANGELOG ou owners) + pendentes resolvidos
│   → Fase 2: CONCLUIDA
├── Alguns agentes rodaram mas nao todos
│   → Fase 2: EM ANDAMENTO (listar agentes pendentes)
└── Nenhuma evidencia de enriquecimento
    → Fase 2: NAO INICIADA (executar /enrich)
```

### Fase 3: Validacao

```text
Existe relatorio de /validate-all ou /qa verde no modulo?
├── SIM e sem erros → Fase 3: CONCLUIDA
├── SIM mas com erros → Fase 3: EM ANDAMENTO (correcoes pendentes)
└── NAO → Fase 3: PENDENTE
```

> Nota: Na pratica, Fase 3 raramente deixa evidencia em arquivo. Se Fases 0-2 estao completas e estado_item ainda e DRAFT, assuma Fase 3: PENDENTE.

### Fase 4: Promocao

```text
estado_item do manifesto do módulo?
├── READY → Fase 4: CONCLUIDA
└── DRAFT → Fase 4: PENDENTE (requer Fase 3 completa)
```

### Fase 5: Pos-READY

```text
Amendments existem?
├── SIM → Fase 5: EM USO (listar amendments)
└── NAO → Fase 5: SOB DEMANDA
```

---

## PASSO 3 — Determinacao de Validadores Aplicaveis

Com base no nivel de arquitetura e natureza do modulo, determine quais validadores sao aplicaveis:

### Regras de aplicabilidade

| Validador | Nivel 0 | Nivel 1 | Nivel 2 | Condicao adicional |
|-----------|---------|---------|---------|-------------------|
| `/qa` | SIM | SIM | SIM | Sempre aplicavel |
| `/validate-manifest` | SE houver manifests | SE houver manifests | SE houver manifests | Verificar existencia de `ux-*.yaml` |
| `/validate-openapi` | N/A | CONDICIONAL | SIM | Modulo possui endpoints proprios? |
| `/validate-drizzle` | N/A | CONDICIONAL | SIM | Modulo possui entidades de banco proprias? |
| `/validate-endpoint` | N/A | CONDICIONAL | SIM | Modulo possui handlers Fastify proprios? |

### Logica de deteccao

Para modulos UX-First (sem backend proprio):
- `/validate-openapi`, `/validate-drizzle`, `/validate-endpoint` → N/A

Para modulos com backend:
- Verificar existencia de: `apps/api/src/modules/{mod-name}/` (schema.ts, routes/)
- Se paths nao existem ainda → marcar como "FUTURO (pos-codigo)"

---

## PASSO 4 — Determinacao de ADRs Minimos

```text
Nivel de arquitetura?
├── Nivel 0 → Minimo 1 ADR
├── Nivel 1 → Minimo 1 ADR
└── Nivel 2 → Minimo 3 ADRs
```

Compare com a contagem real de ADRs e registre se o criterio e atendido.

---

## PASSO 5 — Composicao do Documento

Gere o arquivo `PLANO-ACAO-MOD-{NNN}.md` em `docs/04_modules/user-stories/plano/`.

O documento DEVE seguir a estrutura exata abaixo. Substitua as variaveis `{...}` pelos valores coletados.

### Estrutura do Documento

```markdown
# Procedimento — Plano de Acao {MOD_ID} {MOD_NAME}

> **Versao:** {PLAN_VERSION} | **Data:** {DATA_ATUAL} | **Owner:** {OWNER}
> **Estado atual do modulo:** {ESTADO_ITEM} ({MOD_VERSION}) | **Epico:** {EPIC_STATUS} ({EPIC_VERSION}) | **Features:** {FEATURES_READY_COUNT}/{FEATURES_TOTAL_COUNT} READY
>
> {RESUMO_FASE_ATUAL}. Proximo passo: {PROXIMO_PASSO}.

---

## Estado Atual — Resumo Diagnostico

{TABELA_DIAGNOSTICO}

---

## Procedimento por Fases

### Fase 0: Pre-Modulo — {STATUS_FASE_0}
### Fase 1: Genese do Modulo — {STATUS_FASE_1}
### Fase 2: Enriquecimento — {STATUS_FASE_2}
### Fase 3: Validacao — {STATUS_FASE_3}
### Fase 4: Promocao — {STATUS_FASE_4}
### Fase 5: Pos-READY — {STATUS_FASE_5}
### Gestao de Pendencias
### Utilitarios

---

## Resumo Visual do Fluxo {MOD_ID}
## Checklist Rapido — O que Falta para READY
## CHANGELOG deste Documento
```

### Regras de composicao

O plano deve ser um **documento hibrido**: estrutura rigorosa do template (PASSO numerados, decision trees, blocos de codigo) combinada com **riqueza explicativa** (narrativa contextual, tabelas de rastreio, bloqueadores explicitos, notas sobre decisoes).

**Principio:** Cada fase deve ser compreensivel por alguem que nao participou da conversa original. Incluir o "porque" alem do "o que".

1. **Tabela de Diagnostico** — Preencher com dados reais coletados no PASSO 1:

```markdown
| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-{NNN} | {EPIC_STATUS} ({EPIC_VERSION}) | DoR {completo/incompleto}, {N} features vinculadas |
| Features F01-F{NN} | {N}/{TOTAL} READY | {descricao detalhada — listar features nao-READY} |
| Scaffold (forge-module) | {CONCLUIDO/PENDENTE} | {pasta}/ com estrutura completa |
| Enriquecimento (11 agentes) | {CONCLUIDO/EM ANDAMENTO/PENDENTE} | {descricao — quantos agentes, o que falta} |
| PENDENTEs | {N_ABERTAS} abertas | {TOTAL}/{TOTAL} {status_summary} |
| ADRs | {N} criadas ({status}) | Nivel {L} requer minimo {M} — {atendido/nao atendido} |
| Amendments | {N} criados | {nomes dos amendments e contexto} |
| Requirements | {N}/{N} existem | {lista de pilares com contagem: BR(N), FR(N), ...} |
| CHANGELOG | v{VERSION} | Ultima entrada {DATA} |
| Screen Manifests | {N}/{N} existem | {lista de IDs} |
| Dependencias | {N} upstream ({lista}) | {descricao do que consome} |
| Bloqueios | {N} | {descricao detalhada ou "Nenhum BLK-* afeta MOD-NNN"} |
```

2. **Narrativa contextual por fase** — Antes de cada bloco de codigo, incluir 1-2 frases explicando o contexto e significado da fase para este modulo especifico. Exemplos:
   - Fase 0: "Epico define hierarquia organizacional de 5 niveis..."
   - Fase 1: "Primeiro modulo full-stack pos-Foundation..."
   - Fase 2: "F04 adicionada pos-scaffold via amendment, impactando enriquecimento..."

3. **Fases completas** — Para cada fase CONCLUIDA, usar o formato `### Fase N: Nome — CONCLUIDA` com blocos ```` ```  ```` mostrando comandos executados e resultado. Usar tempo passado.

4. **Fases pendentes** — Para cada fase PENDENTE ou NAO INICIADA, usar o formato com blocos de comando mostrando o que executar e status `A EXECUTAR`.

5. **Fase 2 — Rastreio de agentes** — Quando o enriquecimento estiver EM ANDAMENTO ou CONCLUIDO, incluir **tabela de rastreio de agentes** (fora do bloco de codigo) com colunas: #, Agente, Pilar, Artefato, Status, Evidencia. Isso permite auditoria de quais agentes rodaram e quais faltam.

6. **Fase 2 — Pendentes resolvidas** — Se houver pendentes resolvidas durante o enriquecimento, incluir apenas **tabela-resumo compacta** (fora do bloco de codigo) com colunas: #, ID, Severidade, Decisao (1 linha), Artefato. **NAO** duplicar questoes, opcoes ou resolucoes — referenciar `pen-NNN-pendente.md` para detalhes completos.

7. **Fase 2 — O que falta** — Se o enriquecimento estiver EM ANDAMENTO, incluir secao explicativa "O que falta para completar o enriquecimento" com itens numerados e comandos sugeridos.

8. **Fase 3 — Mapa de cobertura** — Incluir tabela "Validadores Aplicaveis — Mapa de Cobertura" com colunas: #, Validador, Aplicavel (nivel), Executavel agora, Artefatos. Isso e mais informativo do que apenas marcar A EXECUTAR/N/A.

9. **Fase 4 — Bloqueadores explicitos** — Se houver bloqueadores alem do DoR padrao (features TODO, agentes faltando, dependencia upstream nao-READY), listar em secao "Bloqueadores para Promocao" com itens numerados e explicacao do que fazer.

10. **Fase 5 — Contexto dos amendments** — Se houver amendments, incluir descricao de cada um com 1 linha de contexto explicando o que resolve e quando foi criado (pre-READY vs pos-READY).

11. **Decision trees** — Incluir os 3 decision trees padrao (enriquecimento, validacao, pendencias) nos locais corretos — copiar ipsis literis do template abaixo.

12. **Validadores** — Na Fase 3, listar TODOS os 5 validadores nos blocos 5a-5e. Marcar como:
    - `A EXECUTAR` — aplicavel e pendente
    - `N/A` — nao aplicavel (com justificativa baseada no nivel/natureza do modulo)
    - `INDIVIDUAL` — para os passos 5a-5e alternativos
    - `FUTURO (pos-codigo)` — aplicavel mas artefato de codigo nao existe ainda

13. **Gate 0 (DoR)** — Na Fase 4, preencher cada criterio DoR-1 a DoR-7 com `SIM`, `NAO` ou `A VERIFICAR` baseado nos dados reais.

14. **Gestao de Pendencias — Referencia** — Apos o bloco padrao de SLA/ciclo de vida, incluir apenas uma tabela-resumo compacta (1 linha por pendencia) com colunas: #, ID, Status, Severidade, Decisao (1 linha). **NAO** duplicar blocos detalhados de pendencias (questao, opcoes, resolucao) — esses dados vivem exclusivamente em `pen-NNN-pendente.md`. Adicionar link: `> Detalhes completos: requirements/pen-NNN-pendente.md`.

15. **Resumo Visual** — Adaptar o diagrama ASCII mostrando o fluxo com marcacao de estado atual e proximo passo. Incluir nota sobre dependencias upstream e posicao na cadeia topologica.

16. **Particularidades** — Incluir descricoes detalhadas (nao apenas factuais). Explicar o impacto de cada particularidade e por que importa.

17. **Checklist Rapido** — Listar apenas os itens que faltam para READY. Se o modulo ja e READY, mostrar checklist vazio com nota "Modulo ja esta READY." Incluir nota final sobre dependencias e impacto downstream.

18. **CHANGELOG do Documento** — Se `--update`, adicionar nova entrada preservando historico. Se criacao, iniciar com v1.0.0.

### Decision Trees Padrao

Incluir estes blocos nos locais indicados (Fase 2, Fase 3, Gestao de Pendencias):

**Decision tree de enriquecimento (antes da Fase 2):**
```
> **Decision tree de enriquecimento:**
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-NNN
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-NNN
```

**Decision tree de validacao (antes da Fase 3):**
```
> **Decision tree de validacao:**
> Quero validar tudo de uma vez?
> ├── SIM → /validate-all (orquestra todos, pula os que nao tem artefato)
> └── NAO → Qual pilar?
>     ├── Sintaxe/links/metadados → /qa
>     ├── Screen manifests       → /validate-manifest
>     ├── Contratos OpenAPI      → /validate-openapi
>     ├── Schemas Drizzle        → /validate-drizzle
>     └── Endpoints Fastify      → /validate-endpoint
```

**Decision tree de pendencias (secao Gestao de Pendencias):**
```
> **Decision tree de pendencias:**
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-NNN
> ├── Criar nova pendencia     → /manage-pendentes create PEN-NNN
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-NNN PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-NNN PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-NNN PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-NNN PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-NNN
```

---

## PASSO 6 — Modo Update (--update)

Se a flag `--update` foi passada e o arquivo `PLANO-ACAO-MOD-{NNN}.md` ja existe:

1. Leia o plano existente
2. Extraia o CHANGELOG do documento existente
3. Re-execute os PASSOs 1-5 com dados frescos
4. Preserve o historico do CHANGELOG e adicione nova entrada:

```markdown
| {NEXT_VERSION} | {DATA_ATUAL} | Atualizacao: {descricao_mudancas_detectadas} |
```

5. Calcule a versao: incremente minor se houve mudanca de fase, patch se apenas dados atualizados

Se a flag `--update` nao foi passada mas o arquivo ja existe, pergunte ao usuario:

```text
Plano de acao ja existe para MOD-{NNN} (v{VERSION}, {DATA}).
├── Atualizar (preserva historico) → prossiga com --update
├── Recriar do zero → prossiga sem --update
└── Cancelar
```

---

## PASSO 7 — Particularidades por Modulo (se aplicavel)

Se o modulo tem caracteristicas notaveis que diferem do padrao, adicione uma secao **apos** o Resumo Visual:

```markdown
## Particularidades do MOD-{NNN}

| Aspecto | Detalhe |
|---------|---------|
| {aspecto} | {detalhe} |
```

Exemplos de particularidades a documentar:
- Modulo UX-First sem backend proprio (validadores N/A)
- Modulo raiz (Foundation) sem dependencias upstream
- Modulo com bloqueios BLK-* pendentes
- Alto numero de amendments (modulo muito iterado)
- Dependencia de modulo que ainda nao esta READY

---

## PASSO 8 — Gravacao e Relatorio

### 8.1 — Gravar arquivo

Se `--dry-run` nao foi passado:

1. Grave o arquivo em `docs/04_modules/user-stories/plano/PLANO-ACAO-MOD-{NNN}.md`
2. Confirme gravacao ao usuario

### 8.2 — Relatorio no chat

Emita no chat:

```
## action-plan — Resultado

### Modulo: MOD-{NNN} ({MOD_NAME})

### Diagnostico de Fases

| Fase | Nome | Estado |
|------|------|--------|
| 0 | Pre-Modulo | {CONCLUIDA/EM ANDAMENTO/NAO INICIADA} |
| 1 | Genese (Scaffold) | {CONCLUIDA/NAO INICIADA} |
| 2 | Enriquecimento | {CONCLUIDA/EM ANDAMENTO/NAO INICIADA} |
| 3 | Validacao | {CONCLUIDA/EM ANDAMENTO/PENDENTE} |
| 4 | Promocao | {CONCLUIDA/PENDENTE} |
| 5 | Pos-READY | {EM USO/SOB DEMANDA} |

### Metricas
- Requirements: {N}/{N} existem
- PENDENTEs: {N} abertas / {TOTAL} total
- ADRs: {N} ({status}) — minimo {M} para Nivel {L}: {atendido/nao atendido}
- Screen Manifests: {N}/{N}
- Bloqueios: {N}

### Proximo Passo
{descricao do proximo passo recomendado com o comando a executar}

### Arquivo
{caminho do arquivo gravado ou "(--dry-run: nao gravado)"}
```

---

## Error Handling

| Erro | Causa | Acao |
|---|---|---|
| Manifesto do módulo nao encontrado | Scaffold nao executado | Informe: "Execute `/forge-module` primeiro" |
| Epico nao encontrado | User Story nao criada | Marque Fase 0 como NAO INICIADA, continue |
| DEPENDENCY-GRAPH.md nao encontrado | Grafo nao criado | Omita secoes de dependencia, avise o usuario |
| CHANGELOG.md sem pipeline Mermaid | Formato antigo | Infira etapa a partir dos dados coletados |
| Diretorio `plano/` nao existe | Primeira execucao | Crie o diretorio antes de gravar |

---

## Notas

- Esta skill e **read-heavy**: le muitos arquivos mas so grava 1 (o plano de acao). Nao modifica nenhum artefato do modulo.
- O plano e um **documento derivado** — pode ser recriado a qualquer momento a partir do estado real dos artefatos.
- Para modulos ainda nao scaffoldados (pre-Fase 1), a skill ainda pode gerar um plano minimo com Fases 0-1 detalhadas e demais como "NAO INICIADA".
- Os decision trees de enriquecimento, validacao e pendencias sao **identicos** para todos os modulos — sao blocos reutilizaveis do template.
- A secao "Particularidades" so deve ser incluida se o modulo tem diferencas significativas em relacao ao padrao (nivel, natureza, bloqueios).
