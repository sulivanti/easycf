# Auditoria Completa — EasyCodeFramework

> **Data:** 2026-03-20
> **Versão do projeto:** 0.0.17
> **Escopo:** Documentação, Skills, Agentes, Normativos, Infraestrutura

---

## Sumário Executivo

| Métrica | Valor |
|---------|-------|
| Módulos | 12 (MOD-000 a MOD-011) |
| Status geral | **Todos DRAFT** — nenhum READY |
| Skills/Commands | 23 |
| Agentes de enriquecimento | 11 (AGN-DEV-01 a AGN-DEV-11) |
| Documentos normativos | 18 (DOC-*) |
| User stories | 77 (11 epics + 66 features) |
| Screen manifests | 25 YAML |
| Erros de lint | **89** |
| IDs de exemplo indefinidos | **64** |

---

## 1. Erros de Lint e Validação

**Fonte:** `lint-errors.json` — 89 erros documentados.

### 1.1 Referências de Arquivo Quebradas (10 erros)

| Arquivo Origem | Referência Quebrada | Causa |
|---|---|---|
| `mod-005/.../UX-005.md:19` | `ux-proc-001.editor-visual.yaml` | Path relativo incorreto (`../../../05_manifests/`) |
| `mod-005/.../UX-005.md:20` | `ux-proc-002.config-estagio.yaml` | Idem |
| `mod-007/mod.md:301` | `requirements/data/DATA-007.md` | Arquivo **não existe** |
| `mod-007/mod.md:302` | `requirements/data/DATA-003.md` | Arquivo **não existe** |
| `mod-007/mod.md:303` | `requirements/int/INT-007.md` | Arquivo **não existe** |
| `mod-007/mod.md:304` | `requirements/sec/SEC-007.md` | Arquivo **não existe** |
| `mod-007/mod.md:305` | `requirements/sec/SEC-002.md` | Arquivo **não existe** |
| `mod-007/mod.md:306` | `requirements/ux/UX-007.md` | Arquivo **não existe** |
| `mod-007/mod.md:307` | `requirements/nfr/NFR-007.md` | Arquivo **não existe** |
| `mod-007/mod.md:308` | `requirements/pen-007-pendente.md` | Arquivo **não existe** |

**Ação:** Criar os 8 arquivos faltantes em MOD-007 via `/enrich` e corrigir paths relativos em UX-005.md.

### 1.2 IDs de Exemplo Indefinidos (64 erros)

IDs referenciados em requisitos e ADRs mas **nunca definidos** em nenhum documento normativo:

| ID | Ocorrências | Módulos Afetados |
|---|---|---|
| `EX-TRACE-001` | 7 | MOD-002, MOD-004, MOD-005 |
| `EX-API-001` | 6 | MOD-002, MOD-004, MOD-005 |
| `EX-IDEMP-001` | 6 | MOD-002, MOD-004 |
| `EX-AUTH-001` | 5 | MOD-002, MOD-004 |
| `EX-PII-001` | 5 | MOD-002, MOD-004 |
| `EX-OBS-001` | 5 | MOD-002, MOD-004 |
| `EX-ADR-001` | 5 | MOD-006 (todos ADRs) |
| `EX-SEC-002` | 3 | MOD-004, MOD-005, MOD-006 |
| `EX-RES-001` | 3 | MOD-002, MOD-004 |
| `EX-DB-001` | 2 | MOD-004 |
| `EX-DATA-001` | 2 | MOD-002, MOD-005, MOD-006 |
| `EX-DATA-003` | 2 | MOD-005, MOD-006 |
| `EX-ESC-001` | 2 | MOD-006 |
| `EX-UX-010` | 2 | MOD-002, MOD-004 |
| `EX-UX-001` | 2 | MOD-005, MOD-006 |
| `EX-INT-001` | 2 | MOD-005, MOD-006 |
| `EX-NFR-001` | 2 | MOD-005, MOD-006 |
| `EX-SEC-001` | 2 | MOD-005, MOD-006 |
| `EX-PAGE-001` | 1 | MOD-002 |
| `EX-THREAT-001` | 1 | MOD-002 |
| `EX-NAME-001` | 1 | MOD-004 |

