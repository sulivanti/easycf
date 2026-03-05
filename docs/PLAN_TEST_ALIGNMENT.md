# Plano de Adequação de Testes (Test Alignment Plan)

**Data:** 2026-03-04
**Referência:** `DOC-ARC-002__Estrategia_Testes.md`, `TESTING-STRATEGY.md`, `TST-000.md`, `TST-001.md`

## 1. Contexto

Foi realizada uma revisão no repositório para verificar se a estrutura atual do código reflete o que foi documentado nas estratégias de testes e especificações técnicas. Embora os normativos e as especificações de testes (TDD/BDD) estejam presentes, o código ainda não reflete essa organização.

## 2. Inconsistências Encontradas

1. **Ausência de Bibliotecas de Teste:** Os arquivos `package.json` dos módulos `api` e `web` não contêm as dependências descritas em `TESTING-STRATEGY.md`, como `vitest`, `supertest`, `@testcontainers/postgresql`, `vitest-mock-extended` e `@faker-js/faker`.
2. **Ausência da Estrutura de Diretórios:** A arquitetura de testes detalhada na seção *6. Estrutura de Fixtures e Factories* não existe. O diretório `apps/api/src/tests/` e seus subdiretórios `factories/`, `helpers/` e `fixtures/` não foram criados.
3. **Casos de Teste Pendentes:** Os documentos `TST-000.md` e `TST-001.md` preveem dezenas de testes de unidade e integração (ex: AuthN, IDOR, CRUD de usuários) com cobertura mínima de 80%, mas atualmente o projeto não contém arquivos de teste (nenhum `*.test.ts` ou `*.spec.ts` com código de teste implementado).

## 3. Plano de Ação

Para alinhar a base de código aos documentos normativos da arquitetura de testes, propõe-se o seguinte plano de execução:

### Fase 1: Setup da Infraestrutura de Testes

- Adicionar dependências no projeto `api` (`vitest`, `supertest`, testcontainers, etc).
- Criar configuração básica do Vitest (`vitest.config.ts`).
- Criar a estrutura base descrita no TESTING-STRATEGY:
  - `apps/api/src/tests/factories`
  - `apps/api/src/tests/helpers`
  - `apps/api/src/tests/fixtures`
- Implementar as factories normativas: `tenant.factory.ts`, `user.factory.ts`, `session.factory.ts`, `role.factory.ts`.
- Configurar o script global de `setup/teardown` do banco (`apps/api/src/tests/helpers/db-setup.ts`).

### Fase 2: Implementação Mod-000 (Foundation)

- Implementar suíte de testes unitários para os serviços da Foundation (~80% coverage).
- Implementar testes de integração para os casos descritos no `TST-000.md` (Autenticação, MFA, IDOR, RBAC, Auditoria).
- Rodar validação de CI inicial simulada para certificar a qualidade.

### Fase 3: Implementação Mod-001 (Backoffice Admin)

- Implementar suíte de testes unitários para Backoffice Admin (validators, rotas).
- Implementar testes de integração referenciando os cenários estipulados no `TST-001.md` (Gestão de Usuários, Gestão de Perfis, Auditoria).

### Fase 4: Integração Contínua (CI)

- Adicionar o passo de execução de testes no pipeline (GitHub Actions ou equivalente).
- Configurar travamento formal de merge em caso de falha nos teses (`test:unit`, `test:integration`) ou cobertura menor que 80%.

## 4. Conclusão

O planejamento (documentação Spec-First) foi executado com sucesso e a estratégia está sólida. O próximo passo é aplicar a Fase 1 do plano de ação para suportar a implementação da regra "Validate-After".
