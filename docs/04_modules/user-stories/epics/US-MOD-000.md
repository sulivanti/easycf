# US-MOD-000 — Governança de Documentos Normativos para Geração Automática de Código

**Status:** `APPROVED`
**Versão:** 0.5.0
**Data:** 2026-03-06
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Framework de Automação / Geradores)

## Metadados de Governança

- **estado_item:** APPROVED
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-06
- **rastreia_para:** DOC-DEV-001, DOC-GNP-00, DOC-ESC-001, DOC-GPA-001, DOC-ARC-001, DOC-ARC-002, DOC-ARC-003, DOC-UX-010, DOC-PADRAO-001, DOC-PADRAO-002, DOC-PADRAO-004, DOC-PADRAO-005
- **evidencias:** N/A (Aguardando PRs das sub-histórias)

---

## 1. Contexto e Problema

Hoje temos um conjunto de **documentos normativos** que definem padrões obrigatórios de arquitetura, contratos, observabilidade, testes, execução e até o **contrato de agentes** — mas sem uma User Story canônica que **amarre** esses documentos como **fonte de verdade** para a geração automática de código.

Isso cria risco de:

- geradores divergirem dos padrões e produzirem "boilerplate inconsistente";
- PRs com rotas/erros/headers fora do padrão;
- perda de rastreabilidade ponta a ponta (UI → API → Domain → DB);
- testes e CI não refletirem o que é normativo;
- novos desenvolvedores e agentes COD atuando sem guardrails formais documentados.

---

## 2. A Solução (Linguagem de Negócio)

Como **time de produto e engenharia**, queremos que o framework de geração automática de código **reconheça, aplique e valide** os documentos normativos como "lei do projeto", garantindo que tudo que for scaffoldado/gerado já nasça:

- com contratos e padrões obrigatórios (OpenAPI, correlation id, RFC 9457, idempotência),
- com estratégia de testes e gates de CI alinhados,
- com rastreabilidade end-to-end,
- e com governança de arquitetura por nível (0/1/2) quando aplicável.

### Documentos normativos cobertos por esta story (fonte de verdade)

| Código | Documento | Papel no Épico |
| --- | --- | --- |
| DOC-DEV-001 | Especificação Executável / Golden Path | Base normativa principal; define DoR/DoD, estados de item e rastreabilidade |
| DOC-GNP-00 | Guia Normativo e Padrões | Regras MUST/SHOULD/MAY; DX, CLI/scaffolding, boilerplate obrigatório |
| DOC-ESC-001 | Escala de Arquitetura 0/1/2 | Gate de complexidade; nivela decisões arquiteturais e gatilhos de ADR |
| DOC-GPA-001 | Guia Padrão de Agente | Contrato de agentes COD/DEV; saídas estruturadas e validações mínimas |
| DOC-ARC-001 | Padrões OpenAPI/Swagger | OpenAPI como fonte de verdade do contrato HTTP; Spectral lint |
| DOC-ARC-002 | Estratégia de Testes | Pirâmide de testes; cobertura mínima; testes de contrato |
| DOC-ARC-003 | Ponte de Rastreabilidade UI ↔ API ↔ Domain | Ligação operationId ↔ action UI ↔ correlation_id ↔ domain_event |
| DOC-UX-010 | Catálogo de Ações/Telemetria de UI | Actions de UI mapeadas para operationIds |
| DOC-PADRAO-001 | Infraestrutura e Execução | Docker/Node/pnpm; fail-fast de envs |
| DOC-PADRAO-002 | Dependências NodeJS | Versões e libs permitidas |
| DOC-PADRAO-004 | Variáveis de Ambiente | Padrão de validação em boot |
| DOC-PADRAO-005 | Armazenamento em Storage | Uploads via presigned URLs universalizadas |
| DOC-UX-011 | Padrões de Application Shell e Navegação | Regras mandatórias para Sidebar, Header, Breadcrumbs e Dashboard Pós-Login do Frontend gerado. |
| DOC-UX-012 | Componentes Globais e Feedback | Regras mandatórias de Busca Global, Preferences e interceptação Global de Erros via RFC 9457 para Toasts do Frontend. |