**Ação:** Criar seção de exemplos canônicos em `DOC-FND-000` ou documento dedicado `DOC-EX-001` registrando cada EX-* com snippet de código referência.

### 1.3 Seções Normativas Ausentes (2 erros)

| Arquivo | Referência | Problema |
|---|---|---|
| `mod-004/.../NFR-001.md:30` | `DOC-DEV-001 §3` | Seção §3 **não existe** em DOC-DEV-001 |
| `mod-004/.../SEC-001.md:138` | `DOC-DEV-001 §3` | Idem |

**Ação:** Criar §3 em DOC-DEV-001 ou corrigir referências para seção correta.

### 1.4 Referências Normativas Faltantes (2 erros)

| Arquivo | Problema |
|---|---|
| `user-stories/features/US-MOD-003-F01.md` | `rastreia_para` não inclui `DOC-ARC-002` e `DOC-ARC-003` que são referenciados no corpo |

### 1.5 Erros de Context Map (2 erros)

| Skill | Doc Referenciado | Problema |
|---|---|---|
| `enrich` | `PKG-DEV-001` | Arquivo está em `docs/02_pacotes_agentes/`, não em `docs/01_normativos/` |
| `enrich-agent` | `PKG-DEV-001` | Idem |

**Ação:** Atualizar `context-map.json` com path correto ou mover PKG-DEV-001.

---

## 2. Módulos — Status e Saúde

### 2.1 Visão Geral

| Módulo | Nome | Versão | Status | PENDENTEs | Saúde |
|---|---|---|---|---|---|
| **MOD-000** | Foundation | 0.10.0 | DRAFT | 7/7 resolvidos | Alta |
| **MOD-001** | Backoffice Admin | 0.10.0 | DRAFT | 4/4 resolvidos | Alta |
| **MOD-002** | Gestão de Usuários | 0.3.0 | DRAFT | 3/3 resolvidos | Média |
| **MOD-003** | Estrutura Organizacional | 0.3.0 | DRAFT | 5/6 resolvidos | Média |
| **MOD-004** | Identidade Avançada | 0.3.0 | DRAFT | Em análise | Média |
| **MOD-005** | Modelagem de Processos | 0.17.0 | DRAFT | Em análise | Média |
| **MOD-006** | Execução de Casos | 0.2.0 | DRAFT | Parcial | Baixa |
| **MOD-007** | Parametrização Contextual | 0.1.0 | DRAFT | Incompleto | Crítica |
| **MOD-008** | Integração Protheus | 0.1.0 | DRAFT | Incompleto | Crítica |
| **MOD-009** | Movimentos e Aprovação | 0.1.0 | DRAFT | Incompleto | Crítica |
| **MOD-010** | MCP e Automação | 0.1.0 | DRAFT | Incompleto | Crítica |
| **MOD-011** | SmartGrid | 0.1.0 | DRAFT | Incompleto | Crítica |

### 2.2 Nível de Arquitetura — Inconsistências

| Módulo | Nível Declarado | Score Declarado | Avaliação Real |
|---|---|---|---|
| MOD-000 | Nível 2 | 6/6 | Correto |
| MOD-001 | Nível 1 | 1/6 | Correto (shell/admin simples) |
| MOD-002 | Nível 1 | 2/6 | Correto |
| **MOD-003** | **Nível 1** | **1/6** | **Subestimado** — cross-tenant + CTE queries + soft-delete tree sugere Nível 2 (score ~5/6) |
| MOD-004 | Nível 2 | 5/6 | Correto |
| MOD-005 | Nível 2 | 5/6 | Correto |
| MOD-006 | Nível 2 | 5/6 | Correto |

**Ação:** Reavaliar MOD-003 com scoring detalhado de DOC-ESC-001 §4.2.

### 2.3 Dependências Cross-Módulo Bloqueantes

