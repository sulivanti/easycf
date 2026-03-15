# TESTING-STRATEGY — Estratégia Global de Testes (EasyA2)

> **Para agentes GenAI:** Este documento define os padrões e regras obrigatórios de testes para todos os módulos.
> Antes de gerar qualquer código de teste, leia esta estratégia. Cada módulo complementa estes padrões globais com seu próprio `requirements/tst/TST-NNN.md`.

---

## 1. Filosofia XP-Driven (Executable Specifications)

O EasyA2 abandonou a criação de stubs de testes desconexos (`TST-NNN.md`). Adotamos a abordagem ágil onde **o código de teste (Vitest) é a única fonte da verdade e o contrato executável final**.

1. **Spec no Código (TDD/BDD)** — O comportamento desejado (`FR-NNN` e `BR-NNN`) guia o desenvolvedor a escrever os cenários (test specs) diretamente nos arquivos `.test.ts`.
2. **Cobertura validada em CI** — O gatilho de sucesso do `DONE` na sua User Story é a pipeline rodar sem erros.
3. **Mapeamento Explícito** — Um PR não pode ser aprovado sem que os casos listados na Rule de Negócio estejam espelhados em testes no repositório.

```text
FR-NNN.md + BR-NNN.md (Spec Ágil) ──→ Implementação Direta (Vitest + Código) ──→ CI (Done)
```

---

## 2. Pirâmide de Testes

```text
         ┌─────────────────┐
         │   E2E / UI      │  ← poucas, críticas (fluxos completos de usuário)
         ├─────────────────┤
         │  Integration    │  ← moderadas (API + DB + serviços)
         ├─────────────────┤
         │     Unit        │  ← maioria (regras de negócio, serviços, utils)
         └─────────────────┘
```

| Camada         | Responsabilidade                                                 | Ferramenta             |
|----------------|------------------------------------------------------------------|------------------------|
| **Unit**       | Regras de negócio, validações, utils, services isolados          | Vitest                 |
| **Integration**| Endpoints HTTP + banco real (Docker), serviços externos mockados | Vitest + Supertest     |
| **E2E**        | Fluxos completos do usuário via browser ou API chain             | Playwright / Supertest |

---

## 3. Cobertura Mínima Global

| Camada               | Cobertura mínima                 | Observações                                                                 |
|----------------------|----------------------------------|-----------------------------------------------------------------------------|
| Unit                 | **80% linhas**                   | Medido por Vitest Coverage (v8)                                             |
| Integration          | **Todos os endpoints do módulo** | Ao menos 1 caso happy path + 1 erro crítico                                 |
| Caminhos de segurança| **100%**                         | AuthN, AuthZ, IDOR, permissão negada — sem exceções                         |

> **Regra de agente:** Qualquer endpoint que envolva `SEC-NNN` ou `BR-NNN` com negação de acesso tem cobertura obrigatória de **100%** nos cenários de rejeição.

---

## 4. Ferramentas e Stack

| Ferramenta                   | Uso                                                                          |
|------------------------------|------------------------------------------------------------------------------|
| **Vitest**                   | Runner principal — unit e integration                                        |
| **Supertest**                | Requisições HTTP sobre o servidor Fastify em memória                         |
| **@testcontainers/postgresql**| PostgreSQL 17 real para testes de integração (CI/CD)                         |
| **vitest-mock-extended**     | Mocking tipado de interfaces e serviços                                      |
| **Playwright**               | Testes E2E de interface (quando especificado em UX-NNN)                      |
| **@faker-js/faker**          | Geração de dados de teste (factories)                                        |

---

## 5. Padrão de IDs de Casos de Teste

Todo caso de teste no código fonte, em suas declarações `describe` ou `it()`, deve obrigatoriamente referenciar seu Requisito Funcional ou Regra de Negócio que ele assegura.

```typescript
describe('[FR-001] Cadastro de Usuário', () => {
   it('deve registrar com dados válidos (HP)', async () => { ... })
   it('[BR-001.2] deve rejeitar email em uso (EV)', async () => { ... })
});
```

> A rastreabilidade sai do arquivo morto para a semântica da suíte de teste. O ID (`FR-NNN` ou `BR-NNN`) garante visibilidade sobre o que o teste protege.

