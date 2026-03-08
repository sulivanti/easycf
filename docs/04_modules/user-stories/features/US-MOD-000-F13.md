# US-MOD-000-F13 — Utilitário de Telemetria UI (UIActionEnvelope)

**Status:** `para aprovação`
**Módulo Destino:** **MOD-000** (Foundation - Frontend Tooling)
**Épico Pai:** [US-MOD-000](../epics/US-MOD-000.md)

### Metadados de Governança

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-06
- **rastreia_para:** DOC-ARC-003 (§2 O "Idioma Operacional" do Frontend)

---

## 1. Contexto e Problema

Conforme o normativo `DOC-ARC-003 (§2)`, a rastreabilidade do clique na UI até as tabelas de domínio do backend é garantida pelo contrato `UIActionEnvelope`.
Atualmente, essa estrutura existe apenas conceitualmente na documentação em markdown. Não há um pacote no projeto que o desenvolvedor Front-End possa importar para construir de forma segura e padronizada esses payloads de telemetria anexando o `correlation_id`.

## 2. A Solução

Criar um pacote compartilhado (`ui-telemetry` ou similar no workspace) que exiba para o Front-End a tipagem estrita de `UIActionEnvelope` definida no DOC-ARC-003, acompanhada de utilitários como `createAndEmitEnvelope(actionType, screenId, meta)`. Esse utilitário se encarrega de, transparentemente, ler ou gerar um `X-Correlation-ID` nativo e propagá-lo, assegurando homogeneidade (usando pattern adapters para Console, Sentry, Datadog ou REST longo).

## 3. Escopo

### Inclui

- Criação do pacote/workspace de utilitários `ui-telemetry`.
- Implementação estrita da interface de TS `UIActionEnvelope` e os enums de `status: "requested" | "succeeded" | "failed"`.
- Implementação de um UUIDv4 bootstrapper para preenchimento de `correlation_id` quando ausente.
- Um adapter mockado (ConsoleLogger) para visualização do payload em dev.
- Um adapter HTTP básico para evio da telemetria a um endpoint passivo.

### Não inclui

- Implementação ativa de integração real corporativa como Datadog RUM ou Sentry (neste primeiro momento focamos na geração e aderência do contrato padronizado E2E).

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Helper de Telemetria Front-End (UIActionEnvelope)

  Cenário: Dev Front-End emite uma ação padronizada do catálogo
    Dado que a tela importa o pacote de telemetria
    Quando o usuário clica num botão de "update" do DOC-UX-010
    E o front chama a lib `emitUIAction({ screen_id, action: 'update', operation_id: 'XXX' })`
    Então a lib DEVE gerar o contrato UIActionEnvelope perfeito
    E DEVE embutir um UUID automático em `correlation_id` se não providenciado
    E DEVE permitir extrair headers padronizados com o `X-Correlation-ID`

  Cenário: Adapters de Emissão
    Dado o envelope preenchido corretamente
    Quando ele for despachado (emit)
    Então o sistema de plugar adapters DEVE repassar a mensagem isoladamente (ex: Console) para que não trave a navegação
```

---

## 5. Definition of Ready (DoR) e Done (DoD)

*(Mesmas diretrizes globais do épico US-MOD-000)*

- **DoD Específico:** Existir `npm run test` local no pacote provando que o Payload bate *match* perfeito com a interface documentada no `DOC-ARC-003`.
