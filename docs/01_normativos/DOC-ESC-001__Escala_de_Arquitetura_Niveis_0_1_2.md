# DOC-ESC-001 — Escala de Arquitetura (Nível 0/1/2) + Gatilhos de Adoção (TS + Node + Next.js)

**Versão:** 1.0  
**Status:** Normativo (aplicação obrigatória conforme regras abaixo)  
**Escopo:** Projetos TypeScript com **Node.js (API)** e **Next.js (Web)** em **monorepo**.

**Documentos Relacionados:**
- **DOC-DEV-001**: Documento de Especificação Executável
- **DOC-GNP-00 / DOC-CEE-00 / DOC-CHE-00**: Guia Normativo e Padrões
- **DOC-GPA-001**: Guia Padrão de Agente

---

## 1) Objetivo

Definir uma **escala pragmática** de arquitetura para que o time:
- mantenha **padronização do produto final** (contratos, qualidade, CI, segurança, observabilidade),
- aplique **DDD-lite** e **Clean Architecture** **na medida** da complexidade,
- evite burocracia em casos simples **sem abrir mão de consistência**.

---

## 2) Termos e definições

- **Nível 0 — CRUD Direto:** mínima cerimônia; separação apenas para não "vazar" ORM/SQL/HTTP para todo lado.
- **Nível 1 — Clean Leve:** separa apresentação, aplicação e infraestrutura; domínio pode ser leve.
- **Nível 2 — DDD-lite + Clean Completo:** domínio rico (Entidade/VO/Agregado/Invariantes) protegido por camadas e portas/adapters.

> **Regra de ouro:** a profundidade arquitetural (0/1/2) varia, mas os **padrões de produto** (Seção 3) são sempre aplicados.

---

## 2.1) Governança de Decisões Arquiteturais e Exceções (ADR)
Sempre que o padrão definido na Seção 3 for desafiado, **deve-se** abrir uma ADR (Architecture Decision Record).

### Gatilhos Obrigatórios para ADR:
1. **Quebra de Padrão:** Introdução de uma nova tecnologia não-aprovada (ex: usar MongoDB quando o default é Postgres).
2. **Desvio de Segurança ou Resiliência:** Remoção de Idempotência ou Timeout onde o template exige.
3. **Escala de Arquitetura Inadequada:** Forçar um `Nível 0 - CRUD Direto` em um módulo de Gestão Financeira.
4. **Acoplamento Core:** Criar dependência síncrona obrigatória de um serviço core (Nível 2) para um serviço periférico instável.

### Processo de Exceção ao Padrão:
Se for aprovada a necessidade de desviar do padrão por motivos temporais (prazo/POC):
- **Registro:** O PR deve ter uma ADR curta linkada.
- **Etiqueta:** O card/ticket ganha a etiqueta `TechDebt-Standard`.
- **Validade (Prazo):** A aprovação da exceção é sempre temporária (máx 90 dias) para retornar ao padrão.

---

## 3) Padrões de produto "sempre ligados" (MUST)
*(MUST = Obrigatório. Regras inegociáveis independentes do Nível, exigem ADR para qualquer desvio).*

Independente do nível, **sempre** cumprir:

### 3.1 API e contratos (MUST)
- **Versionamento Obrigado na URI:** `MUST`. O prefixo da URL deve ser obrigatoriamente configurado como `/api/v{X}/recurso` para APIs de entrada (Inbound). Não é permitido versionamento default por Headers (`Accept-Version`) se não houver ADR e justificativa extrema.
- **Problem Details (RFC 9457):** `MUST`. Respostas de falha estruturadas com `{ "type", "title", "status", "detail", "instance", "extensions.correlationId" }`. 
  - Erros 422 (banco/input) exigem `extensions.invalid_fields[]`.
- Status HTTP coerentes (200, 201, 202, 400, 401, 403, 404, 409, 422, 500).
- Validação de entrada **na borda** externa (shape validado).
- Padrão consolidado de paginação (Cursor-based) e filtro.

### 3.2 Segurança e dados
- Autenticação/autorização onde aplicável.
- **Nunca** logar PII/segredos *(nenhum dado sensível de usuário ou credenciais em `console.log` ou logs de sistema).*
- Segredos fora do repositório; scanner de secrets no CI *(ferramenta no pipeline que trava PRs caso detecte chaves/senhas hardcoded).*

