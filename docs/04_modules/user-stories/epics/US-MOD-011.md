# US-MOD-011 — SmartGrid: Componente de Grade com Edição em Massa (Épico)

**Status Ágil:** `READY`
**Versão:** 1.2.0
**Data:** 2026-03-24
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-011** (SmartGrid)
**Épico de Negócio:** EP-SGR
**Origem:** Reescrita e incorporação de US-SGR-001 a US-SGR-006

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-24
- **rastreia_para:** SmartGrid-SPEC-v1.0, US-MOD-007, US-MOD-007-F03, DOC-UX-011, DOC-UX-012, DOC-ARC-001, DOC-ARC-003
- **nivel_arquitetura:** 1 (UX — consome MOD-007 como fornecedor de regras)
- **evidencias:** N/A

---

## 1. Contexto e Problema

Operações em massa (inclusão, alteração e exclusão de múltiplos registros) precisam de uma interface de grade editável que respeite as regras de negócio configuradas no MOD-007 (campos visíveis, obrigatórios, defaults, domínios e validações). Sem o SmartGrid, cada módulo precisaria implementar sua própria grade com lógica de validação duplicada.

> **MOD-011 não contém regras de negócio. Ele consome o motor do MOD-007.**

```
OPERAÇÃO (context_framer, tipo=OPERACAO)
    │
    ▼ (configurada no MOD-007 via UX-ROTINA-001)
ROTINA DE COMPORTAMENTO (behavior_routine + routine_items)
    │
    ▼ POST /api/v1/routine-engine/evaluate ← chamado 1 objeto por vez
RESPOSTA DO MOTOR
    { visible_fields, required_fields, defaults,
      domain_restrictions, validations, blocking_validations }
    │
    ▼
SmartGrid (MOD-011) — interpreta e renderiza
    grade editável com status visual por linha
```

---

## 2. Alinhamento de Nomenclatura — SGR vs. ECF

| Termo original (SmartGrid) | Termo ECF (usar em código) | Módulo |
|---|---|---|
| "Operação" | `context_framer` (tipo `OPERACAO`) | MOD-007 |
| "Regras da Operação" | `routine_items` | MOD-007 |
| "Rotina" (tela de negócio) | `target_object` | MOD-007 |
| "Validar linha" | `POST /routine-engine/evaluate` (1 registro) | MOD-007-F03 |
| "Status bloqueante" | `routine_items.is_blocking=true` | MOD-007 |
| "Exclusão lógica" | `deleted_at + status=INACTIVE` (padrão universal) | MOD-000 |

---

## 3. Decisões Arquiteturais

- **Motor chamado 1 objeto por vez** — sem endpoint batch (consistente com MOD-007 v1)
- **Sem rascunho no servidor** — persistência intermediária via Export/Import JSON (client-side)
- **Configuração de Operações → MOD-007** — UX-ROTINA-001 já existe, sem duplicação

---

## 4. Pendências Abertas

| ID | Pendência | Impacto |
|---|---|---|
| **PEND-SGR-01** | Contrato de mapeamento resultado do motor → estado visual da linha | ✅ RESOLVIDA (2026-03-15) |
| **PEND-SGR-02** | `current_record_state` no motor MOD-007-F03 para avaliar estado do registro | ✅ RESOLVIDA (2026-03-15) |

---

## 5. Escopo

### Inclui

- Componente de grade editável com inclusão, alteração e exclusão em massa
- Integração com `routine-engine/evaluate` por linha (um objeto por vez)
- Validação visual por linha com estados ✅ ❌ ⚠️
- Ações em massa sobre linhas selecionadas (aplicar valor, limpar coluna, duplicar)
- Export/Import de estado em JSON (client-side, sem servidor)
- UX: Grade de Inclusão em Massa (UX-SGR-001)
- UX: Formulário de Alteração de Registro (UX-SGR-002)
- UX: Grade de Exclusão em Massa (UX-SGR-003)
- Amendment no MOD-007: suporte ao contexto de `current_record_state` no motor (PEND-SGR-02)

### Não inclui

- Configuração de Operações — permanece no MOD-007 (UX-ROTINA-001)
- Persistência de rascunhos no servidor
- Endpoint batch de validação
- Criação de novas tabelas de banco de dados (MOD-011 é UX puro)

---

## 6. Critérios de Aceite (Épico)

