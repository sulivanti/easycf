# Skill: create-amendment

Cria uma emenda (amendment) governada para detalhar, corrigir ou revisar especificações existentes sem ferir o arquivo base original. Conforme DOC-DEV-001, documentos com status `READY` não devem ser editados diretamente.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `create-amendment`

> **Ciclo de vida:** Stubs em `DRAFT` são enriquecidos diretamente. Esta skill é ativada **somente** quando o documento alvo já atingiu `READY`. Se o arquivo está em `DRAFT`, edite-o diretamente.

## Argumento

$ARGUMENTS deve conter o ID do requisito, pilar e natureza (ex: `FR-101 melhoria "adicionar botão exportar"`). Se não fornecido, pergunte ao usuário:

- **Caminho da User Story** (arquivo em `user-stories/features/`)
- **Pilar:** `br`, `fr`, `data`, `int`, `sec`, `ux`, `nfr`
- **Natureza:** `M` (Melhoria), `R` (Revisão), `C` (Correção)

## Gates de Aprovação

1. **User Story:** Leia a US. Se `status_agil` não for `DONE` ou `READY`, aborte.
2. **Documento Alvo:** Verifique `estado_item` do arquivo base:
   - Se `DRAFT` → NÃO use esta skill. Edite diretamente.
   - Se `READY` → Prossiga com o amendment.

## PASSO 1: Descoberta e Sequenciamento

1. Navegue até: `docs/04_modules/mod-{ID}-*/amendments/{pilar}/{Pilar}-{ID}/`
2. Liste arquivos existentes para calcular próximo número sequencial
3. Defina nome: `{Pilar}-{ID}-{Natureza}{Sequencial}.md` (ex: `FR-101-M02.md`)

## PASSO 2: Criação do Arquivo (ZERO ALUCINAÇÃO)

Consulte `docs/01_normativos/DOC-DEV-001_especificacao_executavel.md` e `DOC-ARC-003__Ponte_de_Rastreabilidade.md`. Crie o arquivo com:

```markdown
# Emenda: {Pilar}-{ID}-{Natureza}{Sequencial}

- **Referência:** [Link ao arquivo Base]
- **Data:** {Data Atual}
- **Motivação:** {Resumo}

## Detalhamento
{Conteúdo formatado conforme norma do pilar}
```

## PASSO 3: Amarração Ascendente

1. No arquivo base (ex: `BR-001.md`): adicione seção `- **Alterações:**` com bullet do novo anexo
2. No `mod.md` do módulo: adicione evidência do amendment

## PASSO 4: Changelog

1. Abra `CHANGELOG.md` na raiz do módulo
2. Bump semântico: `Minor` para `M`, `Patch` para `C`/`R`
3. Adicione linha na tabela de versões
4. Atualize diagrama Mermaid seguindo `DOC-DEV-002` seção 5

## PASSO 5: Atualização do Índice

Invoque `/project:update-index` para atualizar `mod.md` com o novo amendment.

## Passo Final: Comunicação

Responda com link do anexo, bump semântico e confirmação de atualização do `mod.md`.
