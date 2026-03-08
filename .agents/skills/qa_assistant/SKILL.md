---
name: qa_assistant
description: Assistente de QA para ajudar na validação de metadados, manifestos e integridade de documentação Markdown.
---

# QA Assistant Skill

Esta *Skill* define o comportamento que o agente de inteligência deve adotar sempre que o usuário solicitar para realizar testes de qualidade, rodar a pipeline de CI local ou "fazer lint" do projeto no contexto de documentação e manifestos.

## Objetivos e Diretrizes Principais

1. **Garantir a integridade da Documentação (Lint):** O projeto utiliza referências relativas entre arquivos markdown; qualquer quebra de link deve ser corrigida.
2. **Validar Manifestos YAML (JSON Schema):** O projeto baseia-se fortemente em artefatos declarativos (YAML) avaliados contra schemas bem definidos. Você deverá orquestrar essa validação.
3. **Oferecer Feedback Corretivo (PT-BR):** Durante os processos, se algo falhar, avalie as mensagens do console (por exemplo, os erros providos pelo Ajv) e forneça a explicação ou sugira a correção ao usuário da forma mais clara e objetiva possível.

## Scripts de QA Existentes

Para invocar as validações, utilize os comandos já previstos no `package.json`. Você pode rodá-los combinados ou separados através do terminal via `run_command` do PowerShell.

### `npm run qa:all`

Este comando atua como o **Master Quality Gate** rodando todas as validações cabíveis do repositório de uma só vez (atualmente o lint e o validate de manifestos).

### 1. Lint da Documentação (`npm run lint:docs`)

Inspeciona todos os arquivos `.md` criados no diretório `docs/` e garante que não há dead-links locais entre os documentos. Além disso, o script possui regras de checagem profunda para arquivos de User Stories e Épicos.

- Rode este comando, caso haja falha ele emitirá erros como `[Erro] Referência de arquivo quebrada` ou inconsistências de metadados.
- Tente identificar o caminho correto do arquivo que o usuário quis apontar.
- **Checagem Ativa de User Story (IMPORTANTE)**: Ao revisar ou criar uma User Story (`US-*.md`), você deve **obrigatoriamente**:
  1. Utilizar o `find_by_name` ou explorar o sistema de arquivos para confirmar que todos os normativos (`DOC-*`, `SEC-*`, `INT-*`) marcados como prontos `[x]` na aba "Definition of Ready" **existem de fato** no projeto. Não permita checkboxes marcados para arquivos inexistentes.
  2. Garantir que o `Status:` no topo do arquivo é compatível semanticamente com o `estado_item:` da seção "Metadados de Governança".
  3. Garantir que tudo listado em `Referências Normativas` seja copiado 1:1 para a lista `rastreia_para` nos metadados.

- Rode este comando, caso haja falha ele emitirá `[Erro] Referência de arquivo quebrada`.
- Tente identificar o caminho correto do arquivo que o usuário quis apontar.

### 2. Lint de Sintaxe Markdown (`npm run lint:markdown`)

Inspeciona todos os arquivos `.md` em busca de falhas de formatação de acordo com as regras do MarkdownLint.

- Caso falhe com regras como `MD009`, `MD012`, `MD040`, avalie o arquivo e as linhas informadas no console, corrigindo as quebras de padrão sintático.

### 3. Validação de Manifestos (`npm run validate:manifests`)

A função primordial desse script, `validate-manifests.js`, é olhar as pastas como `docs/05_manifests/screens/` e conferir se todos os seus YAMls estão obedecendo a tipagem imposta pelo seu JSON Schema associado.

- Os erros serão expostos com descrições das "keywords" que falharam (e.g. `type: array`, `required`, etc).
- Caso não passe, alerte o usuário e até ativamente crie uma "implementation_plan" para reparar o manifesto no escopo do desenvolvimento atual.

## Tarefas Comuns como Agente

1. **Pedido Genérico de QA:**
   Se o usuário disser: "Rode os testes", "Faz a checagem", ou "Pode validar tudo"
   **Você deve:** Rodar o comando `npm run qa:all` para assegurar a consistência dos artefatos.

2. **Resolução de Conflitos em Yaml:**
   Quando a checagem apontar erros no schema (Ex: "Atributo X faltando no UX Shell"), você deverá propor o pequeno delta e aplicá-lo nos arquivos correspondentes (com o consentimento do usuário se for uma mudança que afeta o modelo mental ou de negócio).