---

## 3. Escopo

### Inclui

- Estabelecer o contrato normativo que **todos os geradores/agentes COD** devem seguir ao scaffoldar módulos.
- Definir como os documentos normativos são consumidos como "fonte de verdade" pelo framework.
- Garantir que a saída do scaffolding seja automaticamente conforme: contratos HTTP, observabilidade (correlation id), tratamento de erros (RFC 9457), idempotência, estratégia de testes e CI/CD gates.
- Definir o ciclo de aprovação em cascata (este épico → sub-histórias individuais).
- Servir como **índice navegável** das sub-histórias F01–F09.

### Não inclui (Fora de Escopo)

- Implementação de lógica de negócio de nenhuma das sub-histórias F01–F16 (cada uma possui sua própria US detalhada).
- Construção, controle estrutural e arquitetura base da Interface do Usuário (UI/Shell) como Breadcrumbs, Layout do Menu, Dashboard Inicial, e Componentes Globais de Feedback Visual/Modais (esses temas são agora estritamente governados pelos normativos **DOC-UX-011** e **DOC-UX-012**).
- Criação de novas regras normativas ou alteração dos documentos normativos referenciados (essas mudanças devem ser tratadas diretamente nos respectivos documentos com ADR).
- Geração de código de produção diretamente a partir desta US (este é o épico balizador; o código resulta das sub-histórias aprovadas).
- Definição de infraestrutura de CI/CD fora do que já está especificado em DOC-ARC-002 e DOC-GNP-00.

### Fora de Escopo por Agora (Roadmap Futuro)

- Integração de lint automático de documentos normativos em cada PR | Gatilho: quando o time atingir 3+ módulos em produção.
- Dashboard de cobertura normativa (% de endpoints conformes com OpenAPI/Spectral) | Gatilho: pós-MVP.

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Governança de documentos normativos no framework de geração de código

  Cenário: Documentos normativos são tratados como fonte canônica pelo framework
    Dado que os documentos normativos do projeto estão disponíveis e versionados no repositório
    Quando eu executar a automação de scaffolding/geração de um novo módulo ou feature
    Então o gerador DEVE aplicar as regras do DOC-DEV-001 e do DOC-GNP-00 como base obrigatória
    E DEVE considerar os gatilhos de nível arquitetural definidos no DOC-ESC-001
    E DEVE seguir o contrato de agentes e validações conforme DOC-GPA-001

  Cenário: Contrato de API gerado segue o padrão OpenAPI e rastreabilidade
    Dado que um endpoint é gerado/criado pelo framework
    Quando eu revisar o OpenAPI versionado do projeto
    Então cada operação DEVE ter operationId único e estável e paths sob /api/v{X}
    E a operação DEVE declarar e propagar X-Correlation-ID
    E erros DEVE(M) usar Problem Details (RFC 9457) com correlationId
    E operações de escrita com efeito colateral DEVEM suportar Idempotency-Key quando aplicável

  Cenário: Rastreabilidade end-to-end e telemetria de UI ficam coerentes com backend
    Dado que uma action de UI foi selecionada no catálogo de ações
    Quando ela dispara uma operação na API
    Então a action DEVE mapear para 1+ operationIds estáveis
    E o correlation_id DEVE ser propagado até os eventos de domínio persistidos
    E fluxos de import/export/print em massa DEVEM seguir padrão job assíncrono

  Cenário: Testes e gates de CI refletem os normativos
    Dado que o framework gerou um módulo/feature com rotas e regras
    Quando eu executar o pipeline de CI
    Então deve existir cobertura mínima alinhada à estratégia de testes (unit/integration/contract)
    E o CI DEVE falhar se OpenAPI estiver inconsistente
    E o CI DEVE falhar se contratos/headers/erros obrigatórios estiverem fora do padrão

  Cenário: Padrões de execução, dependências e configuração são respeitados
    Dado que o projeto é executado localmente via containers
    Quando eu subir o ambiente e executar a aplicação
    Então runtime/pacotes/estrutura DEVEM seguir os padrões definidos (Node/Docker/pnpm/workspaces)
    E variáveis de ambiente DEVEM ser validadas em boot (fail-fast) conforme padrão

  Cenário: Agente COD respeita o ciclo de aprovação em cascata
    Dado que esta US-MOD-000 está com Status diferente de "aprovada"
    Quando um agente COD ou automação tentar executar scaffold-module ou create-amendment em qualquer sub-história
    Então a automação DEVE ser bloqueada com mensagem de erro clara
    E DEVE indicar que a aprovação do épico é pré-requisito obrigatório
