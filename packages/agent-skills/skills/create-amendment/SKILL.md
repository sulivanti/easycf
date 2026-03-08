---
description: Cria uma emenda (amendment) governada para detalhar, corrigir ou revisar especificações existentes sem ferir o arquivo base original. Triggers: "criar emenda", "detalhar funcionalidade", "revisar regra", "adicionar comportamento ao módulo".
---

# Skill: create-amendment

## Objetivo

Conforme o `DOC-DEV-001`, os documentos primários (`BR-XXX.md`, `FR-XXX.md`, etc.) gerados via `scaffold-module` não devem ser editados diretamente para adição de novas complexidades, visando preservar a rastreabilidade original. O fluxo correto é gerar um **Anexo (Amendment)**.

Esta skill instrui o agente a gerar corretamente o anexo e atar os links nos arquivos principais (Base e Changelog).

---

## 1. Gatilhos

- "criar emenda"
- "adicionar um novo fluxo no módulo"
- "revisar a regra de negócio"
- "detalhar funcionalidade UX"

## 2. Parâmetros Obrigatórios da Execução

Antes de agir, o agente deve garantir que obteve com o usuário:

- **Caminho da User Story**: O arquivo na pasta `user-stories/features` contendo o incremento.
- **Pilar (Tipo)** onde a mudança afeta: `br`, `fr`, `data`, `int`, `sec`, `ux`, `nfr`.
- **Natureza da Alteração**:
  - `M` (Melhoria)
  - `R` (Revisão)
  - `C` (Correção)

**REGRA DE BLOQUEIO (GATE DE APROVAÇÃO):**
Leia a User Story fornecida. Se o `Status` não for `APPROVED` (se for `IN_PROGRESS`, `REFINING`, `READY`, ou `REJECTED`), aborte a operação e avise o usuário.
O "Conteúdo da Alteração" que você usará será a regra de negócio/gherkin extraída automaticamente de dentro desta US `APPROVED`.

---

## 3. PASSO 1: Descoberta e Sequenciamento (Cálculo do Delta)

1. Navegue até o diretório de destino correspondente: `docs/04_modules/mod-{ID}-*/amendments/{pilar}/{Pilar}-{ID}/`.
2. Liste os arquivos existentes neste diretório usando suas ferramentas de sistema (`list_dir`).
3. Calcule o próximo número sequencial. Se houver `FR-101-M01.md`, o próximo será `02`.
4. Defina o nome do novo arquivo: `{Pilar}-{ID}-{Natureza}{Sequencial}.md` (ex: `FR-101-M02.md`).

---

## 4. PASSO 2: Criação do Arquivo de Emenda (ZERO ALUCINAÇÃO)

**Regra Inviolável:** Consulte sempre o `docs/01_normativos/DOC-DEV-001_especificacao_executavel.md` e o `DOC-ARC-003__Ponte_de_Rastreabilidade.md` para garantir que o formato do seu texto respeita as diretrizes vigentes. Não dedunza tabelas soltas.

Crie o arquivo na respectiva subpasta (`/amendments/...`). O esqueleto deste arquivo delta deve conter:

```markdown
# Emenda: {Pilar}-{ID}-{Natureza}{Sequencial} (ex: FR-101-M02)

- **Referência:** [Link ou Citação ao arquivo Base `{Pilar}-{ID}.md`]
- **Data:** {Data Atual}
- **Motivação:** {Breve resumo do porquê a mudança está sendo feita}

## Detalhamento
{O conteúdo descritivo, regras, tabelas ou fluxos que o usuário forneceu, formatado estritamente conforme a norma para este pilar).
```

---

## 5. PASSO 3: Amarração Ascendente (Link no Arquivo Base)

1. Abra o arquivo raiz pai (ex: `docs/04_modules/mod-{ID}-*/requirements/{pilar}/{Pilar}-{ID}.md`).
2. Adicione **silenciosa e cirurgicamente** uma nova seção chamada `- **Alterações:**` (se não existir) próxima aos metadados e liste o novo anexo gerado como um bullet point:
   `- {Pilar}-{ID}-{Natureza}{Sequencial} ({Resumo})` -> ex: `- FR-101-M02 (Adição de Botão Exportar)`
3. Abra também o arquivo agregador do módulo inteiro (`docs/04_modules/mod-{ID}-*/mod.md`) e adicione as evidências das emendas geradas debaixo da respectiva sessão do "Item base" que foi alterado.

---

## 6. PASSO 4: Registro de Autenticidade (Changelog do Módulo)

1. Abra o arquivo `CHANGELOG.md` na raiz do módulo.
2. Infira um bump semântico na versão da tabela (`Minor` para `M`, `Patch` para `C`/`R`).
3. Adicione uma linha na tabela com o formato:
   `| {Nova Versão} | {Data Atual} | {Owner} | {Descrição amarrando o Anexo gerado} |`

---

## Passo Intermediário: Atualização do Índice do Módulo (update-markdown-file-index)

Antes de comunicar ao usuário, **invoque a skill `update-markdown-file-index`**:

- Arquivo alvo: `docs/04_modules/mod-{ID}-*/mod.md`
- Pasta a indexar: `docs/04_modules/mod-{ID}-*/amendments/{pilar}/`
- Isso garante que o `mod.md` liste o novo amendment gerado sob o item base correspondente.

---

## Passo Final: Comunicação

Responda ao usuário com o link do novo anexo gerado e confirme:

- O bump semântico registrado no arquivo base e no Changelog.
- Que o `mod.md` foi atualizado com a referência ao novo amendment.