### 3.3 Observabilidade (Traceability) e Trilha End-to-End
*(Rastreamento de ponta a ponta: permite filtrar facilmente todos os passos de uma requisição nos microserviços).*
- `correlationId` (Trace-ID) propagado: **MUST**. Todo Inbound request deve gerar ou acatar o Header `X-Correlation-ID`.
  - Log Estruturado deve associar `correlationId` na saída *(cada log gerado leva o carimbo do ID)*;
  - Resposta HTTP explícita deve devolver `X-Correlation-ID` *(facilita troubleshooting via Front-end)*;
  - Resiliência Outbound e filas Kafka/SQS devem propagar a chave `X-Correlation-ID` *(IDs viajam junto em integrações).*
- Logs estruturados mínimos (request, response, erro sem PII).
- Spans e traces básicos em I/O (DB, HTTP externo) sempre que disponível.

### 3.4 Banco e migrações
- Migrações versionadas.
- Sem `SELECT *` em rotas críticas.
- Gatilhos de CI para instalar/atualizar banco (fresh-install/upgrade) quando o projeto usa banco.

### 3.5 Engenharia (tooling/CI)
- Lint + typecheck + testes + build no CI.
- Convenções de nomes e organização de pastas conforme o monorepo.

---

## 3.6) Matriz Consolidada: O que é MUST / SHOULD por Nível

> **Legenda Rápida:**
> - **MUST:** Obrigatório. O não cumprimento reprova o PR.
> - **SHOULD:** Fortemente recomendado (boa prática). Permite desvio sem ADR documentada em cenários pragmaticamente justificados com bom senso da equipe.

| Prática \ Nível | Nível 0 (CRUD) | Nível 1 (Clean Leve) | Nível 2 (DDD Completo) |
| :- | :- | :- | :- |
| **Problem Details em Erros** | MUST | MUST | MUST |
| **Correlation ID (Logs & Trace)** | MUST | MUST | MUST |
| **Testes Unitários de Regra** | SHOULD (Opcional) | MUST | MUST |
| **Isolamento de Domínio (Portas)**| SHOULD (Somente HTTP) | MUST | MUST |
| **Uso de Value Objects (VOs)** | NÃO | SHOULD | MUST |
| **Eventos de Domínio (`domain_events`)**| NÃO | SHOULD | MUST |
| **Idempotência no Handler** | MUST (quando houver efeito colateral) | MUST (quando houver efeito colateral) | MUST (quando houver efeito colateral) |
| **Separação Command/Query (CQRS)**| NÃO | NÃO | SHOULD |

> Nota: **idempotência não é "por nível" — é por gatilho**. Se a operação causar efeito colateral relevante (financeiro, e-mail/notificação, mudança de workflow, integração outbound), o endpoint **deve** aceitar `Idempotency-Key` mesmo em Nível 0. O nível influencia *como* implementar (simplicidade), não *se* é obrigatório.

---

## 4) Decisão do nível (gatilhos de adoção)
*(Mapa de decisão estilo fluxograma. Se a realidade do problema bater com os gatilhos, a arquitetura equivalente é obrigatória).*

### 4.1 Matriz rápida (recomendação)
- **Use Nível 0** se TODOS forem verdadeiros:
  - não há invariantes relevantes além de validação de shape,
  - sem workflow/estados,
  - sem integrações externas relevantes,
  - baixa chance de virar core (ou é endpoint utilitário),
  - concorrência/consistência não é problema.

- **Use no mínimo Nível 1** se QUALQUER for verdadeiro:
  - existe regra de negócio não-trivial (ex.: impedimentos, limites simples),
  - precisa de **testes de regra** com mocks,
  - existe integração (provider, fila, webhook),
  - há mais de um endpoint alterando o mesmo recurso,
  - múltiplas fontes de dados/cache.

- **Use Nível 2** se DOIS OU MAIS forem verdadeiros:
  - workflow com estados (ex.: `draft → paid → shipped → cancelled`),
  - dinheiro, limites, penalidades, compliance, auditoria,
  - concorrência/consistência forte (idempotência, dedupe, locking),
  - invariantes cruzando coleções (ex.: soma de itens = total),
  - multi-tenant com regras por tenant,
  - regras complexas reaproveitadas por vários casos de uso.

### 4.2 Score (opcional, para decidir sem debate)
Atribua 1 ponto por item:
- estado/workflow
- dinheiro/limites/compliance
- concorrência/consistência
- integrações externas críticas
- multi-tenant/escopo por cliente
- regras cruzadas/reuso alto

