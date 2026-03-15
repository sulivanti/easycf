---
name: update-specification
description: 'Update an existing specification file for the solution, optimized for Generative AI consumption. It governs normative docs and the versioned lifecycle of module specs (04_modules).'
---

# Update Specification

Your goal is to update the existing specification file `${file}` based on new requirements or updates to any existing code.

- Se a spec estiver fora de `docs/04_modules/` (ex: em `01_normativos`), aplique as regras "Genéricas".
- Se a spec for um Módulo (`docs/04_modules/mod-.../`), você **DEVE** aplicar as regras do Pilar B da Governança (Ciclo de Vida via Deltas).

---

## Regra de Governança (04_modules) - Pilar B: Delegação para `create-amendment`

Quando o arquivo em edição for um **arquivo de módulo** (`BR-`, `FR-`, `DATA-`, `SEC-`, `UX-`, `NFR-`, `INT-`) localizado em `docs/04_modules/`, **NÃO aplique edição direta e NÃO duplique regras aqui**.

> 🔀 **DELEGAR IMEDIATAMENTE para a skill `create-amendment`.**

A skill `create-amendment` é a **fonte canônica** de todo o ciclo de vida de Amendments deste projeto (convenção de nomes `M`/`C`/`R`, atualização de versão semântica, registro no CHANGELOG, amarração ascendente ao arquivo base e ao `mod.md`).

**Fluxo de decisão:**

```text
Arquivo recebido está em docs/04_modules/mod-*/requirements/**?
├── SIM → Interrompa. Invoque create-amendment com os parâmetros:
│         - Caminho da User Story (se houver) ou motivação da mudança
│         - Pilar afetado (br | fr | data | int | sec | ux | nfr)
│         - Natureza: M (Melhoria) | C (Correção) | R (Revisão)
└── NÃO → Continue para as "Regras Genéricas" abaixo.
```

> ⚠️ Assegure que a tag `> ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.` nunca seja removida do topo de arquivos de módulo.

---

## Best Practices for AI-Ready Specifications (Regras Genéricas)

Para documentações em geral ou que não possuam versão gerenciada via Amendments:

- Use precise, explicit, and unambiguous language.
- Clearly distinguish between requirements, constraints, and recommendations.
- Use structured formatting (headings, lists, tables) for easy parsing.
- Avoid idioms, metaphors, or context-dependent references.
- Define all acronyms and domain-specific terms.
- Include examples and edge cases where applicable.
- Ensure the document is self-contained and does not rely on external context.

## Template de Especificações Genéricas

Para documentações fora de `docs/04_modules/` (normativos, specs técnicas, etc.), use o template canônico:

> 📄 **Template oficial:** [`.agents/skills/_templates/spec-template.md`](../_templates/spec-template.md)
>
> Copie a estrutura completa deste arquivo e preencha todas as seções. O template é a **fonte única de verdade** do formato de spec — qualquer evolução futura no layout é feita apenas lá.