```
MOD-002 ──blocks──> MOD-000 (amendment F05: users_invite_resend)
MOD-006 ──depends──> MOD-005 (blueprints + cycle_version_id freeze)
MOD-005 ──depends──> MOD-004 (org_scopes para filtering)
MOD-008 ──depends──> MOD-005 (processos para rotinas de integração)
```

**Risco:** Sem dashboard de dependências, bloqueios passam despercebidos.

### 2.4 Módulos Incompletos (MOD-007 a MOD-011)

Arquivos **faltantes** confirmados no MOD-007 e provável nos demais:

| Tipo | MOD-007 | MOD-008 | MOD-009 | MOD-010 | MOD-011 |
|---|---|---|---|---|---|
| DATA-NNN.md | Falta | Verificar | Verificar | Verificar | Verificar |
| INT-NNN.md | Falta | Verificar | Verificar | Verificar | Verificar |
| SEC-NNN.md | Falta | Verificar | Verificar | Verificar | Verificar |
| UX-NNN.md | Falta | Verificar | Verificar | Verificar | Verificar |
| NFR-NNN.md | Falta | Verificar | Verificar | Verificar | Verificar |
| pen-NNN.md | Falta | Verificar | Verificar | Verificar | Verificar |

**Ação:** Executar `/enrich` em cada módulo incompleto para gerar arquivos faltantes.

---

## 3. Skills — Análise e Recomendações

### 3.1 Inventário (23 skills)

| Categoria | Skills | Status |
|---|---|---|
| **Criação** | `forge-module`, `create-amendment`, `create-specification`, `create-oo-doc`, `skill-creator` | OK |
| **Enriquecimento** | `enrich`, `enrich-agent`, `enrich-all` | Problemas |
| **Validação** | `validate-all`, `validate-openapi`, `validate-manifest`, `validate-drizzle`, `validate-endpoint`, `qa` | OK |
| **Lifecycle** | `promote-module`, `rollback-module`, `delete-module` | Problemas |
| **Gestão** | `manage-pendentes`, `update-index`, `update-specification`, `git`, `readme-blueprint` | OK |
| **Referência** | `drizzle-ref` | OK |
| **Outro** | `ralph-wiggum:*` (loop, help, cancel) | Experimental |

### 3.2 Problemas Identificados

#### Sobreposição de responsabilidade

| Par | Confusão | Resolução Sugerida |
|---|---|---|
| `enrich` vs `enrich-agent` vs `enrich-all` | Quando usar qual? | Documentar decision tree: 1 agente → `enrich-agent`, 1 módulo → `enrich`, todos → `enrich-all` |
| `validate-all` vs `qa` | qa é pai de validate-all ou vice-versa? | Definir: `qa` = npm scripts (lint, markdown), `validate-all` = validações semânticas (manifests, endpoints, drizzle) |
| `update-specification` vs `create-amendment` | Ambos editam docs | Definir: `update-specification` = docs DRAFT, `create-amendment` = docs READY |

#### Skills problemáticas

| Skill | Problema | Severidade |
|---|---|---|
| **`enrich-all`** | Estratégia 4-batch com spawn de subagents é complexa demais; sem error recovery; sem resume de batch interrompido | Alta |
| **`rollback-module`** | Destrutivo sem dry-run, sem backup, sem confirmação de "nenhum código gerado" | Alta |
| **`delete-module`** | Mesmos problemas do rollback-module | Alta |
| **`enrich-agent`** | §5 diz "produzir mentalmente" — vago; deveria ter JSON template explícito | Média |
| **`drizzle-ref`** | Regra #5 (Domain Events) complexa; sem exemplo de schema compliant | Média |

#### Skills faltantes

| Skill Proposta | Finalidade | Prioridade |
|---|---|---|
| `detect-cycles` | Detectar referências circulares em `rastreia_para` | Alta |
| `merge-amendment` | Merge de amendment aprovado de volta ao documento base | Alta |
| `bulk-update` | Atualizar múltiplas specs de uma vez | Média |
| `list-stale-amendments` | Reportar amendments contra docs READY desatualizados | Média |
| `generate-api-client` | Gerar SDK client a partir de OpenAPI spec | Baixa |
| `test-blueprint` | Scaffoldar test suites a partir de requisitos | Baixa |