---

## 6. Estrutura de Fixtures e Factories

Cada módulo deve manter seus próprios helpers em `apps/api/src/tests/factories/`:

```text
tests/
├── factories/
│   ├── tenant.factory.ts       ← cria tenant de teste
│   ├── user.factory.ts         ← cria usuário com roles
│   ├── session.factory.ts      ← cria sessão ativa
│   └── [modulo].factory.ts     ← factories específicas do módulo
├── helpers/
│   ├── db-setup.ts             ← setup/teardown de banco por teste
│   └── http-client.ts          ← wrapper Supertest pré-autenticado
└── fixtures/
    └── *.json                  ← dados estáticos de referência
```

**Regras de factory:**

- Sempre gera dados com `@faker-js/faker` — nunca hardcode de strings como `"teste123"`
- Factory deve isolar por `tenant_id` para não poluir outros testes
- Teardown obrigatório: todo dado criado em teste de integração **deve ser removido** ao final (uso de `afterEach` ou transações revertidas)

---

## 7. Fluxo de Validação de Cobertura (CI)

```powershell
# Rodar todos os testes com relatório de cobertura
npx vitest run --coverage

# Rodar apenas os testes de integração
npx vitest run --testPathPattern="integration"

# Gerar relatório HTML de cobertura
npx vitest run --coverage --reporter=html
```

O CI (GitHub Actions / pipeline) **bloqueia o merge** se:

- Cobertura de linhas cair abaixo de 80%
- Qualquer caso marcado como `OBRIGATÓRIO` no `TST-NNN.md` não tiver teste correspondente

---

Cada bloco de suíte de teste no repositório deve ser desenhado para agrupar os testes nas seguintes categorias conceituais (sendo declaradas ou tagueadas).

| Categoria               | Código | Descrição                                                 |
|-------------------------|--------|-----------------------------------------------------------|
| **Happy Path**          | `(HP)` | Fluxo principal com dados válidos e permissão correta     |
| **Erro de Validação**   | `(EV)` | Dados inválidos, campos obrigatórios ausentes             |
| **Erro de Autorização** | `(EA)` | Acesso negado, escopo insuficiente, token inválido        |
| **Isolamento de Tenant**| `(IT)` | Cross-tenant IDOR, header forjado, escopo de outro tenant |
| **Borda / Edge Case**   | `(EC)` | Valores limítrofes, condições de corrida, duplicatas      |
| **Não-Funcional**       | `(NF)` | Performance, tempo de resposta, tamanho de payload        |

---

## 9. Regras para Agentes GenAI (MUST READ)

Ao gerar código de teste Vitest, o agente **DEVE**:

1. **Mapear cada FR com blocos `describe`** — para cada funcionalidade em `FR-NNN`, deve existir ao menos 1 caso `(HP)` e 1 caso de erro correspondente.
2. **Cobrir 100% dos cenários de segurança** — toda regra `SEC-NNN` e `BR-NNN` com negação de acesso deve ter bloco de validação `(EA)` ou `(IT)`.
3. **Usar IDs rastreáveis** referenciando os FRs e BRs nos `describe/it` do código.
4. **Referenciar fixtures existentes** antes de criar novas — verificar `tests/factories/` primeiro.
5. **Nunca usar dados hardcodados** em factories — usar sempre `@faker-js/faker`.
6. **Nunca omitir teardown** em testes de integração (banco em memória/testcontainers).
7. **Consultar `IMP-000.md`** para anti-patterns antes de criar mocks incorretos.

---

Neste momento, as diretrizes de código-fonte de teste assumem toda a veracidade do tracking:

- **Frameworks Test-Driven**: Usamos Vitest embarcado no fluxo da esteira CI.
- **Isolamento e Segurança**: Cobertura baseada nos fluxos FR-BR descritos nos módulos.
- A fase de correções pendentes (Instalação Global da Base Transacional, Testcontainers, vitest configs) encontra-se em progresso no `docs/PLAN_TEST_ALIGNMENT.md`.

---

## Metadados

- estado_item: READY
- owner: arquitetura
- data_ultima_revisao: 2026-03-04
- rastreia_para: todos os módulos em 04_modules/
- evidencias: N/A
