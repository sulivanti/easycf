# Skill: readme-blueprint-generator

Gera ou atualiza o `README.md` do repositório analisando documentos normativos, módulos e manifestos.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `readme-blueprint`

> **Quando usar:**
> - Onboarding de novo desenvolvedor
> - Após encerrar ciclo de entrega (módulo em produção)
> - README desatualizado em relação aos normativos
> - Criar nova instância do projeto
> Frequência sugerida: a cada 2-3 módulos entregues.

## Fontes de Dados

| Fonte | Conteúdo |
| --- | --- |
| `docs/01_normativos/` | Liste TODOS os arquivos — cada um é um normativo |
| `docs/04_modules/` | Módulos implementados (status, responsáveis) |
| `docs/05_manifests/` | Manifestos de dependências e decisões |
| `docs/INDEX.md` | Índice geral |

> **IMPORTANTE:** Não assuma lista fixa de arquivos em `docs/01_normativos/`. Liste o diretório dinamicamente.

## Processo

### 1. Leitura (nesta ordem)

1. `docs/INDEX.md`
2. Todos os arquivos em `docs/01_normativos/` em ordem alfabética (priorize `ESC`, `DEV`, `PADRAO` para stack e `ARC` para contratos)
3. `docs/04_modules/` — módulos e status

### 2. Estrutura do README

- **Nome e Descrição** — propósito, contexto, status atual
- **Stack Tecnológico** — fonte: DOC-PADRAO-001, DOC-PADRAO-002
- **Arquitetura** — fonte: DOC-ESC-001, níveis 0/1/2
- **Módulos** — tabela: Módulo | Status | Responsável
- **Getting Started** — pré-requisitos, comandos
- **Padrões de Desenvolvimento** — fonte: DOC-DEV-001, DOC-ARC-001/002
- **Fluxo de Contribuição** — US → scaffold → code → amendment
- **Documentação Normativa** — tabela com links para todos os normativos

### 3. Formatação

- Markdown UTF-8 (sem BOM)
- Badges de status onde aplicável
- Links relativos para documentos

### 4. Salvar

Salve como `README.md` na raiz. Avise quais seções foram atualizadas e fontes consultadas.