### 3.3 Template Inconsistente

| Skill | Tamanho | Profundidade de Headings | Padrão PASSO |
|---|---|---|---|
| `promote-module` | ~6 seções | ## e ### | PASSO 1-6 |
| `manage-pendentes` | ~23 seções | ## ### #### | PASSO 1-5 (com 3.1-3.8) |
| `create-amendment` | ~8 seções | ## e ### | Gate 1, Gate 2 |
| `enrich-all` | ~12 seções | ## ### #### | Misto com code blocks |

**Ação:** Criar template padrão de skill com seções fixas: Argumento, Gates, Passos, Error Handling, Exemplos.

---

## 4. Agentes de Enriquecimento

### 4.1 Registro (`enrichment-registry.json`)

| Agente | Pilar | Dependências | Problemas |
|---|---|---|---|
| AGN-DEV-01 | MOD | Nenhuma | OK |
| AGN-DEV-02 | BR | AGN-DEV-01 | OK |
| AGN-DEV-03 | FR | AGN-DEV-01 | OK |
| AGN-DEV-04 | DATA | AGN-DEV-02, 03 | OK |
| **AGN-DEV-05** | **INT** | AGN-DEV-01 | **Deveria depender de AGN-DEV-04 (DATA)** — integrações usam modelo de dados |
| AGN-DEV-06 | SEC | AGN-DEV-04 | OK |
| AGN-DEV-07 | UX | AGN-DEV-03 | OK |
| **AGN-DEV-08** | **NFR** | AGN-DEV-01 | **Poderia depender de AGN-DEV-05 (INT) e 06 (SEC)** — NFR informado por integrações e segurança |
| AGN-DEV-09 | ADR | AGN-DEV-04, 06 | OK |
| **AGN-DEV-10** | **PENDENTE** | Nenhuma | **Referencia arquivos inexistentes** (ver abaixo) |
| AGN-DEV-11 | VAL | Todos | OK (read-only) |

### 4.2 Problemas Críticos do AGN-DEV-10

```json
"skill_prompt": "docs/04_modules/@incorporar/SKILL-PROMPT-PENDENTE.md"  // NÃO EXISTE
"skill_command": ".claude/commands/manage-pendentes.md"                  // Agente não deveria invocar skill
```

- O diretório `@incorporar/` está **vazio**
- Campo `skill_command` viola separação de concerns (agente ≠ skill)
- `target_file: "pen-{NNN}-pendente.md"` é o único agente com `target_file` explícito — inconsistência

**Ação:** Remover `skill_prompt` e `skill_command` do AGN-DEV-10; alinhar com padrão dos outros agentes.

### 4.3 Fases de Execução — Questionamentos

| Fase | Agentes | Observação |
|---|---|---|
| 4 | INT + NFR juntos | INT sem dependência de DATA é questionável |
| 7 | ADR + PENDENTE juntos | PENDENTE deveria rodar antes (informa decisões) ou depois (coleta gaps)? |

---

## 5. Configuração e Infraestrutura

### 5.1 Context Map (`context-map.json`)

**Cobertura:** 18 skills mapeadas, sendo:
- 13 com docs definidos
- 5 com docs vazios (`qa`, `delete-module`, `rollback-module`, `update-index`, `git`)

**Problemas:**
- PKG-DEV-001 referenciado por `enrich` e `enrich-agent` mas path aponta para `docs/01_normativos/` quando o arquivo está em `docs/02_pacotes_agentes/`
- Campo `sections` usa formatos mistos: `"*"`, arrays `["§2", "§3"]`, labels `["EX-OAS-001"]` — sem validação
- Skills destrutivas (`delete-module`, `rollback-module`) sem docs listados — deveriam referenciar DOC-DEV-001 §lifecycle

### 5.2 Paths.json

**Problemas:**
- Glob patterns (`src/modules/*/schema.ts`, `src/modules/*/routes/*.route.ts`) não validados contra codebase real
- Paths faltantes: `enrichment-registry.json`, `PKG-DEV-001`, templates de skill-creator

### 5.3 Settings.local.json

