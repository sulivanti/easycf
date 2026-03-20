> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-19 | AGN-DEV-10  | Enriquecimento PENDENTE — documenta PEND-SGR-01/02 como resolvidas, adiciona PEND-SGR-03/04/05 |
> | 0.3.0  | 2026-03-19 | arquitetura | Pipeline PEND-SGR-04 — DECIDIDA (Opção A: target_endpoints no context_framer) → IMPLEMENTADA (DATA-011 + INT-011 + backlog amendment MOD-007) |
> | 0.4.0  | 2026-03-19 | arquitetura | Pipeline PEND-SGR-03 (IMPLEMENTADA — Opção B: limite 200 linhas, NFR-011) e PEND-SGR-05 (IMPLEMENTADA — Opção C: env var SMARTGRID_CONCURRENCY default=10, NFR-011) |

# PEN-011 — Questões Abertas do SmartGrid

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-011, DOC-GPA-001, FR-011, NFR-011, INT-011, DATA-011
- **referencias_exemplos:** N/A
- **evidencias:** N/A

---

## Questões Resolvidas

### ~~PEND-SGR-01 — Contrato de mapeamento resultado do motor para estado visual da linha~~

- **Resolução:** Mapeamento definido: `blocking_validations.length > 0` resulta em status bloqueante (icone vermelho), `validations.length > 0` (sem blocking) resulta em alerta (icone amarelo), ambos vazios resulta em valido (icone verde). Sem avaliacao resulta em neutro (sem icone).
- **Resolvido em:** 2026-03-15
- **Documentado em:** INT-011 (INT-001.4), DATA-011 (secao 3.2), mod.md (secao "Mapeamento Response do Motor para Status Visual")

### ~~PEND-SGR-02 — Suporte a `current_record_state` no motor MOD-007-F03~~

- **Resolução:** Campo `current_record_state` nullable adicionado ao contrato do motor. Cache Redis bypass quando presente. Campos ausentes no `current_record_state` fazem a condicao ser avaliada como `false` (degradacao suave). Backward compatible: sem o campo, motor opera como v1.
- **Resolvido em:** 2026-03-15
- **Documentado em:** US-MOD-011-F01, FR-011 (FR-001), INT-011 (INT-001.2)

### ~~PEND-SGR-03 — Limite Padrao de Linhas na Grade (MI-001)~~

- **Resolução:** Opcao B — 200 linhas como padrao (MAX_GRID_ROWS=200). Viavel com virtualizacao (react-virtual/tanstack-virtual) e throttling ja especificados. "Validar Tudo" com concorrencia 10 levaria ~10s (p95). Export JSON < 1MB. Se testes de performance indicarem degradacao em hardware modesto, reduzir para 100. Configuravel por tenant como evolucao futura (Opcao C).
- **Decisao:** Opcao B (DECIDIDA em 2026-03-19)
- **Implementacao:** IMPLEMENTADA em 2026-03-19
- **Artefatos de saida:**
  - NFR-011 NFR-002 (limite padrao MAX_GRID_ROWS=200, virtualizacao obrigatoria via react-virtual/tanstack-virtual)
- **Referencia:** FR-005, NFR-001, NFR-002, NFR-004, NFR-005, BR-007

### ~~PEND-SGR-04 — Mecanismo de Resolucao do operationId Dinamico do Modulo Destino (MI-002)~~

- **Resolução:** Opcao A — Campo `target_endpoints` no `context_framer` tipo OPERACAO. O context_framer inclui objeto com endpoints do modulo destino (create, update, delete). SmartGrid le esses endpoints no mount da grade junto com a config da Operacao. Requer amendment menor no MOD-007 (schema do context_framer).
- **Decisao:** Opcao A (DECIDIDA em 2026-03-19)
- **Implementacao:** IMPLEMENTADA em 2026-03-19
- **Artefatos de saida:**
  - DATA-011 §6 (campo `target_endpoints` no schema do context_framer tipo OPERACAO)
  - INT-011 INT-003 (resolucao via `target_endpoints` nos 3 fluxos: create, update, delete)
  - Backlog: amendment MOD-007 para adicionar `target_endpoints` ao schema de `context_framer`
- **Documentado em:** DATA-011 (§6), INT-011 (INT-003), pen-011-pendente.md
- **Referencia:** FR-006, FR-007, FR-009, INT-011 (INT-003), DATA-011

### ~~PEND-SGR-05 — Estrategia de Concorrencia para "Validar Tudo" e "Salvar Lote"~~

- **Resolução:** Opcao C — Configuravel via environment variable SMARTGRID_CONCURRENCY com default=10. Permite tuning sem rebuild: dev=2, staging=5, prod=10. Para 200 linhas com latencia p95 de 500ms e concorrencia 10, "Validar Tudo" levaria ~10s.
- **Decisao:** Opcao C (DECIDIDA em 2026-03-19)
- **Implementacao:** IMPLEMENTADA em 2026-03-19
- **Artefatos de saida:**
  - NFR-011 NFR-004 (concorrencia configuravel via env var SMARTGRID_CONCURRENCY, default=10, valores recomendados: dev=2, staging=5, prod=10)
- **Referencia:** NFR-003, NFR-004, NFR-007, BR-002, BR-003, ADR-001

---

## Questões Abertas

Nenhuma questão aberta restante. Todas as questões (PEND-SGR-01 a PEND-SGR-05) foram resolvidas e implementadas.

---

<!-- Enriquecimento: AGN-DEV-10 completo -->
