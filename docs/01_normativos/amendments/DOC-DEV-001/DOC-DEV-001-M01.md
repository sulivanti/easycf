> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo em estado ACTIVE.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-DEV-001-M01

- **Documento base:** [DOC-DEV-001](../../DOC-DEV-001_especificacao_executavel.md)
- **estado_item:** DRAFT
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-25
- **owner:** arquitetura
- **Motivação:** O template de especificação executável não exige que o spec defina como os route plugins do módulo serão registrados no entry point. Isso causou uma cascata de módulos desconectados (FR-000-C03). Necessário adicionar seção obrigatória de "Entry Point Wiring" ao template.
- **rastreia_para:** DOC-DEV-001, DOC-ARC-004, FR-000-C03

---

## Detalhamento

### Nova seção obrigatória no template de especificação: Entry Point Wiring

Toda spec de módulo gerada via `forge-module` DEVE incluir a seguinte seção:

```markdown
## Entry Point Wiring (DOC-ARC-004)

| Plugin Export | Prefix | Registrado em index.ts |
|---|---|---|
| `xxxRoutes` | `/api/v1/xxx` | Sim/Não |
```

**Regras:**
- A tabela DEVE listar todos os plugins de rota exportados pelo módulo
- O prefix DEVE seguir o padrão de DOC-ARC-004 §6 (paths relativos)
- A coluna "Registrado em index.ts" DEVE ser atualizada para "Sim" após o wiring
- O codegen DEVE incluir um passo final obrigatório: registrar o módulo no entry point

### Passo obrigatório no codegen de módulo

Adicionar ao final de todo codegen de módulo:

> **STEP-FINAL: Wire module into entry point**
> 1. Importar route exports do módulo em `apps/api/src/index.ts`
> 2. Adicionar `app.register(plugin, { prefix })` com prefix correto
> 3. Registrar error handler se exportado pelo módulo
> 4. Executar `npx tsx scripts/validate-route-registration.ts`

---

## Impacto nos Pilares

- **Pilares afetados:** FR (completude funcional), NFR (prevenção de recorrência)
- **Módulos impactados:** Todos os módulos futuros
- **Ação requerida:**
  1. Atualizar skill `forge-module` para incluir seção Entry Point Wiring
  2. Atualizar codegen plan para incluir STEP-FINAL
  3. Verificar que módulos existentes (MOD-000 a MOD-010) têm wiring completo