```

---

## 5. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

Este épico sai de `RASCUNHO` / `REFINING` e vai para a fila de aprovação **SE E SOMENTE SE**:

- [ ] Owner claro definido (arquitetura).
- [ ] Todos os documentos normativos referenciados estão **versionados e acessíveis** em `docs/01_normativos/`.
- [ ] Cenários Gherkin cobrem os fluxos críticos de governança (seção 4 acima).
- [ ] Tabela de sub-histórias (seção 7) está completa com links e status iniciais.
- [ ] Não existem `PENDENTE-XXX` críticos em aberto (ver seção 9).
- [x] ADRs documentadas para qualquer divergência de padrão conhecida. *(N/A - Sem divergências no momento)*

---

## 6. Definition of Done (DoD) — Para o Épico ser Considerado Concluído

O épico US-MOD-000 é considerado **concluído** quando:

- [ ] Todas as sub-histórias F01–F10 e F12 foram individualmente **aprovadas e tiveram seu código scaffoldado** sem violações normativas registradas no CI.
- [ ] O pipeline CI está verde (Spectral lint, contract tests, cobertura de testes).
- [ ] OpenAPI versionado está sincronizado e validado para todos os endpoints gerados pelas sub-histórias.
- [ ] ADRs documentadas para toda fuga dos padrões definidos em DOC-GNP-00 ou DOC-ESC-001.
- [ ] Evidências documentais atualizadas neste arquivo (links de PR, evidências de testes).

---

## 7. Regras Críticas / Restrições Especiais

1. **Proibido "inventar padrão" fora dos normativos**: qualquer divergência relevante exige ADR conforme governança (níveis/padrões) e o Golden Path do DOC-DEV-001/DOC-ESC-001.
2. **Padrões obrigatórios sempre ligados** (contrato, observabilidade, segurança, etc.) devem ser gerados prontos e consistentes.
3. **OpenAPI é fonte de verdade do contrato HTTP** e precisa ficar sincronizado na mesma mudança.
4. **Traceability end-to-end**: correlation id e ponte UI/API/Domain não são opcionais.
5. **Estratégia de testes**: unit sem I/O; integração com DB real efêmero; contract test contra OpenAPI.
6. **Contrato de agentes**: saídas estruturadas/parseáveis e validações mínimas conforme padrão DOC-GPA-001.
7. **Execução/config**: padrões de Docker/Node/pnpm e validação fail-fast de envs são obrigatórios.
8. **Edições manuais proibidas em artefatos gerados por automação**: toda alteração em `04_modules/` deve passar pelas skills `scaffold-module` ou `create-amendment`.
9. **Redis**: usar apenas como broker de filas (BullMQ) e mecanismos efêmeros (rate limiting, idempotency locks). Proibido como banco primário ou pub/sub.
10. **Soft-delete obrigatório**: hard deletes diretos são proibidos em dados faturáveis/auditáveis sem acionar `deleted_at`.
11. **Padrão de Idempotência:** Toda rota de mutação (`POST`, `PUT`, `PATCH`) documentada com exigência de `Idempotency-Key` DEVE obrigatoriamente utilizar o middleware central de idempotência do framework (`@easycf/core-api/idempotency`), que utiliza Redis para TTL e cache da resposta. É estritamente proibido que os módulos implementem lógicas de idempotência exclusivas dentro de seus controllers ou services.
12. **Taxonomia Canônica (`codigo`) e Status:** Toda entidade primária deve adotar explicitamente a nomenclatura `codigo` para seu identificador amigável (único, alfanumérico). Além disso, entidades de negócio usam um enum textual (`ACTIVE`, `BLOCKED`, `INACTIVE`) para descrever seu estado. Entidades efêmeras (como `user_sessions`) devem usar um campo booleano, ex: `isRevoked`, evitando confusão com lógicas de entidades primárias.

---

## 8. OKRs / Métricas de Sucesso

> **Objetivo:** Garantir que o framework de geração de código produza artefatos 100% conformes com os normativos do projeto.

| # | Métrica | Baseline | Alvo | Data |
| --- | --- | --- | --- | --- |
| OKR-1 | % de endpoints gerados com OpenAPI + operationId + correlation_id | 0% | 100% | Ao final de cada sprint de scaffolding |
| OKR-2 | % de sub-histórias (F01–F16) aprovadas sem violação CI normativa | 0% | 100% | Conclusão do épico |
| OKR-3 | Tempo de detecção de divergência normativa (CI gate) | Manual (~dias) | Automático (<5 min no pipeline) | Pós CI configurado |
| OKR-4 | Nº de ADRs abertas por divergência de padrão não documentada | N/A | 0 abertas sem responsável e prazo | Ao final do épico |

- **estado_item:** READY

---

## 9. Sub-Histórias do MOD-000 (Épico)

Esta US é o **épico balizador** do módulo Foundation. As funcionalidades concretas são detalhadas nas sub-histórias abaixo, localizadas na pasta `../features/`:

```text
US-MOD-000  (este arquivo) ← Épico / Governança / Índice
  ├── US-MOD-000-F01  ← Autenticação Nativa (Login, Logout, Sessões, Kill-Switch, Refresh)
  ├── US-MOD-000-F02  ← MFA / TOTP (Google Authenticator, Authy — RFC 6238)
  ├── US-MOD-000-F03  ← SSO OAuth2 (Google + Microsoft / Azure AD)
  ├── US-MOD-000-F04  ← Recuperação de Senha (Forgot / Reset — token UUID, TTL 1h)
  ├── US-MOD-000-F05  ← Gestão de Usuários (CRUD + Soft Delete + Auto-Registro)
  ├── US-MOD-000-F06  ← Roles / RBAC por Escopos (módulo:recurso:ação + cache Redis)
  ├── US-MOD-000-F07  ← Filiais Multi-Tenant (CRUD + Soft Delete + Bloqueio)
  ├── US-MOD-000-F08  ← Perfil do Usuário Autenticado (/auth/me + edição)
  ├── US-MOD-000-F09  ← Vinculação Usuário-Filial com Role (tenant_users + RBAC completo)
  ├── US-MOD-000-F10  ← Alteração de Senha Autenticada (Minha Conta → /auth/change-password)
  ├── US-MOD-000-F11  ← Endpoint GET /info (Versão e Metadados do Sistema)
  ├── US-MOD-000-F12  ← Catálogo de Permissões — CRUD de escopos pré-definidos (integridade referencial RBAC)
  ├── US-MOD-000-F13  ← Utilitário de Telemetria UI (UIActionEnvelope)
  ├── US-MOD-000-F14  ← Middlewares de Correlação E2E (CorrelationId Middleware)
  ├── US-MOD-000-F15  ← Motor de Gates de Pipeline CI (Screen Manifests Validator)
  └── US-MOD-000-F16  ← Módulo de Storage e Upload Centralizado (Presigned URLs)
