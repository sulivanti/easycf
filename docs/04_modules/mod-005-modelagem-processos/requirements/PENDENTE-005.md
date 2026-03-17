> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-16 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-17 | AGN-DEV-10  | Enriquecimento PENDENTE (enrich-agent) |

# PENDENTE-005 — Questões Abertas da Modelagem de Processos

---

## Questões Resolvidas

### ~~Q1 — Biblioteca de canvas para editor visual (F03)~~

- **Pergunta original:** React Flow confirmado ou há alternativas em avaliação?
- **Resolução:** React Flow selecionado como biblioteca de canvas (US-MOD-005-F03 §6 DoR: "Biblioteca de canvas selecionada (React Flow ou similar)"). Estrutura de componentes detalhada em UX-005 §2.5 e mod.md (structure Web).
- **Resolvido em:** UX-005, mod.md §3 (estrutura)

### ~~Q2 — JSON rule engine para campo `condicao` em transições~~

- **Pergunta original:** Qual engine será adotada?
- **Resolução:** Marcado como "futura" no modelo de dados (DATA-005 §2.7: `condicao text nullable — Expressão de condição — futura JSON rule engine`). Campo existe na tabela mas engine não é necessária para o MVP. Decisão adiada para quando MOD-006 implementar avaliação de condições.
- **Resolvido em:** DATA-005 §2.7, US-MOD-005 §10

### ~~Q3 — Integração com MOD-006 para validação de deleção~~

- **Pergunta original:** API síncrona ou event-driven? Qual endpoint do MOD-006 será consultado?
- **Resolução:** API síncrona. Endpoint: `GET /internal/instances/count-active?stage_id={uuid}`. Timeout 3s, 1 retry. Fail-safe: bloquear deleção com 503 quando MOD-006 indisponível.
- **Resolvido em:** INT-005 §4.1, ADR-002, SEC-005 §10

---

## Questões Abertas Residuais

### ~~Q4 — Amendment MOD-000-F12 para registro de scopes~~

- **Pergunta original:** Os 4 scopes `process:cycle:read/write/publish/delete` devem ser registrados no catálogo canônico de permissões do Foundation (DOC-FND-000 §2).
- **Resolução:** Scopes adicionados diretamente ao DOC-FND-000 §2.2 (v1.0.0 → v1.1.0) com bump de versão e CHANGELOG. Gate CI (DOC-ARC-003B) agora reconhece os 4 scopes.
- **Resolvido em:** DOC-FND-000 v1.1.0 §2.2

### ~~Q5 — Estratégia de is_initial unique (ADR-001)~~

- **Pergunta original:** Trigger BEFORE INSERT/UPDATE vs. campo denormalizado `cycle_id` para garantir is_initial único por ciclo.
- **Resolução:** **Opção B aceita** — campo denormalizado `cycle_id` em `process_stages` com partial unique index nativo `UNIQUE(cycle_id) WHERE is_initial=true AND deleted_at IS NULL`. Trigger mínimo apenas para popular `cycle_id` a partir de `macro_stage_id`. Benefício colateral: simplifica BR-008 (cross-ciclo) e query /flow.
- **Resolvido em:** ADR-001 (status: accepted), DATA-005 §2.3

### ~~Q6 — Contagem de endpoints: 23 vs 25~~

- **Pergunta original:** O épico diz "23 endpoints" mas INT-005 documenta 25.
- **Resolução:** Contagem correta é **25**. Corrigido em: mod.md, INT-005, CHANGELOG. O catálogo de papéis tem 3 endpoints (list/create/update), não 1.
- **Resolvido em:** INT-005 §1, mod.md §3, CHANGELOG v0.1.0

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-005, INT-005, ADR-001, ADR-002, SEC-005, DATA-005, DOC-FND-000
- **referencias_exemplos:** N/A
- **evidencias:** N/A
