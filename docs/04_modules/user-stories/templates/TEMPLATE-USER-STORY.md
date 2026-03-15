# US-MOD-[ID] — [Nome Curto da Feature]

**Status Ágil:** `TODO` | `READY` | `IN_PROGRESS` | `DONE`
**Data:** YYYY-MM-DD
**Autor(es):** [Nome ou Squad]
**Módulo Destino:** [Ex: MOD-101]
**Referências Normativas:** [Ex: DOC-DEV-001, DOC-ARC-001, SEC-000-01]

## Metadados de Governança

- **status_agil:** [TODO, READY, IN_PROGRESS, DONE]
- **owner:** [Nome/Papel]
- **data_ultima_revisao:** YYYY-MM-DD
- **rastreia_para:** [Deve conter exaustivamente TUDO o que foi listado em Referências Normativas + o Épico Pai]
- **nivel_arquitetura:** [0, 1 ou 2]
- **referencias_exemplos:** N/A
- **evidencias:** *(adicionar links de PR/issue ao longo do refinamento)*
- **wave_entrega:** [Wave 1, Wave 2, etc.]
- **epico_pai:** [US-MOD-NNN]
- **manifests_vinculados:** [ux-xxx-nnn ou N/A]
- **pendencias:** [PENDENTE-XXX ou N/A]

---

## 1. Contexto e Problema

(Qual a dor atual? Por que estamos pedindo isso?)

## 2. A Solução (Linguagem de Negócio)

(Descreva como a funcionalidade deve se comportar na visão do usuário final).

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: [Nome]

Cenário: [Cenário de Sucesso]
  Dado ...
  Quando ...
  Então ...
```

## 4. Regras Críticas / Restrições Especiais

- Regra 1: ...
- Regra 2: ...

---

## 5. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

<!-- Atenção: Não marque as referências de contratos e normativos (DOC-*, INT-*) como concluídas [x] se o arquivo físico ainda não tiver sido efetivamente criado no repositório. O CI irá falhar. -->

- [ ] Owner definido.
- [ ] Cenários Gherkin revisados e aprovados.
- [ ] Contratos de Integração criados (se aplicável).
- [ ] Épico correspondente aprovado.

---
> ⚠️ **Atenção:** A automação de arquitetura (`forge-module`) **SÓ PODE SER EXECUTADA** se esta User Story estiver marcada com `status_agil: READY`.