**0–1:** Nível 0 ou 1 (preferir 1 se houver crescimento previsto)  
**2–3:** Nível 1  
**4+:** Nível 2

---

## 5) Nível 0 — CRUD Direto (simples e consistente)

### 5.1 Quando usar
- Endpoints simples e estáveis.
- Sem invariantes relevantes (além de validação de shape).
- Sem workflow.
- Regra de negócio mínima (ex.: "lista/pesquisa").

### 5.2 Características
- Controller/handler **fino**.
- Uma função "service/handler" contendo a regra mínima.
- Repositório/queries isolados (para não espalhar SQL/ORM).

### 5.3 Estrutura recomendada (exemplo)

#### API (`apps/api`)
```text
apps/api/src/modules/<module>/
  presentation/
    routes.ts
    controller.ts
    validator.ts
  application/
    handler.ts               # função simples (transaction script leve)
    dtos.ts
  infrastructure/db/
    queries.ts               # SQL/ORM aqui
```

#### Web (`apps/web`)
```text
apps/web/src/modules/<module>/
  ui/
    screens/
    components/
  data/
    api.ts                   # fetch/SDK; sem regra de negócio
    mappers.ts               # adaptação de shape
```

### 5.4 Exemplo de "handler" (esqueleto)
- Recebe DTO validado *(a função só lida com o formato correto; não faz validação estrutural).*
- Chama queries/repo *(isola SQL/ORM, comunicando-se direto com persistência).*
- Retorna DTO de saída *(filtra IDs internos e devolve apenas a casca agnóstica HTTP).*

### 5.5 Checklist de PR — Nível 0 (MUST)
*(Critérios rigorosos no Code Review focado na camada simples. Erros como "vazamento de SQL" levam a reprovação pontual).*

**Geral**
- [ ] Pastas conforme estrutura do módulo.
- [ ] Validação de entrada na borda.
- [ ] Erros padronizados.
- [ ] Logs/trace mínimo (correlationId).
- [ ] Sem vazamento de SQL/ORM no controller.

**API**
- [ ] `controller` sem regra de negócio (apenas tradução HTTP→DTO e chamada do handler).
- [ ] `queries` parametrizadas; sem `SELECT *` em rotas críticas.
- [ ] Teste mínimo: 1 teste do handler (ou do controller com mocks) em endpoint crítico.

**Web**
- [ ] `data/api.ts` sem regra; apenas IO.
- [ ] UI separada de data layer.

### 5.6 Como evoluir para Nível 1
- Extrair dependências (DB, HTTP externo) para uma "infra layer" consistente.
- Transformar handler em "use case" com contratos mais claros.

---

## 6) Nível 1 — Clean Leve (padrão default recomendado)

### 6.1 Quando usar
- Existe regra de negócio moderada.
- Precisa de testabilidade com mocks.
- Integrações externas aparecem.
- Evolução provável.

### 6.2 Características
- **Presentation**: controllers finos e agnósticos de framework quando possível.
- **Application**: use cases (transaction scripts) coordenando fluxos.
- **Infrastructure**: repositórios e gateways concretos.
- **Domain**: pode ser leve (types/VO essenciais), sem obrigatoriedade de agregados completos.

### 6.3 Estrutura recomendada (exemplo)

#### API (`apps/api`)
```text
apps/api/src/modules/<module>/
  domain/
    errors/
    value-objects/           # só quando agrega valor (Email, Money, Ids)
    types.ts                 # opcional
  application/
    use-cases/
      <use-case>.ts
    ports/
      <port>.ts              # interfaces: Repository, Gateway, Clock, EventBus
    dtos/
      <dtos>.ts
  infrastructure/
    db/
      repositories/
      mappers/
    clients/                 # gateways externos
  presentation/
    routes/
    controllers/
    validators/
    mappers/
```

#### Web (`apps/web`)
```text
apps/web/src/modules/<module>/
  ui/
    screens/
    components/
    forms/
  domain/                    # regras de UI (formatters/view-model)
    view-model.ts
  data/
    queries.ts               # fetch/SDK
    mappers.ts
```

### 6.4 Checklist de PR — Nível 1 (MUST)
**Geral**
- [ ] Dependências seguem: presentation → application → domain; infra → application/domain.
- [ ] Portas (interfaces) existem para dependências de I/O usadas pelo use case *(o uso de adapter injetado facilita mock em testes).*
- [ ] Erros padronizados e sem vazamento de PII.

