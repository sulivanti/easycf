# Plano de Adequação de Testes (XP-Driven)

**Versão:** 2.0 (XP-Driven)
**Data:** 2026-03-09
**Referência:** `TESTING-STRATEGY.md`

## 1. Contexto

Com a evolução da arquitetura para a abordagem **XP-Driven (Extreme Programming)**, a antiga estratégia burocrática de testes (que exigia a criação formal e transição de arquivos isolados físicos `TST-NNN.md`) foi **abolida**.
No paradigma XP, os testes orientados a comportamento e domínio (TDD/BDD) devem fluir naturalmente e simultaneamente com o código. A fonte de verdade das regras são as especificações vivas (os `FR-NNN` e `BR-NNN` gerados pelo `forge-module` a partir das User Stories). O **Vitest** é a prova executável.

## 2. Inconsistências Históricas a Corrigir

A estrutura anterior deixou as seguintes pedências no repositório, que agora serão sanadas via mãos na massa:

1. **Dependências Ausentes:** Faltam libs essenciais como `vitest`, `supertest`, `@testcontainers/postgresql` e `@faker-js/faker` no ecossistema (backend).
2. **Estrutura Base Inexistente:** O diretório de fábricas e fixtures testáveis (`tests/factories`, `helpers/`) não existe fisicamente.
3. **Burocracia Documental:** Descartar a necessidade de `TST-000` em Markdown em favor do código propriamente dito (`*.test.ts`, `*.spec.ts`).

## 3. Plano de Ação XP (Em Execução)

Para habilitar a automação XP na camada de testes, o seguinte plano tático está sendo executado:

### Fase 1: Setup da Infraestrutura Real (Vitest V8)

- Instalar as dependências Vitest e utilitários no topo da aplicação transacional (`apps/api`).
- Criar a estrutura canônica global: `tests/factories`, `tests/helpers` e as primeiras implantações de `user.factory.ts`, facilitando mocks para os devs.

### Fase 2: Automatizando o Test-Driven-Development

- Elevar a skill `forge-module` para **injetar automaticamente a pasta `tests/`** instanciando scaffolding de unit e e2e tests vazios atrelados ao Módulo, instigando o test-first.
- O desenvolvedor mapeia as suítes Vitest usando labels de rastreabilidade do `FR` e `BR` (ex: `describe('[FR-001] Cadastro')`).

### Fase 3: CI/CD com Block

- Travar a esteira em caso de quebra ou code coverage (branch minimum) indevido.

## 4. Conclusão

A burocracia documental de "Test Cases" em `.md` não escala. Estamos removendo a barreira do "mock no papel" e implementando TDD assistido estritamente conectado à feature da User Story (XP-Driven).
