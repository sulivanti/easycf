> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo/requisito em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: PKG-COD-001-M01

- **Documento base:** [PKG-COD-001](../../../02_pacotes_agentes/PKG-COD-001_Pacote_Agentes_Geracao_Codigo.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-28
- **owner:** arquitetura
- **Motivação:** Instruir AGN-COD-WEB a consumir screen manifests e blueprints DOC-UX-014 para gerar páginas ricas com state coverage completa, eliminando o gap entre codegen e design.
- **rastreia_para:** DOC-UX-014

---

## Detalhamento

### Adição a §3.5 AGN-COD-WEB — Manifest Ingestion & Blueprint Compliance

**Inserção:** Após o bloco de instruções existentes de AGN-COD-WEB, antes de §4 AGN-COD-VAL.

#### Regras de Ingestão de Screen Manifest (MUST)

1. **MUST** ler o screen manifest YAML para cada página gerada. O manifest está em `docs/05_manifests/screens/ux-{slug}-{NNN}.*.yaml` (ex: `ux-usr-001.users-list.yaml`).
2. **MUST** aplicar o blueprint de DOC-UX-014 correspondente ao `type` da tela (list, form, detail, dashboard, config, monitor, inbox).
3. **MUST** importar de `@shared/ui/` todos os componentes listados em `shared_ui_components` do manifest (se presente). Se ausente, usar os `required_components` do blueprint DOC-UX-014 como fallback.
4. **MUST** implementar state coverage completa para cada página:
   - **Loading:** `Skeleton` (de `@shared/ui/skeleton`) durante carregamento de dados
   - **Empty:** `EmptyState` (de `@shared/ui/empty-state`) quando query retorna zero resultados
   - **Error:** `Toast` (via `sonner` de `@shared/ui/sonner`) com `correlationId` RFC 9457
   - **ErrorBoundary:** envolver a página para capturar erros React
5. **SHOULD** consultar `penpot_design` do manifest (se presente) para decisões de layout e espaçamento.

#### Documentos Adicionais Requeridos

Adicionar à lista de `required_docs` de AGN-COD-WEB:
- `DOC-UX-014` — Page Layout Blueprints (composição obrigatória por tipo de tela)

---

## Impacto nos Pilares

- **Pilares afetados:** AGN-COD-WEB (§3.5), codegen-agent pipeline
- **Ação requerida:**
  1. Atualizar `codegen-agent.md` (PASSO 3, 5, 7.2) para incluir ingestão de manifest e validação de blueprint
  2. Atualizar `.agents/codegen-registry.json` para incluir `DOC-UX-014` em `required_docs` de AGN-COD-WEB
  3. Atualizar `.agents/context-map.json` para incluir `DOC-UX-014` no contexto do codegen-agent

---

## Resolução do Merge

> **Merged por:** merge-amendment em 2026-03-28
> **Versão base após merge:** 1.6.0
> **Alterações aplicadas:** Regras de ingestão de screen manifest e blueprint DOC-UX-014 inseridas em §3.5 AGN-COD-WEB do PKG-COD-001. Required Docs atualizado com DOC-UX-014. Changelog atualizado.
