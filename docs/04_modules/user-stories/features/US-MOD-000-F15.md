# US-MOD-000-F15 — Motor de Gates de Pipeline CI (Screen Manifests Validator)

**Status:** `READY`
**Módulo Destino:** **MOD-000** (Foundation - CI/CD DevOps)
**Épico Pai:** [US-MOD-000](../epics/US-MOD-000.md)

### Metadados de Governança

- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-06
- **rastreia_para:** DOC-ARC-003 (§8 Gates de Validação em CI)

---

## 1. Contexto e Problema

A documentação arquitetural elegeu os "Screen Manifests" (`docs/05_manifests/screens/*.yaml`) como  a *Single Source of Truth* que amarram Telas do UI com endpoints da OpenAPI e Roles do Banco. Essa premissa teórica enfraquece se não houver um motor real (bot / runner de pipeline) forçando o programador a manter tudo sincronizado de forma declarativa sob pena de falhar o Build do Pull Request.

## 2. A Solução

Construir um CLI script (`validate-manifests.ts`) encarregado de rodar os 9 Gates cruéis definidos no `DOC-ARC-003 (§8)`. O Script atua como "Analista Técnico", abrindo o diretório inteiro de YAMLs de telas, localizando as chamadas do catálogo de actions e batendo conta contra os Specs oficiais de permissões e do OpenAPI.

## 3. Escopo

### Inclui

- O gerador de script NodeJS para Command Line Interface.
- Validação (Gate 1): Checar schema do YAML contra JsonSchema (`docs/05_manifests/schemas/screen-manifest.v1.schema.json`).
- Validação (Gate 4): Varredura buscando os `operation_ids` das tabelas de frente cruzando com o arquivo OpenAPI oficial da API.
- Validação (Gate 3): Garantir que as Permissions (`users:read`, `export:download`) listadas nos fronts existam materialmente na infra DB.
- Validação (Gate 7): Auditoria de Erros (Validar mapeamento obrigatorio de Error RFC9457).
- Workflow mínimo `.github/workflows/manifest-gate.yml` ou análogo aplicável demonstrando setup do gate de falha de CI.

### Não inclui

- A fixação de erros encontrados no próprio script (as correções deverão sempre ser braçais pelo dev que codou errado).

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Motor Dedo-Duro de Inconsistências de UI x API

  Cenário: O dev remove um endpoint da API mas o manifesto da Tela ainda o aponta
    Dado um manifesto UX-XXX querendo rodar action "create" para o ID "users_new"
    E "users_new" não existe na rota do Swagger (OpenAPI)
    Quando roda a validação do Pipeline
    Então o Job DEVE falhar com Exit Code 1
    E a mensagem clara: "Erro no Gate 4: O OperationID users_new mapeado na tela UX-XXX não sobreviveu na BackEnd".
```

---

## 5. Definition of Ready (DoR) e Done (DoD)

*(Mesmas diretrizes globais do épico US-MOD-000)*

- **DoD Específico:** Entregar o command no script root do projeto rodando perfeitamente e capaz de validar uma pasta inteira.
