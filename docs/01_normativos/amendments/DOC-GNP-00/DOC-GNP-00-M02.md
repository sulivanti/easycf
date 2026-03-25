> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-GNP-00-M02

- **Documento base:** [DOC-GNP-00](../../DOC-GNP-00__DOC-CEE-00__DOC-CHE-00__Consolidado_v2.0.md)
- **estado_item:** DRAFT
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-25
- **owner:** arquitetura
- **Motivação:** O gate de build (DOC-GNP-00-M01) verifica artefatos estáticos, mas não valida que rotas dos módulos estejam efetivamente registradas no entry point. O diagnóstico de FR-000-C02 mostrou que amendments sintomáticos corrigiam rotas uma a uma, quando o problema raiz era a ausência de um gate de completude de registro. Necessário gate explícito que valide 100% de cobertura de route exports.
- **rastreia_para:** DOC-GNP-00, DOC-GNP-00-M01, DOC-ARC-004

---

## Detalhamento

### Adição ao §2.1 — Artefatos Obrigatórios por Workspace (Gate de Build)

#### Workspace `apps/api/` — Novos itens

| Artefato | Obrigatório | Descrição |
|----------|-------------|-----------|
| `src/index.ts` — Completude de registro de rotas | ✅ | O entry point DEVE registrar todos os plugins de rota exportados pelos módulos conforme DOC-ARC-004 §2 e §7. Validado por `scripts/validate-route-registration.ts`. |

#### Novo check obrigatório: Completude de Registro de Rotas

Todo module que exporta route plugins (funções terminando em `Routes`, `Route` ou `Plugin`) DEVE ter esses plugins registrados no entry point via `app.register()`. A ausência de registro resulta em rotas 404 em produção.

**Validação:**
```bash
npx tsx scripts/validate-route-registration.ts
```

**Critério de aprovação:** Exit code 0 (zero gaps entre exports e registros).

---

## Impacto nos Pilares

- **Pilares afetados:** FR (completude funcional), NFR (gate de CI)
- **Módulos impactados:** Todos os módulos API (MOD-000 a MOD-010)
- **Ação requerida:**
  1. Garantir que `scripts/validate-route-registration.ts` existe e funciona
  2. Integrar validação no CI pipeline (gate EX-CI-007)
  3. Executar validação a cada codegen de novo módulo (DOC-ARC-004 §8)