```

| Sub-História | Tema | Status | Owner |
| --- | --- | --- | --- |
| [US-MOD-000-F01](../features/US-MOD-000-F01.md) | Autenticação nativa + gerenciamento de sessões | `READY` | arquitetura |
| [US-MOD-000-F02](../features/US-MOD-000-F02.md) | MFA / TOTP (RFC 6238) | `READY` | arquitetura |
| [US-MOD-000-F03](../features/US-MOD-000-F03.md) | SSO OAuth2 — Google + Microsoft | `READY` | arquitetura |
| [US-MOD-000-F04](../features/US-MOD-000-F04.md) | Recuperação de senha por e-mail | `READY` | arquitetura |
| [US-MOD-000-F05](../features/US-MOD-000-F05.md) | Gestão de usuários (CRUD + soft delete) | `READY` | arquitetura |
| [US-MOD-000-F06](../features/US-MOD-000-F06.md) | Roles / RBAC por escopos + cache Redis | `READY` | arquitetura |
| [US-MOD-000-F07](../features/US-MOD-000-F07.md) | Filiais multi-tenant (CRUD + soft delete) | `READY` | arquitetura |
| [US-MOD-000-F08](../features/US-MOD-000-F08.md) | Perfil do usuário autenticado | `READY` | arquitetura |
| [US-MOD-000-F09](../features/US-MOD-000-F09.md) | Vinculação usuário-filial com role | `READY` | arquitetura |
| [US-MOD-000-F10](../features/US-MOD-000-F10.md) | Alteração de Senha Autenticada (Minha Conta) | `READY` | arquitetura |
| [US-MOD-000-F11](../features/US-MOD-000-F11.md) | Endpoint GET /info (Versão e Metadados do Sistema) | `READY` | arquitetura |
| [US-MOD-000-F12](../features/US-MOD-000-F12.md) | Catálogo de Permissões — CRUD de escopos (integridade referencial RBAC) | `READY` | arquitetura |
| [US-MOD-000-F13](../features/US-MOD-000-F13.md) | Utilitário de Telemetria UI (UIActionEnvelope) | `READY` | arquitetura |
| [US-MOD-000-F14](../features/US-MOD-000-F14.md) | Middlewares de Correlação E2E (CorrelationId Middleware) | `READY` | arquitetura |
| [US-MOD-000-F15](../features/US-MOD-000-F15.md) | Motor de Gates de Pipeline CI (Screen Manifests Validator) | `READY` | arquitetura |
| [US-MOD-000-F16](../features/US-MOD-000-F16.md) | Módulo de Storage e Upload Centralizado | `READY` | arquitetura |

> 📌 **Regra de aprovação em cascata:** Esta US-MOD-000 deve ser aprovada **antes** de qualquer sub-história. Cada sub-história F01–F16 deve ser aprovada individualmente antes de ter seu código scaffoldado ou alterado por automação.

---

Nenhuma pendência estrutural em aberto (Nível arquitetural 2 consolidado e owner = arquitetura).

---

## 11. CHANGELOG do Épico

| Versão | Data | Responsável | Descrição |
| --- | --- | --- | --- |
| 0.7.1 | 2026-03-08 | arquitetura | Promoção de US-MOD-000-F02 (MFA / TOTP) para READY. |
| 0.7.0 | 2026-03-08 | arquitetura | Promoção de US-MOD-000-F02 (MFA / TOTP) para REFINING. |
| 0.6.0 | 2026-03-06 | arquitetura | Inclusão do DOC-PADRAO-005 e criação oficial da US-MOD-000-F16 (Storage e Upload Centralizado). |
| 0.5.0 | 2026-03-06 | arquitetura | Adição das features de Telemetria (F13), Correlação E2E (F14) e Script CI (F15) mapeando gaps das US-044/047 |
| 0.4.0 | 2026-03-06 | arquitetura | Adição de US-MOD-000-F12 (Catálogo de Permissões): gap US-013 — CRUD de escopos pré-definidos, validação semântica no F06, integridade referencial RBAC |
| 0.3.0 | 2026-03-06 | arquitetura | Adição de US-MOD-000-F10 (Alteração de Senha Autenticada): gap identificado em F08 — endpoint `/auth/change-password`, revogação de sessões, gate `force_pwd_reset` |
| 0.2.0 | 2026-03-06 | arquitetura | Enriquecimento: metadados de governança, escopo/não-escopo, DoR/DoD, OKRs, tabela de normativos, coluna Owner nas sub-histórias, seção de Pendentes e novo Cenário Gherkin de aprovação cascata |
| 0.1.0 | 2026-03-05 | Produto + Arquitetura | Criação inicial do épico |

---

> ⚠️ **Atenção:** As automações de arquitetura (`scaffold-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
