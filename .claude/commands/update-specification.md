# Skill: update-specification

Atualiza um arquivo de especificação existente. Governa documentos normativos e o ciclo de vida versionado de specs de módulos (04_modules).

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `update-specification`

## Argumento

$ARGUMENTS deve conter o caminho do arquivo a ser atualizado. Se não fornecido, pergunte ao usuário.

## Regra de Governança: Delegação para create-amendment

Quando o arquivo em edição for um **arquivo de módulo** (`BR-`, `FR-`, `DATA-`, `SEC-`, `UX-`, `NFR-`, `INT-`) localizado em `docs/04_modules/`:

**NÃO aplique edição direta. DELEGUE IMEDIATAMENTE para `/project:create-amendment`.**

Fluxo de decisão:

```text
Arquivo está em docs/04_modules/mod-*/requirements/**?
├── SIM → Interrompa. Invoque /project:create-amendment com:
│         - Caminho da User Story ou motivação
│         - Pilar afetado (br | fr | data | int | sec | ux | nfr)
│         - Natureza: M (Melhoria) | C (Correção) | R (Revisão)
└── NÃO → Continue para as regras genéricas abaixo.
```

> Nunca remova a tag `> ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO` do topo de arquivos de módulo.

## Regras Genéricas (specs fora de 04_modules)

Para documentações sem versão gerenciada via Amendments:

- Use linguagem precisa, explícita e não ambígua
- Distinga entre requisitos, restrições e recomendações
- Use formatação estruturada
- Defina acrônimos e termos de domínio
- Inclua exemplos e edge cases
- O documento deve ser autossuficiente

## Template

Para specs fora de módulos, use: `.agents/templates/spec-template.md`