**Application**
- [ ] Use case é o único lugar com orquestração (controller não decide) *(controller é apenas tradutor HTTP; saltos e if/else ocorrem no Use Case).*
- [ ] DTOs não são usados como entidades *(payload JSON temporário da web nunca trafega ao longo do core business).*
- [ ] Testes: pelo menos 1 teste por use case crítico (mocks das portas).

**Domain**
- [ ] VOs apenas quando fazem diferença (invariantes de valor) *(ex: criar `CNPJ` ao invés de string primariamente para auto-validação).*
- [ ] Regras essenciais não ficam "espalhadas" em controller/repo.

**Infrastructure**
- [ ] Repositórios implementam portas, não "inventam regra".
- [ ] Mapeamento domain↔persistência explicitado.

**Web**
- [ ] Data layer isolado e testável.
- [ ] Mappers definidos (evitar acoplamento UI↔API).

### 6.5 Como evoluir para Nível 2
- Identificar invariantes repetidas e colocar no domínio.
- Criar Aggregate Root quando há fronteira transacional clara.
- Movimentar regras de decisão para métodos do domínio.

---

## 7) Nível 2 — DDD-lite + Clean Completo (domínio protegido)

### 7.1 Quando usar
- Domínio é core do produto.
- Invariantes e consistência são críticas.
- Workflow/estados, concorrência, multi-tenant, dinheiro, auditoria.

### 7.2 Características
- Domínio rico: **Entidade + VO + Agregado + Invariantes**.
  - **Entidade:** Objeto com identidade única que transita estados.
  - **VO (Value Object):** Tipo imutável descrevendo propriedades ricas em vez de tipos primitivos.
  - **Agregado (Aggregate):** "Cluster" de entidades chefiados por uma Raiz que autoriza mutações internas.
  - **Invariantes:** Princípios vitais do negócio preservados estruturalmente contra transações inválidas.
- Use cases orquestram, domínio **decide**.
- Ports/adapters para todas dependências externas relevantes.
- Regras de consistência tratadas explicitamente (idempotência/dedupe, locks, transações).

### 7.3 Estrutura recomendada (exemplo)

#### API (`apps/api`)
```text
apps/api/src/modules/<module>/
  domain/
    aggregates/
      <aggregate-root>.ts
    entities/
    value-objects/
    domain-services/
    domain-events/           # opcional
    policies/                # regras que variam por estratégia (opcional)
    errors/
  application/
    use-cases/
    ports/
    dtos/
    mappers/                 # mapeia DTO↔Domain (quando necessário)
  infrastructure/
    db/
      repositories/
      mappers/
      unit-of-work/          # opcional
    messaging/
    clients/                 # gateways externos
  presentation/
    controllers/
    routes/
    validators/
    mappers/
```

#### Web (`apps/web`) — opcionalmente "nível 2 de UI"
```text
apps/web/src/modules/<module>/
  ui/
    screens/
    components/
    forms/
  domain/
    state-machine.ts         # workflow de UI, quando há
    rules.ts                 # regras de habilitar/desabilitar, etc.
    view-model.ts
  data/
    commands.ts              # mutações (POST/PATCH)
    queries.ts               # leituras
    mappers.ts
```

### 7.4 Checklist de PR — Nível 2 (MUST)
**Domain**
- [ ] Invariantes estão no domínio (factory/constructor/métodos), não no use case.
- [ ] Aggregate Root é a única porta de mutação do agregado.
- [ ] VOs são imutáveis e validados ao criar.
- [ ] Regras variáveis (descontos, políticas) usam Strategy/Policy quando apropriado.
- [ ] Testes de domínio: cobrindo invariantes e transições de estado.

**Application**
- [ ] Use cases não reimplementam regra do domínio.
- [ ] Portas definidas para repositórios/gateways/clock/eventbus.
- [ ] Tratamento explícito de concorrência: idempotência, dedupe, lock, transação conforme necessidade.
- [ ] Testes de use case: sucesso + falhas de negócio + falhas infra (mocks).

**Infrastructure**
- [ ] Repositórios respeitam fronteira do agregado (carrega/salva root).
- [ ] Mappers estão consistentes (persistência↔domínio).
- [ ] Observabilidade em chamadas externas e DB.
- [ ] Migrações e constraints garantem invariantes estruturais (unique/check/not null) quando aplicável.