```gherkin
Funcionalidade: Épico SmartGrid MOD-011

  Cenário: Grade usa motor do MOD-007 — sem regras de negócio próprias
    Dado que o SmartGrid é aberto para a Operação "COMPRA-SERVICO"
    Quando o componente é inicializado
    Então POST /routine-engine/evaluate é chamado com { framer_id: "COMPRA-SERVICO" }
    E a grade renderiza apenas os campos retornados em visible_fields
    E campos em required_fields têm indicador visual obrigatório

  Cenário: Validação chama motor por linha — nunca em lote
    Dado que a grade tem 10 linhas preenchidas
    Quando usuário aciona "Validar"
    Então POST /routine-engine/evaluate é chamado 10 vezes — 1 por linha
    E cada linha recebe status visual: ✅ válida | ❌ inválida (blocking) | ⚠️ alerta

  Cenário: Sub-histórias bloqueadas sem aprovação do épico
    Dado que US-MOD-011 está diferente de "APPROVED"
    Então forge-module para qualquer feature é bloqueado
```

---

## 7. Definition of Ready (DoR) ✅

- [x] Posição arquitetural definida: MOD-011 é UX consumidor do MOD-007
- [x] Nomenclatura SGR vs. ECF mapeada e documentada
- [x] Decisão sem rascunho no servidor documentada
- [x] Decisão motor 1 objeto por vez documentada
- [x] Pendências PEND-SGR-01 e PEND-SGR-02 registradas formalmente
- [x] Features F01–F05 com Gherkin completo
- [x] Screen Manifests UX-SGR-001, UX-SGR-002, UX-SGR-003 criados
- [x] Owner confirmar READY → APPROVED (2026-03-19)
- [x] PEND-SGR-02 resolvida (amendment MOD-007-F03) — RESOLVIDA 2026-03-15

## 8. Definition of Done (DoD)

- [ ] F01–F05 aprovadas e scaffoldadas
- [ ] Grade renderiza campos conforme retorno do motor MOD-007
- [ ] Validação por linha chama motor individualmente — testado
- [ ] Export JSON gera arquivo com estado completo da grade
- [ ] Import JSON restaura estado exatamente como exportado
- [ ] Ações em massa testadas: aplicar valor, limpar coluna, duplicar (1 linha)
- [ ] Alteração: campos editáveis = apenas os retornados em `visible_fields` não bloqueados

---

## 9. Sub-Histórias

```text
US-MOD-011
  ├── F01 ← API: Amendment MOD-007-F03 (context de estado do registro)
  ├── F02 ← UX: Grade de Inclusão em Massa (UX-SGR-001)
  ├── F03 ← UX: Formulário de Alteração de Registro (UX-SGR-002)
  ├── F04 ← UX: Grade de Exclusão em Massa (UX-SGR-003)
  └── F05 ← UX: Ações em Massa sobre Linhas (parte de UX-SGR-001)
```

| Feature | Tema | Tipo | Status |
|---|---|---|---|
| [US-MOD-011-F01](../features/US-MOD-011-F01.md) | Amendment: `current_record_state` no motor MOD-007 | Backend (amendment) | `APPROVED` |
| [US-MOD-011-F02](../features/US-MOD-011-F02.md) | UX Grade de Inclusão em Massa | UX | `APPROVED` |
| [US-MOD-011-F03](../features/US-MOD-011-F03.md) | UX Formulário de Alteração de Registro | UX | `APPROVED` |
| [US-MOD-011-F04](../features/US-MOD-011-F04.md) | UX Grade de Exclusão em Massa | UX | `APPROVED` |
| [US-MOD-011-F05](../features/US-MOD-011-F05.md) | UX Ações em Massa sobre Linhas | UX | `APPROVED` |

---

## 10. Dependências de Módulos

| Depende de | O que precisa | Status |
|---|---|---|
| MOD-007-F03 | `routine-engine/evaluate` — motor de avaliação | READY |
| MOD-007-F01 | `context_framers` com `framer_type=OPERACAO` | READY |
| MOD-007-F02 | `routine_items` (FIELD_VISIBILITY, REQUIRED, DEFAULT, DOMAIN, VALIDATION) | READY |
| MOD-000 | `domain_events` para log de alterações | READY |
| Amendment MOD-007-F03 | Suporte a `current_record_state` na avaliação | **PEND-SGR-02** |

---

## 11. Novos Escopos

O MOD-011 não cria novos escopos próprios. Usa os escopos já definidos no MOD-007:

| Escopo existente | Uso no SmartGrid |
|---|---|
| `param:engine:evaluate` | Cada chamada de validação de linha |
| `param:framer:read` | Carregar a Operação no mount da grade |

---

## 12. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Incorporação das US-SGR-001 a 006. UX consumidor do MOD-007. Pendências PEND-SGR-01/02. |
| 1.1.0 | 2026-03-19 | arquitetura | APPROVED. PEND-SGR-01/02 resolvidas. DoR completo. Aprovação com cascata F01-F05. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
