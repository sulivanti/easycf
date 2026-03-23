> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-19 | AGN-DEV-04  | Enriquecimento DATA — contrato client-side JSON, entidades consumidas, mapeamento response→grid |
> | 0.3.0  | 2026-03-19 | arquitetura | Adiciona §6 — campo target_endpoints no schema do context_framer tipo OPERACAO (PEND-SGR-04) |

# DATA-011 — Modelo de Dados do SmartGrid

- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-011, US-MOD-011-F02, US-MOD-011-F03, US-MOD-011-F04, BR-011, FR-011, FR-004, SEC-011
- **referencias_exemplos:** N/A
- **evidencias:** N/A

---

> **Nota arquitetural:** MOD-011 **não possui tabelas de banco de dados próprias**. É um consumidor puro de UX do MOD-007. Os dados transitam exclusivamente via chamadas ao motor `POST /routine-engine/evaluate` e persistência client-side (JSON export/import). Logs de alteração (F03) e exclusão (F04) são registrados via `domain_events` do módulo destino do registro editado (padrão MOD-000).

---

## 1. Modelo de Dados — Tabelas Próprias

**Nenhuma tabela própria.** MOD-011 é Nível 1 (UX Consumer) e não persiste dados no servidor.

---

## 2. Entidades Consumidas (Read-Only)

MOD-011 consome dados de outros módulos via API. Não faz leitura direta de banco.

| Entidade consumida | Módulo origem | Endpoint/Uso no SmartGrid | Feature |
|---|---|---|---|
| `context_framers` (tipo=OPERACAO) | MOD-007 | `POST /routine-engine/evaluate` — identificação da Operação no mount da grade | F02 |
| `behavior_routines` | MOD-007 | Avaliadas internamente pelo motor — resposta inclui `applied_routines` | F02, F03, F04 |
| `routine_items` | MOD-007 | 7 tipos de itens avaliados: FIELD_VISIBILITY, REQUIRED, DEFAULT, DOMAIN, VALIDATION, BLOCKING_VALIDATION, CONDITION | F02, F03, F04 |
| `domain_events` | MOD-000 | Log de alterações (F03 — campo, valor anterior, novo valor) e exclusão lógica (F04) — emitidos pelo módulo destino | F03, F04 |
| Registro do módulo destino | Variável | Leitura para popular `current_record_state` (F03/F04); escrita para persistir inclusão (F02), alteração (F03) e exclusão lógica (F04) | F02, F03, F04 |

---

## 3. Contrato Response do Motor (Dados Consumidos pela UI)

A UI do SmartGrid consome o response de `POST /routine-engine/evaluate` e transforma em estado visual da grade.

### 3.1 Campos do Response Consumidos

| Campo do Response | Tipo | Uso na UI | Feature |
|---|---|---|---|
| `visible_fields` | `string[]` | Define colunas da grade e campos visíveis no formulário | F02, F03 |
| `hidden_fields` | `string[]` | Campos não renderizados (ocultos no DOM) | F03 |
| `required_fields` | `string[]` | Campos marcados com asterisco obrigatório | F02, F03 |
| `optional_fields` | `string[]` | Campos sem marcação especial | F02, F03 |
| `defaults` | `Record<string, any>` | Valores pré-preenchidos em novas linhas / campos do formulário | F02, F03 |
| `domain_restrictions` | `Record<string, string[]>` | Opções para dropdowns/selects | F02, F03 |
| `validations` | `Array<{ field, rule, error }>` | Alertas nao bloqueantes — status ⚠️ | F02, F03, F04 |
| `blocking_validations` | `Array<{ field, rule, error }>` | Erros bloqueantes — status ❌ | F02, F03, F04 |
| `applied_routines` | `Array<{ routine_id, routine_name }>` | Informativo — quais rotinas foram aplicadas | F02, F03, F04 |

### 3.2 Mapeamento Response → Status Visual

| Condição | Status | Ícone | Impacto no Save |
|---|---|---|---|
| `blocking_validations.length === 0` E `validations.length === 0` | Válida | ✅ | Contribui para habilitar |
| `blocking_validations.length > 0` | Bloqueante | ❌ | Impede (BR-001) |
| `blocking_validations.length === 0` E `validations.length > 0` | Alerta | ⚠️ | Não impede |
| Sem avaliação realizada | Neutro | — | Impede (BR-001) |

---

## 4. Contrato Client-Side — JSON Export/Import (FR-004)

O SmartGrid persiste estado da grade localmente via Export/Import JSON. Sem persistência no servidor.

### 4.1 Schema do JSON Exportado

```json
{
  "version": "1.0",
  "schema": "smartgrid-export-v1",
  "operacao_id": "uuid",
  "operacao_nome": "string",
  "object_type": "string",
  "columns": [
    {
      "field": "string",
      "required": "boolean",
      "has_domain": "boolean"
    }
  ],
  "rows": [
    {
      "row_id": "uuid-client-generated",
      "status": "neutral | valid | invalid | warning",
      "data": {
        "field1": "value1",
        "field2": "value2"
      },
      "validation_errors": [
        {
          "field": "string",
          "rule": "string",
          "error": "string",
          "blocking": "boolean"
        }
      ]
    }
  ],
  "exported_at": "ISO-8601",
  "exported_by": "user_id",
  "row_count": "number"
}
```

### 4.2 Regras do JSON Export/Import

