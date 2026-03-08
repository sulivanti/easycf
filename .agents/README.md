# Agentes e Skills

Este diretório contém a inteligência e os fluxos de trabalho que estendem as capacidades do EasyCodeFramework.

## Como Interagir via Chat

Você pode interagir diretamente com os agentes solicitando o uso das ferramentas e conhecimentos definidos aqui.

### Exemplos de Uso

Você pode simplesmente dar ordens como:

* "@[README.md] valide esse arquivo com a skill de QA"
* "Rode o lint de markdown no README e corrija o que for preciso"
* "Comite as alterações da US-MOD-001 usando a skill de Git"
* "Sincronize o projeto privado (save the day)"
* "Execute o workflow de /release"

## Estrutura

* **`skills/`**: Definições de comportamentos e conhecimentos especializados.
  * **`qa_assistant`**: Validação de metadados, links e sintaxe Markdown (MarkdownLint).
  * **`git_assistant`**: Gestão de commits semânticos em PT-BR e sincronização de repositórios.
* **`workflows/`**: Sequências de comandos e passos para automação de tarefas recorrentes (ex: `/release`).