```json
{
  "permissions": {
    "allow": [
      "Skill(ralph-wiggum:ralph-loop)",
      "Bash(pnpm run:*)"
    ]
  }
}
```

**Problemas:**
- `Bash(pnpm run:*)` é permissão muito ampla — permite qualquer script npm
- Sem timeouts, sem rate limiting, sem logging
- `ralph-wiggum:ralph-loop` não documentado fora do contexto experimental

### 5.4 Arquivos Orphan

| Arquivo | Localização | Problema |
|---|---|---|
| `_forge_mod007.mjs` | Raiz | Temporário de geração, deve ser removido |
| `_forge_mod007.py` | Raiz | Idem |
| `@incorporar/` | `docs/04_modules/` | Diretório vazio, referenciado por AGN-DEV-10 |

---

## 6. Duplicação de Conteúdo

### 6.1 DATA-003.md — Catálogo de Domain Events

Presente em **12 módulos** com tamanhos de 5.6K a 15K. Cada módulo redefine conceitos similares (audit trails, data versioning, event catalog).

**Problema:** Sem herança ou template centralizado, cada enriquecimento produz conteúdo redundante com variações.

**Ação sugerida:** Criar template base em `docs/01_normativos/` ou em `docs/04_modules/_templates/DATA-003-template.md` que módulos herdem e estendam.

### 6.2 SEC-002.md — Matriz de Eventos de Segurança

Presente em **12 módulos** (5.4K–11K). Padrão idêntico copiado: event matrix, validation, compliance.

**Mesmo problema e mesma ação** do DATA-003.

### 6.3 Nomenclatura PENDENTE Inconsistente

| Contexto | Formato | Exemplo |
|---|---|---|
| ID do módulo | `PEN-XXX` | `PEN-000`, `PEN-003` |
| ID do item | `PENDENTE-XXX` | `PENDENTE-001`, `PENDENTE-006` |
| Nome do arquivo | `pen-NNN-pendente.md` | `pen-000-pendente.md` |

**Ação:** Unificar para um único formato (sugestão: `PEN-{mod}-{seq}` em tudo).

---

## 7. Governança e Processos Ausentes

### 7.1 Critérios DRAFT → READY

Nenhum documento define formalmente os critérios de promoção. Sugestão de Definition of Ready:

- [ ] Todos PENDENTEs resolvidos (status: RESOLVED ou CANCELLED)
- [ ] Todos arquivos de requisito existem (BR, FR, DATA, SEC, INT, UX, NFR)
- [ ] Zero erros de lint no módulo
- [ ] Screen manifests validados (Gate 3 — scope check)
- [ ] Pelo menos 1 ADR documentado (Nível 2: mínimo 3)
- [ ] CHANGELOG atualizado com versão de promoção
- [ ] Code review aprovado (para módulos com código)

### 7.2 Workflow de Amendments

**Existente:** `create-amendment` cria amendments em `/amendments/`.

**Faltante:**
- Quem aprova um amendment?
- Como fazer merge do amendment de volta ao doc base quando base volta a DRAFT?
- O que acontece com amendments conflitantes no mesmo doc?
- Como detectar amendments stale (base doc mudou desde criação)?

### 7.3 Outros Processos Ausentes

| Processo | Status | Impacto |
|---|---|---|
| Dashboard de dependências cross-módulo | Não existe | Bloqueios silenciosos |
| SLA de resolução de PENDENTEs | Não definido | Decisões podem estagnar |
| Reconciliação de amendments | Não documentado | Amendments podem ficar stale |
| Naming convention para amendments | Inconsistente | `DOC-*-M0*` vs `FR-*-C0*` vs `US-*-M0*` |
| Governance para gate CI (DOC-ARC-003B) | Referenciado mas não implementado | Gate 3 não funciona |

---

## 8. Normativos — Gaps

### 8.1 Exemplos Canônicos (EX-*)

**64 referências** a IDs `EX-*` que não existem em nenhum normativo. São 21 IDs únicos (ver seção 1.2).

