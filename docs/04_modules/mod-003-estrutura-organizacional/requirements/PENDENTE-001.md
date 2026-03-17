> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-16 | arquitetura | Criado por AGN-DEV-10 (enrich) |

# PENDENTE-001 — Pendências e Questões Abertas do MOD-003

---

## PENDENTE-001 — Restore (FR-004) Não Coberto por User Story

- **Questão:** O endpoint `PATCH /org-units/:id/restore` (FR-004) foi identificado durante o enriquecimento a partir de BR-009, mas não está coberto por nenhuma user story existente. US-MOD-003-F01 cobre apenas CRUD + Tree Query + Vinculação N5.
- **Impacto:** Sem US, o FR-004 não entra formalmente no backlog ágil e pode ser esquecido na implementação.
- **Opções:**
  - **Opção A:** Criar US-MOD-003-F04 dedicada ao restore
  - **Opção B:** Expandir escopo de US-MOD-003-F01 para incluir restore
- **Recomendação:** Opção A — criar US-MOD-003-F04 para manter granularidade e rastreabilidade

## PENDENTE-002 — Endpoint de Timeline/Histórico (view_history)

- **Questão:** A ação `view_history` no UX-ORG-001 consome domain_events filtrados por `entity_type=org_unit`. Esse endpoint pertence ao MOD-000 (Foundation) ou o MOD-003 deve expor um proxy próprio?
- **Impacto:** Se for MOD-000, não precisamos de endpoint novo. Se for proxy, precisamos de FR adicional e rota no MOD-003.
- **Opções:**
  - **Opção A:** Consumir diretamente `GET /api/v1/domain-events?entity_type=org_unit&entity_id=:id` (MOD-000)
  - **Opção B:** Criar proxy `GET /api/v1/org-units/:id/history` no MOD-003
- **Recomendação:** Opção A — consumir do MOD-000 para evitar duplicação. O frontend já conhece o endpoint de domain_events.

## PENDENTE-003 — Semântica Dual de tenant_id (RLS vs. Vínculo Funcional)

- **Questão:** A coluna `tenant_id` em `org_units` tem semântica de RLS (isolamento), enquanto `tenant_id` em `org_unit_tenant_links` tem semântica de vínculo funcional (N4→N5). Nomes iguais, significados diferentes. Isso pode confundir desenvolvedores.
- **Impacto:** Risco de bugs onde filtro RLS é confundido com vínculo funcional ou vice-versa.
- **Opções:**
  - **Opção A:** Manter `tenant_id` em ambas (padrão Foundation) + documentar claramente no DATA-001
  - **Opção B:** Renomear coluna em `org_unit_tenant_links` para `linked_tenant_id` para diferenciar
- **Recomendação:** Opção A — manter padrão Foundation. Documentação em DATA-001 + ADR-003 já cobre.

## PENDENTE-004 — Soft Limit de 500 Nós por Tenant

- **Questão:** NFR-001 define soft limit de 500 nós org_units por tenant. Qual o comportamento ao atingir o limite?
- **Impacto:** Sem definição, o sistema pode degradar silenciosamente ou bloquear sem mensagem clara.
- **Opções:**
  - **Opção A:** Warning no response header (`X-Limit-Warning`) ao criar nó quando count > 400 (80%)
  - **Opção B:** Hard block com 422 ao atingir 500
  - **Opção C:** Apenas métricas/alertas internos, sem impacto no usuário
- **Recomendação:** Opção A — warning precoce permite planejamento sem bloquear operações legítimas

## PENDENTE-005 — Validação de BR-008 (Unicidade codigo por tenant)

- **Questão:** A constraint `UNIQUE(tenant_id, codigo)` no DB é suficiente, ou precisamos de validação aplicacional prévia (check antes do INSERT) para gerar mensagem de erro amigável 409?
- **Impacto:** Se depender apenas da constraint DB, o erro retornado pode ser genérico (500 ou constraint violation) em vez de 409 com mensagem clara.
- **Opções:**
  - **Opção A:** Validação aplicacional (SELECT EXISTS antes do INSERT) + constraint DB como safety net
  - **Opção B:** Apenas constraint DB + catch do erro de constraint e tradução para 409
- **Recomendação:** Opção B — catch da constraint violation é suficiente para Nível 1 (evita race condition do SELECT+INSERT) e reduz complexidade

---

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-16
- **rastreia_para:** US-MOD-003, FR-001, FR-004, BR-008, BR-009, DATA-001, NFR-001, UX-001, ADR-003
- **referencias_exemplos:** EX-CI-007
- **evidencias:** N/A