**Presentation**
- [ ] Controller/validator fazem só borda: shape/auth → DTO.
- [ ] Erros de domínio mapeados para Problem Details sem expor detalhes sensíveis.

**Web**
- [ ] Workflows complexos têm state-machine/regras isoladas em `domain/`.
- [ ] Commands/queries separados (quando necessário).

### 7.5 Como "reduzir" sem perder padrão
Se um módulo ficou "pesado demais":
- manter camadas e contratos,
- simplificar domínio (apenas invariantes reais),
- remover abstrações sem múltiplas implementações (interfaces "por esporte").

---

## 8) Exemplos rápidos: "módulo mínimo" por nível (API)

### 8.1 Nível 0 — `ListCustomers`
- `controller.ts` chama `handler.ts`
- `handler.ts` chama `queries.ts`

### 8.2 Nível 1 — `CreateCustomer`
- `controller.ts` valida + chama `CreateCustomerUseCase`
- `CreateCustomerUseCase` usa `CustomerRepository` (port)
- `PrismaCustomerRepository` (infra) implementa port
- `Email` (VO) valida e normaliza, se necessário

### 8.3 Nível 2 — `PlaceOrder`
- `Order` (Aggregate Root) controla transições e invariantes
- `PlaceOrderUseCase` orquestra:
  - carregar `Order`/`Customer`
  - chamar `order.place(...)`
  - persistir agregado
  - publicar evento
  - idempotência/dedupe quando necessário

---

## 9) Regras anti-burocracia (SHOULD)

- **Não criar interface** se não houver:
  - teste que precisa de mock **ou**
  - mais de uma implementação prevista.
- **Não criar VO** se não houver:
  - validação/invariante real **ou**
  - normalização significativa.
- **Não criar Aggregate** se não houver:
  - fronteira transacional clara (consistência/estado).
- **Não duplicar mapeamentos** sem necessidade:
  - DTO↔Domain↔DTO somente quando houver domínio relevante.

---

## 9.1) Anti-exemplos Típicos por Nível (O que NÃO fazer)
> Referência para evitar over-engineering ou under-engineering.

- **N0 (CRUD) Anti-exemplo:** Criar uma pasta `domain/entities`, `domain/value_objects` e `application/ports` para um endpoint que apenas altera um campo `nome` na tabela de Categorias.
- **N1 (Clean Leve) Anti-exemplo:** Escrever 500 linhas de IF/ELSE de regra de negócios com cálculo de impostos dentro do `controller.ts` ou de um arquivo genérico `utils.ts`, impossibilitando testes mockados.
- **N2 (DDD Completo) Anti-exemplo:** Permitir que o framework ORM vaze anotações do banco de dados (ex: `@Column()`) para dentro da Raiz de Agregação (Aggregate Root) no módulo core financeiro.

---

## 10) Checklist único (para templates e auditoria)

### Itens que DEVEM existir no repositório (MUST)

| Padrão | Gate do CI Correspondente | Referência |
| :- | :- | :- |
| Identificação (ID) Rastreável no PR | Script `verify-contract-ids.js` ou Regex Bash | EX-CI-007 |
| Conformidade com OpenAPI/Versionamento/Problem Details | Linter *Spectral* OpenAPI (`npx spectral`) | EX-CI-006 |
| Garantia de Migrações Idempotentes e Integridade Tenant | Analisador `db-lint.ts` e *Dry-run* isolado | EX-CI-005 |
| Validação de Idempotência Criptográfica de Métodos Mutáveis | ESLint customizado com warnings/errors L1 e L2 | EX-CI-004 |
| Scan de Dependências e Pinning Seguros | Analisadores *Npm Audit* Strict / *Trivy* / *Dependabot* | EX-CI-003 |

---

## 11) Anexo — "Carimbo" do nível por módulo

Para facilitar auditoria e regras do `Definition of Done` (DoD), cada módulo declara o seu nível:
- **Novos Módulos (MUST)**: `apps/api/src/modules/<module>/ARCH_LEVEL.md` contendo: `LEVEL: 0|1|2` e justificativa (gatilhos correspondentes). Este arquivo deve ser gerado automaticamente pela ferramenta de Scaffold (`npx scaffold generate module`).
- **Módulos Legados (MAY)**: Recomenda-se adicionar iterativamente conforme touch-it-improve-it.