**Impacto:** Gate EX-CI-007 (validação de exemplos) não pode funcionar. Skills de validação falham silenciosamente.

**Ação:** Criar `DOC-EX-001__Exemplos_Canonicos.md` com todos os 21 EX-* definidos com snippet de código.

### 8.2 Normativos Incompletos ou Questionáveis

| Documento | Problema |
|---|---|
| **DOC-ARC-003B** | Gate CI referenciado mas conteúdo não auditado — implementação desconhecida |
| **DOC-ESC-001** | Scoring matrix (Nível 0-2) mencionado mas detalhes incompletos |
| **DOC-PADRAO-003** | Filename sugere "Reservado" — sem propósito claro |
| **DOC-DEV-001** | Falta §3 (referenciada em 2 arquivos) |

### 8.3 Scope Migration

Migração de 2-segment para 3-segment (`dominio:entidade:acao`) foi decidida em PENDENTE-006 (MOD-000).

**Risco:** Módulos antigos (MOD-001, MOD-002) podem ainda ter referências no formato antigo. Validação de Gate 3 pode falhar se migration incompleta.

---

## 9. Screen Manifests e User Stories

### 9.1 Manifests — Cobertura

25 manifests criados, distribuídos:

| Módulo | Manifests | Observação |
|---|---|---|
| MOD-001 | 3 (auth, dash, shell) | OK |
| MOD-002 | 3 (users-list, user-form, user-invite) | OK (rename de ux-user→ux-usr feito) |
| MOD-003 | 2 (org-tree, org-form) | OK |
| MOD-004 | 2 (org-scope, shares-delegations) | OK |
| MOD-005 | 2 (editor-visual, config-estagio) | Path referência quebrada em UX-005.md |
| MOD-006 | 2 (painel-caso, listagem-casos) | OK |
| MOD-007 | 1 (config-enquadradores) | Mínimo |
| MOD-008 | 2 (editor-rotinas, monitor-integracoes) | OK |
| MOD-009 | 2 (inbox-aprovacoes, config-regras) | OK |
| MOD-010 | 2 (gestao-agentes, monitor-execucoes) | OK |
| MOD-011 | 3 (inclusao-massa, alteracao-registro, exclusao-massa) | OK |

### 9.2 Problemas

- **Gate 3 (scope validation):** Status desconhecido — não há evidência de que manifests foram validados contra catálogo de scopes em DOC-FND-000
- **Rename residual:** Arquivos antigos deletados (`ux-user-001`, `ux-user-002`) mas referências em docs de requisito podem persistir
- **Schema v1:** Todos usam schema v1, sem evidência de validação automatizada

### 9.3 User Stories — Rastreabilidade

- 77 arquivos (11 epics + 66 features)
- `rastreia_para` incompleto em pelo menos `US-MOD-003-F01.md` (falta DOC-ARC-002, DOC-ARC-003)
- Sem validação automatizada de que todas features refereciam normativos corretos

---

## 10. Recomendações Priorizadas

### P0 — Imediato (esta semana)

| # | Ação | Impacto |
|---|---|---|
| 1 | **Criar arquivos faltantes MOD-007** (8 arquivos: DATA-007, DATA-003, INT-007, SEC-007, SEC-002, UX-007, NFR-007, pen-007) | Elimina 8 erros de lint |
| 2 | **Corrigir path em UX-005.md** (MOD-005, linhas 19-20) | Elimina 2 erros de lint |
| 3 | **Definir 21 IDs EX-\*** em documento normativo dedicado | Elimina 64 erros de lint |
| 4 | **Corrigir referência PKG-DEV-001** em `context-map.json` | Elimina 2 erros de lint + corrige skills de enriquecimento |
| 5 | **Criar/corrigir §3 em DOC-DEV-001** ou atualizar referências em MOD-004 | Elimina 2 erros de lint |
| 6 | **Adicionar DOC-ARC-002/003 ao rastreia_para** de US-MOD-003-F01.md | Elimina 2 erros de lint |
| 7 | **Remover arquivos orphan** (`_forge_mod007.mjs`, `_forge_mod007.py`) | Limpeza |

