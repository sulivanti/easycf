---
name: readme-blueprint-generator
description: 'Gera ou atualiza o README.md do repositório analisando os documentos normativos do projeto (docs/01_normativos, docs/04_modules, docs/05_manifests). Triggers: "gerar README", "atualizar README", "readme do projeto", "documentar para novos devs", ou após marcos de entrega (ex: módulo em produção, onboarding de dev).'
---

# README Blueprint Generator

> [!IMPORTANT]
> **Quando usar neste projeto:**
>
> - Ao **onboarding de um novo desenvolvedor** no time
> - Após **encerrar um ciclo de entrega** (ex: MOD-XXX entrou em produção)
> - Quando o README estiver **desatualizado** em relação aos normativos
> - Ao criar uma **nova instância** do projeto (fork, novo ambiente)
>
> Frequência sugerida: a cada 2-3 módulos entregues, ou sempre que o stack técnico mudar.

---

## Fontes de Dados (Este Projeto)

Diferente do padrão genérico, este projeto **não usa `.github/copilot/`**. As fontes de verdade são:

| Fonte | Conteúdo |
| --- | --- |
| `docs/01_normativos/` | **Liste todos os arquivos** presentes neste diretório — cada um é um normativo do projeto |
| `docs/04_modules/` | Módulos implementados (status, responsáveis) |
| `docs/05_manifests/` | Manifestos de dependências e decisões |
| `docs/INDEX.md` | Índice geral dos documentos |

> [!IMPORTANT]
> Não assuma uma lista fixa de arquivos em `docs/01_normativos/`. Use `find_by_name` ou `list_dir` para descobrir os arquivos existentes no momento da execução.

---

## Processo de Geração

### 1. Leitura das Fontes

Leia **nesta ordem** antes de gerar qualquer conteúdo:

1. `docs/INDEX.md` — visão geral consolidada
2. **Todos os arquivos em `docs/01_normativos/`** em ordem alfabética — liste o diretório dinamicamente antes de ler. Priorize arquivos com `ESC`, `DEV`, `PADRAO` no nome para arquitetura e stack. Priorize arquivos com `ARC` para contratos e testes.
3. `docs/04_modules/` — liste os módulos disponíveis e seus status

### 2. Estrutura do README a Gerar

Crie ou atualize `README.md` na raiz do projeto com as seguintes seções:

#### Nome e Descrição do Projeto

- Nome, propósito e contexto de negócio
- Status atual (módulos em produção, em desenvolvimento)

#### Stack Tecnológico

- Fonte: `DOC-PADRAO-001`, `DOC-PADRAO-002`, `DOC-DEV-001`
- Liste: runtime, framework, ORM, banco, infra, autenticação

#### Arquitetura

- Fonte: `DOC-ESC-001`
- Visão em níveis (0, 1, 2) resumida
- Diagrama Mermaid se aplicável

#### Módulos Implementados

- Fonte: `docs/04_modules/`
- Tabela: `| Módulo | Status | Responsável |`

#### Primeiros Passos (Getting Started)

- Pré-requisitos (Node.js, Docker, variáveis de ambiente)
- Comandos: instalação, dev, migrations, testes
- Fonte: `DOC-PADRAO-001`, `DOC-PADRAO-004_Variaveis_de_Ambiente.md`

#### Padrões de Desenvolvimento

- Fonte: `DOC-DEV-001`, `DOC-ARC-001`, `DOC-ARC-002`
- Convenções de código, API, testes, ZERO ALUCINAÇÃO

#### Fluxo de Contribuição

- Fluxo: US → aprovação → scaffold → code → amendment
- Link para as skills no `.agents/skills/`

#### Documentação Normativa

- Tabela com links para todos os arquivos em `docs/01_normativos/`

### 3. Formatação

- Markdown bem formado com `<meta charset="UTF-8">` se HTML
- Badges de status onde aplicável
- Links relativos para os documentos normativos
- **Encoding UTF-8** obrigatório (sem BOM)

### 4. Salvar

Salve como `README.md` na raiz do repositório. Avise o usuário quais seções foram atualizadas e quais fontes foram consultadas.
