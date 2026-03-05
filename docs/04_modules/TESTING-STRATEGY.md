# TESTING-STRATEGY — Estratégia Global de Testes (EasyA1)

> **Para agentes GenAI:** Este documento define os padrões e regras obrigatórios de testes para todos os módulos.
> Antes de gerar qualquer código de teste, leia esta estratégia. Cada módulo complementa estes padrões globais com seu próprio `requirements/tst/TST-NNN.md`.

---

## 1. Filosofia

O EasyA1 adota a abordagem **Spec-First, Validate-After**:

1. **Spec de teste ANTES da implementação** — o `TST-NNN.md` define *o que deve ser testado* junto com (ou antes de) o `FR-NNN.md`.
2. **Cobertura validada APÓS a implementação** — o código de teste é escrito durante/após a implementação, mas o contrato (casos obrigatórios, cobertura mínima) já está fixado na spec.
3. **Testes como contrato executável** — um PR não pode ser aprovado sem que os casos críticos do `TST-NNN` estejam cobertos por testes automatizados.

```
FR-NNN.md ──→ TST-NNN.md (spec de aceite)   →  Implementação  →  Código de Teste
   ↑___________________________________(refinamento via amendments TST-NNN-Mxx)◄──┘
```

---

## 2. Pirâmide de Testes

```
         ┌─────────────────┐
         │   E2E / UI      │  ← poucas, críticas (fluxos completos de usuário)
         ├─────────────────┤
         │  Integration    │  ← moderadas (API + DB + serviços)
         ├─────────────────┤
         │     Unit        │  ← maioria (regras de negócio, serviços, utils)
         └─────────────────┘
```

| Camada | Responsabilidade | Ferramenta |
|--------|-----------------|------------|
| **Unit** | Regras de negócio, validações, utils, services isolados | Vitest |
| **Integration** | Endpoints HTTP + banco real (Docker), serviços externos mockados | Vitest + Supertest |
| **E2E** | Fluxos completos do usuário via browser ou API chain | Playwright / Supertest |

---

## 3. Cobertura Mínima Global

| Camada | Cobertura mínima | Observações |
|--------|-----------------|-------------|
| Unit | **80% linhas** | Medido por Vitest Coverage (v8) |
| Integration | **Todos os endpoints do módulo** | Ao menos 1 caso happy path + 1 erro crítico |
| Caminhos de segurança | **100%** | AuthN, AuthZ, IDOR, permissão negada — sem exceções |

> **Regra de agente:** Qualquer endpoint que envolva `SEC-NNN` ou `BR-NNN` com negação de acesso tem cobertura obrigatória de **100%** nos cenários de rejeição.

---

## 4. Ferramentas e Stack

| Ferramenta | Uso |
|-----------|-----|
| **Vitest** | Runner principal — unit e integration |
| **Supertest** | Requisições HTTP sobre o servidor Fastify em memória |
| **@testcontainers/postgresql** | PostgreSQL 17 real para testes de integração (CI/CD) |
| **vitest-mock-extended** | Mocking tipado de interfaces e serviços |
| **Playwright** | Testes E2E de interface (quando especificado em UX-NNN) |
| **@faker-js/faker** | Geração de dados de teste (factories) |

---

## 5. Padrão de IDs de Casos de Teste

Todo caso de teste documentado em `TST-NNN.md` recebe um ID único e rastreável:

```
TC-<NNN>-<NN>
│    │    └── Número sequencial do caso dentro do módulo (01, 02, ...)
│    └───── Número do módulo (000, 001, ...)
└────────── Prefixo fixo "TC" (Test Case)
```

**Exemplos:**

- `TC-000-01` — Foundation: login com credenciais válidas → sessão criada
- `TC-000-12` — Foundation: acesso cross-tenant → 403 Forbidden
- `TC-001-03` — Backoffice: criar usuário sem permissão → 403 + log de auditoria

> O ID `TC-NNN-NN` deve aparecer no `describe` ou comentário do código de teste para rastreabilidade.

---

## 6. Estrutura de Fixtures e Factories

Cada módulo deve manter seus próprios helpers em `apps/api/src/tests/factories/`:

```
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

## 8. Categorias de Casos de Teste no TST-NNN

Cada `TST-NNN.md` organiza os casos nas seguintes categorias:

| Categoria | Código | Descrição |
|-----------|--------|-----------|
| **Happy Path** | `HP` | Fluxo principal com dados válidos e permissão correta |
| **Erro de Validação** | `EV` | Dados inválidos, campos obrigatórios ausentes |
| **Erro de Autorização** | `EA` | Acesso negado, escopo insuficiente, token inválido |
| **Isolamento de Tenant** | `IT` | Cross-tenant IDOR, header forjado, escopo de outro tenant |
| **Borda / Edge Case** | `EC` | Valores limítrofes, condições de corrida, duplicatas |
| **Não-Funcional** | `NF` | Performance, tempo de resposta, tamanho de payload |

---

## 9. Regras para Agentes GenAI (MUST READ)

Ao gerar código de teste ou spec `TST-NNN.md`, o agente **DEVE**:

1. **Mapear cada FR com casos de teste** — para cada funcionalidade em `FR-NNN`, deve existir ao menos 1 caso `HP` e 1 caso de erro correspondente.
2. **Cobrir 100% dos cenários de segurança** — todo `SEC-NNN` e toda `BR-NNN` com negação de acesso deve ter ao menos 1 caso `EA` ou `IT`.
3. **Usar IDs rastreáveis** (`TC-NNN-NN`) e referenciá-los nos `describe/it` do código.
4. **Referenciar fixtures existentes** antes de criar novas — verificar `tests/factories/` primeiro.
5. **Nunca usar dados hardcodados** em factories — usar sempre `@faker-js/faker`.
6. **Nunca omitir teardown** em testes de integração.
7. **Consultar `IMP-000.md`** para anti-patterns antes de criar qualquer schema de fixture.

---

## 10. Relacionamento entre Documentos

```
TST-NNN.md          ←── especifica casos de
    │
    ├── rastreia_para FR-NNN  (o que deve funcionar)
    ├── rastreia_para BR-NNN  (regras de negócio a validar)
    ├── rastreia_para SEC-NNN (segurança a cobrir)
    └── rastreia_para NFR-NNN (não-funcionais a medir)
```

---

## 11. Status de Implementação (Gap Analysis - 2026-03-04)

Atualmente, há uma discrepância entre esta estratégia documentada e a base de código real:

- **Bibliotecas Ausentes:** Os arquivos `package.json` não possuem as dependências de testes listadas na estratégia (como Vitest, Supertest, Testcontainers, etc).
- **Estrutura Ausente:** A organização de pastas exigida (ex: `apps/api/src/tests/factories`, `helpers`, `fixtures`) ainda não existe no código.
- **Falta de Implementação:** As especificações `TST-000.md` e `TST-001.md` exigem cobertura detalhada, porém não há arquivos de teste (`*.test.ts` ou `*.spec.ts`) criados na API.

Um planejamento para correção destas pendências foi elaborado em `docs/PLAN_TEST_ALIGNMENT.md`.

---

## Metadados

- estado_item: READY
- owner: arquitetura
- data_ultima_revisao: 2026-03-04
- rastreia_para: todos os módulos em 04_modules/
- evidencias: N/A