| Regra | Descrição | Referência |
|---|---|---|
| Geração client-side | JSON gerado inteiramente no browser, sem chamada ao servidor | FR-004 |
| Status neutro ao importar | Todas as linhas importadas recebem `status: "neutral"`, forçando revalidação | FR-004, BR-003 |
| Validação de Operação | Se `operacao_id` do JSON difere da Operação atual, exibe aviso ao usuário | FR-004 |
| Limite de linhas | Importação que excede o limite configurável é rejeitada com mensagem explicativa | FR-005 |
| Formato do `row_id` | UUID v4 gerado pelo client (não é ID de banco) | — |
| `validation_errors` | Preservado no export mas ignorado no import (pois status volta a neutro) | FR-004, BR-003 |

### 4.3 Ciclo de Vida do Estado Client-Side

```text
1. Mount da grade
   └── POST /routine-engine/evaluate (sem object_id) → define colunas
2. Usuário preenche linhas (status: neutral)
3. "Validar Tudo" → POST evaluate por linha → status: valid/invalid/warning
4. Ações em massa → status volta a neutral (BR-008)
5. Export JSON → snapshot completo
6. Import JSON → restaura dados, status forçado a neutral
7. "Salvar" (somente 100% valid) → chamadas ao módulo destino
```

---

## 5. Dados Transitórios em Memória (Grid State)

O SmartGrid mantém estado em memória (client-side React state) que não é persistido no servidor.

| Estrutura | Descrição | Ciclo de vida |
|---|---|---|
| `gridColumns` | Colunas derivadas de `visible_fields`, `required_fields`, `domain_restrictions` | Mount → desmount |
| `gridRows` | Array de linhas com `row_id`, `data`, `status`, `validation_errors` | Mount → desmount (ou export) |
| `selectedRowIds` | Set de `row_id` das linhas selecionadas (checkbox) | Interação do usuário |
| `operationConfig` | Response do motor no mount (configuração da Operação) | Mount → desmount |
| `isValidating` | Flag de loading durante "Validar Tudo" | Durante validação |
| `isSaving` | Flag de loading durante "Salvar" | Durante salvamento |

---

## 6. Campo `target_endpoints` no Context Framer tipo OPERACAO (PEND-SGR-04)

O campo `target_endpoints` e adicionado ao schema do `context_framer` tipo OPERACAO no MOD-007. Ele define explicitamente os endpoints do modulo destino que o SmartGrid utiliza para persistir, alterar e excluir registros. Esses paths sao lidos pelo SmartGrid no mount da grade, junto com `visible_fields`, `required_fields`, `defaults`, `domain_restrictions` etc.

### 6.1 Schema do `target_endpoints`

```json
{
  "target_endpoints": {
    "create": { "method": "POST", "path": "/api/v1/{modulo}/{entity}" },
    "update": { "method": "PATCH", "path": "/api/v1/{modulo}/{entity}/{id}" },
    "delete": { "method": "DELETE", "path": "/api/v1/{modulo}/{entity}/{id}" }
  }
}
```

### 6.2 Detalhamento dos Campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `target_endpoints` | object | Sim (para context_framer tipo OPERACAO usado pelo SmartGrid) | Objeto contendo os 3 endpoints do módulo destino |
| `target_endpoints.create` | object | Sim | Endpoint de inclusão de novo registro |
| `target_endpoints.create.method` | string | Sim | Método HTTP — sempre `POST` |
| `target_endpoints.create.path` | string | Sim | Path do endpoint — ex: `/api/v1/compras/servicos` |
| `target_endpoints.update` | object | Sim | Endpoint de alteração de registro existente |
| `target_endpoints.update.method` | string | Sim | Método HTTP — `PATCH` (partial update) |
| `target_endpoints.update.path` | string | Sim | Path do endpoint com placeholder `{id}` — ex: `/api/v1/compras/servicos/{id}` |
| `target_endpoints.delete` | object | Sim | Endpoint de exclusão lógica de registro |
| `target_endpoints.delete.method` | string | Sim | Método HTTP — sempre `DELETE` |
| `target_endpoints.delete.path` | string | Sim | Path do endpoint com placeholder `{id}` — ex: `/api/v1/compras/servicos/{id}` |

### 6.3 Exemplo Concreto — Operação "Compra de Serviço"

```json
{
  "framer_id": "uuid-da-operacao",
  "framer_type": "OPERACAO",
  "object_type": "compra_servico",
  "target_endpoints": {
    "create": { "method": "POST", "path": "/api/v1/compras/servicos" },
    "update": { "method": "PATCH", "path": "/api/v1/compras/servicos/{id}" },
    "delete": { "method": "DELETE", "path": "/api/v1/compras/servicos/{id}" }
  }
}
```

### 6.4 Ciclo de Vida no SmartGrid

1. **Mount da grade** — SmartGrid chama `POST /routine-engine/evaluate` com o `framer_id` da Operação.
2. **Response inclui `target_endpoints`** — O motor retorna os endpoints junto com `visible_fields`, `required_fields`, `defaults`, `domain_restrictions` etc.
3. **SmartGrid armazena `target_endpoints` em `operationConfig`** (estado client-side, seção 5).
4. **Save (F02)** — SmartGrid usa `target_endpoints.create` para persistir cada linha válida.
5. **Alteração (F03)** — SmartGrid usa `target_endpoints.update` para salvar alterações do formulário.
6. **Exclusão (F04)** — SmartGrid usa `target_endpoints.delete` para excluir registros liberados.

### 6.5 Nota de Amendment — MOD-007

> **Backlog amendment MOD-007:** O campo `target_endpoints` deve ser adicionado ao schema de `context_framer` no MOD-007. Este é um amendment menor — adiciona um campo opcional ao schema existente. Sem breaking change: context_framers que não definem `target_endpoints` continuam funcionando normalmente (não são usados pelo SmartGrid).

---

<!-- Enriquecimento: AGN-DEV-04 completo -->