### P1 — Curto Prazo (próximas 2 semanas)

| # | Ação | Impacto |
|---|---|---|
| 8 | **Definir critérios formais DRAFT→READY** (Definition of Ready) | Desbloqueia promoção de MOD-000 |
| 9 | **Simplificar `enrich-all`** — substituir 4-batch por single-pass com context reset | Reduz complexidade e custo de tokens |
| 10 | **Criar template padrão de skill** com seções fixas | Consistência entre 23 skills |
| 11 | **Documentar decision tree** para enrich vs enrich-agent vs enrich-all | Elimina confusão de uso |
| 12 | **Adicionar dry-run a `rollback-module`/`delete-module`** | Safety net para operações destrutivas |
| 13 | **Corrigir AGN-DEV-10** — remover `skill_prompt` e `skill_command` | Alinha com padrão dos outros agentes |
| 14 | **Reavaliar nível de arquitetura MOD-003** | Alinhamento com DOC-ESC-001 |

### P2 — Médio Prazo (próximo mês)

| # | Ação | Impacto |
|---|---|---|
| 15 | **Promover MOD-000 para READY** (primeiro módulo) | Marco de estabilidade |
| 16 | **Criar templates para DATA-003 e SEC-002** (herança vs duplicação) | Reduz 24 arquivos duplicados |
| 17 | **Documentar workflow de amendments** (aprovação, merge, stale detection) | Governança completa |
| 18 | **Criar skill `detect-cycles`** para rastreia_para | Previne referências circulares |
| 19 | **Criar skill `merge-amendment`** | Completa lifecycle de amendments |
| 20 | **Executar `/enrich` em MOD-008 a MOD-011** | Completa esqueletos |
| 21 | **Implementar Gate 3 automatizado** (scope validation contra DOC-FND-000) | CI/CD |
| 22 | **Criar dashboard de dependências cross-módulo** | Visibilidade de bloqueios |

### P3 — Longo Prazo (próximo trimestre)

| # | Ação | Impacto |
|---|---|---|
| 23 | **Automatizar lint-errors via CI** (fail on non-zero) | Prevenção de regressão |
| 24 | **Criar operations manual** (troubleshooting, recovery, performance) | Onboarding |
| 25 | **Adicionar métricas de skills** (uso, tempo, taxa de erro) | Melhoria contínua |
| 26 | **Criar skill `test-blueprint`** (scaffold tests from requirements) | Cobertura de testes |
| 27 | **Unificar nomenclatura PENDENTE** (PEN-{mod}-{seq} em tudo) | Consistência |
| 28 | **Promover MOD-001 para READY** | Segundo marco |

---

## Apêndice A — Distribuição de Erros por Módulo

| Módulo | Ref. Quebradas | IDs Indefinidos | Outros | Total |
|---|---|---|---|---|
| MOD-002 | 0 | 26 | 0 | **26** |
| MOD-004 | 0 | 18 | 2 | **20** |
| MOD-005 | 2 | 6 | 0 | **8** |
| MOD-006 | 0 | 12 | 0 | **12** |
| MOD-007 | 8 | 0 | 0 | **8** |
| US-MOD-003 | 0 | 0 | 2 | **2** |
| context-map | 0 | 0 | 2 | **2** |
| **Total** | **10** | **62** | **6** | **78+** |

> Nota: Contagem pode divergir ligeiramente do total de 89 por agrupamento de erros multi-linha.

## Apêndice B — IDs de Exemplo Necessários

Lista completa dos 21 EX-* IDs que precisam ser definidos:

```
EX-ADR-001    EX-API-001    EX-AUTH-001   EX-DATA-001   EX-DATA-003
EX-DB-001     EX-ESC-001    EX-IDEMP-001  EX-INT-001    EX-NAME-001
EX-NFR-001    EX-OBS-001    EX-PAGE-001   EX-PII-001    EX-RES-001
EX-SEC-001    EX-SEC-002    EX-THREAT-001 EX-TRACE-001  EX-UX-001
EX-UX-010
```

Cada ID deve conter: nome, descrição, snippet de código de referência, e doc normativo fonte.
