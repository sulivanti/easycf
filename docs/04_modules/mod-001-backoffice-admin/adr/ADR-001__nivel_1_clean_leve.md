> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-17 | AGN-DEV-09  | Baseline — formaliza decisão de nível arquitetural |

# ADR-001 — Nível 1 (Clean Leve) para Módulo UX-First com Score 1/6

---

## Contexto

O MOD-001 (Backoffice Admin) é um módulo **UX-First** que não possui lógica de domínio própria — consome exclusivamente endpoints do MOD-000 (Foundation). Ao aplicar o score DOC-ESC-001 §4.2, o módulo atinge **1/6** (apenas "multi-tenant/escopo por cliente" presente), o que o qualificaria para **Nível 0 (CRUD Direto)**.

Porém, Nível 0 implica ausência de separação presentation/application/domain e testes limitados ao controller. Para um módulo que será o **Shell de todos os módulos frontend** (Sidebar, Header, Breadcrumb, Dashboard), essa simplicidade comprometeria a manutenibilidade.

## Decisão

Adotar **Nível 1 — Clean Leve** (DOC-ESC-001 §6) para o MOD-001, com a seguinte estrutura no frontend:

```
apps/web/src/modules/backoffice-admin/
  ui/          → screens, components, forms
  domain/      → view-model, rules (formatters, saudação por período)
  data/        → queries (fetch/SDK), mappers
```

## Alternativas

- **(A) Nível 0 — CRUD Direto:** Menor cerimônia, mas acoplaria UI diretamente ao data layer. Dificultaria testes de regras de UI (saudação, filtro por scopes, skeleton timeout).
- **(B) Nível 2 — DDD Completo:** Excesso de abstração para módulo consumidor sem entidades, agregados ou invariantes próprias.

## Consequências

- **Positivas:**
  - Testabilidade: `domain/view-model.ts` testável isoladamente (saudação, filtro de scopes, formatação)
  - Separação de camadas: `data/` isolado de `ui/`, permitindo mock dos endpoints MOD-000
  - Evolução: Shell consumido por MOD-002+ — a separação facilita extensibilidade (novos itens de Sidebar, novos shortcuts)
- **Negativas:**
  - Ligeiramente mais pastas/arquivos que N0 para um módulo sem backend próprio
  - Risco de over-engineering se a equipe criar abstrações desnecessárias (mitigado por DOC-ESC-001 §9 — regras anti-burocracia)

## Status

**ACEITA** — decisão registrada em mod.md §3 com justificativa completa e score table.

## Validade

Permanente (não sujeita a timebox de 90 dias, pois é decisão estrutural do módulo).

---

- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-001, MOD-001, DOC-ESC-001
- **referencias_exemplos:** EX-CI-007
- **evidencias:** N/A
