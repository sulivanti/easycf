# US-MOD-000 — Governança de Documentos Normativos para Geração Automática de Código

**Status:** `para aprovação`
**Data:** 2026-03-05
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Framework de Automação / Geradores)

---

## 1. Contexto e Problema

Hoje temos um conjunto de **documentos normativos** que definem padrões obrigatórios de arquitetura, contratos, observabilidade, testes, execução e até o **contrato de agentes** — mas sem uma User Story canônica que **amarre** esses documentos como **fonte de verdade** para a geração automática de código.

Isso cria risco de:

* geradores divergirem dos padrões e produzirem “boilerplate inconsistente”;
* PRs com rotas/erros/headers fora do padrão;
* perda de rastreabilidade ponta a ponta (UI → API → Domain → DB);
* testes e CI não refletirem o que é normativo.

---

## 2. A Solução (Linguagem de Negócio)

Como **time de produto e engenharia**, queremos que o framework de geração automática de código **reconheça, aplique e valide** os documentos normativos como “lei do projeto”, garantindo que tudo que for scaffoldado/gerado já nasça:

* com contratos e padrões obrigatórios (OpenAPI, correlation id, RFC 9457, idempotência),
* com estratégia de testes e gates de CI alinhados,
* com rastreabilidade end-to-end,
* e com governança de arquitetura por nível (0/1/2) quando aplicável.

Documentos normativos cobertos por esta story (fonte de verdade):

* DOC-DEV-001 (Especificação Executável / Golden Path)
* DOC-GNP-00 (Guia Normativo e Padrões)
* DOC-ESC-001 (Escala de Arquitetura 0/1/2)
* DOC-GPA-001 (Guia Padrão de Agente)
* DOC-ARC-001 (Padrões OpenAPI/Swagger)
* DOC-ARC-002 (Estratégia de Testes)
* DOC-ARC-003 (Ponte de Rastreabilidade UI ↔ API ↔ Domain)
* DOC-UX-010 (Catálogo de Ações/Telemetria de UI)
* DOC-PADRAO-001 (Infraestrutura e Execução)
* DOC-PADRAO-002 (Dependências NodeJS)
* DOC-PADRAO-004 (Variáveis de Ambiente)

---

## 3. Critérios de Aceite (Gherkin)

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
```

---

## 4. Regras Críticas / Restrições Especiais

1. **Proibido “inventar padrão” fora dos normativos**: qualquer divergência relevante exige ADR conforme governança (níveis/padrões) e o Golden Path do DOC-DEV-001/DOC-ESC-001.  
2. **Padrões obrigatórios sempre ligados** (contrato, observabilidade, segurança, etc.) devem ser gerados prontos e consistentes.
3. **OpenAPI é fonte de verdade do contrato HTTP** e precisa ficar sincronizado na mesma mudança.
4. **Traceability end-to-end**: correlation id e ponte UI/API/Domain não são opcionais.  
5. **Estratégia de testes**: unit sem I/O; integração com DB real efêmero; contract test contra OpenAPI.
6. **Contrato de agentes**: saídas estruturadas/parseáveis e validações mínimas conforme padrão.
7. **Execução/config**: padrões de Docker/Node/pnpm e validação fail-fast de envs são obrigatórios.

---

## 5. Sub-Histórias do MOD-000 (Épico)

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
  └── US-MOD-000-F09  ← Vinculação Usuário-Filial com Role (tenant_users + RBAC completo)
```

| Sub-História | Tema | Status |
| --- | --- | --- |
| [US-MOD-000-F01](../features/US-MOD-000-F01.md) | Autenticação nativa + gerenciamento de sessões | `para aprovação` |
| [US-MOD-000-F02](../features/US-MOD-000-F02.md) | MFA / TOTP (RFC 6238) | `para aprovação` |
| [US-MOD-000-F03](../features/US-MOD-000-F03.md) | SSO OAuth2 — Google + Microsoft | `para aprovação` |
| [US-MOD-000-F04](../features/US-MOD-000-F04.md) | Recuperação de senha por e-mail | `para aprovação` |
| [US-MOD-000-F05](../features/US-MOD-000-F05.md) | Gestão de usuários (CRUD + soft delete) | `para aprovação` |
| [US-MOD-000-F06](../features/US-MOD-000-F06.md) | Roles / RBAC por escopos + cache Redis | `para aprovação` |
| [US-MOD-000-F07](../features/US-MOD-000-F07.md) | Filiais multi-tenant (CRUD + soft delete) | `para aprovação` |
| [US-MOD-000-F08](../features/US-MOD-000-F08.md) | Perfil do usuário autenticado | `para aprovação` |
| [US-MOD-000-F09](../features/US-MOD-000-F09.md) | Vinculação usuário-filial com role | `para aprovação` |

> 📌 **Regra de aprovação em cascata:** Esta US-MOD-000 deve ser aprovada **antes** de qualquer sub-história. Cada sub-história F01–F09 deve ser aprovada individualmente antes de ter seu código scaffoldado ou alterado por automação.

---

> ⚠️ **Atenção:** As automações de arquitetura (`scaffold-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
