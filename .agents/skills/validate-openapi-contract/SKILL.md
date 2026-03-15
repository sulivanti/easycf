---
name: validate-openapi-contract
description: Valida e audita o contrato OpenAPI do projeto (apps/api/openapi/v{X}.yaml) contra as regras inegociáveis do DOC-ARC-001 — versionamento, headers obrigatórios (X-Correlation-ID, Idempotency-Key), respostas Problem Details (RFC 9457), lint Spectral e rastreabilidade @contract. Triggers: "validar contrato openapi", "lint do yaml openapi", "verificar swagger", "checar contrato da rota", "validar EX-OAS", ou automaticamente após geração ou modificação de qualquer rota Fastify.
---

# Skill: validate-openapi-contract

## Objetivo

Atuar como auditor de contrato de API. Esta skill realiza **análise estática** do arquivo
`apps/api/openapi/v{X}.yaml` e dos arquivos de rota TypeScript associados, verificando
conformidade com os quatro pilares obrigatórios definidos em `DOC-ARC-001`:

1. **EX-OAS-001** — Estrutura e versionamento correto do YAML OpenAPI
2. **EX-OAS-002** — Lint via Spectral (`openapi:lint`)
3. **EX-OAS-003** — Operacionalidade do Swagger UI local
4. **EX-OAS-004** — Testes de contrato (responses reais vs schema declarado)

> [!WARNING]
> Esta skill **NÃO EXECUTA** servidores, **NÃO SOBE** containers e **NÃO FAZ** deploy.
> Ela lê e analisa arquivos estaticamente. Para testes de contrato dinâmicos (EX-OAS-004),
> ela instrui a execução do script `openapi:contract-test` via terminal e interpreta a saída
> — mas não executa o servidor subjacente.

Esta skill é **complementar** à `validate-fastify-endpoint`: enquanto aquela verifica o código
TypeScript do handler, esta verifica o contrato YAML publicado da API.

---

## 1. Gatilhos de Ativação

- "validar contrato openapi"
- "lint do yaml da api"
- "verificar swagger v{X}"
- "checar contrato da rota [recurso]"
- "validar EX-OAS"
- **Uso Automático Obrigatório:** Sempre que uma rota Fastify for criada ou modificada pelo
  `PKG-COD-001` (agente API), execute esta skill antes de encerrar a sessão de geração.

---

## 2. Parâmetros de Execução

Antes de iniciar, confirme com o usuário (ou extraia do contexto):

- **Versão da API:** (ex: `v1`) — define o caminho `apps/api/openapi/v{X}.yaml`
- **Escopo da validação:** `completa` (todos os pilares) ou pilares específicos (ex: `EX-OAS-001,EX-OAS-002`)

---

## 3. PASSO 1: Leitura do Normativo (Obrigatório)

**PARE.** Antes de validar qualquer arquivo, leia:

`docs/01_normativos/DOC-ARC-001__Padroes_OpenAPI.md`

Extraia e internalize:
- Seção de organização do OpenAPI (arquivo canônico, paths versionados, `$ref`)
- Convenções por operação (`operationId`, `tags`, headers, erros, paginação, `security`)
- Definition of Done (DoD) por endpoint

---

## 4. PASSO 2: Validação EX-OAS-001 — Estrutura do YAML

Leia o arquivo `apps/api/openapi/v{X}.yaml` usando sua ferramenta de leitura de arquivo.

Verifique os seguintes itens:

| Item | Regra | Severidade |
|------|-------|------------|
| Versão OpenAPI | `openapi: 3.1.0` (preferível) ou `3.0.x` | Aviso se < 3.0 |
| Paths versionados | Toda operação inicia com `/api/v{X}/...` | Crítica |
| `operationId` único | Cada operação tem `operationId` único e estável | Crítica |
| `tags` por módulo | Toda operação tem ao menos uma `tag` | Moderada |
| `summary` presente | Toda operação tem `summary` descritivo | Moderada |
| `$ref` para schemas duplicados | Schemas reutilizados referenciam `components/schemas` | Moderada |
| `ProblemDetails` em components | `components/schemas/ProblemDetails` definido com campos `type`, `title`, `status`, `detail`, `correlationId` | Moderada |
| `X-Correlation-ID` em parameters | `components/parameters/XCorrelationId` definido | Crítica |
| `Idempotency-Key` em parameters | `components/parameters/IdempotencyKey` definido (obrigatório se existirem escritas com side-effect) | Crítica |
| `x-permissions` documentado | Operações com guard RBAC declaram `x-permissions` na operação | Moderada |

---

## 5. PASSO 3: Validação EX-OAS-002 — Lint Spectral

Execute via terminal a partir da raiz do repositório:

```bash
pnpm --filter api openapi:lint
# ou equivalente conforme package.json de apps/api
```

Interprete a saída:

- **0 erros, 0 avisos:** EX-OAS-002 ✅ aprovado.
- **Erros Spectral:** Liste cada erro com código de regra e path no YAML. Exija correção antes de prosseguir.
- **Script não encontrado:** Marcar como **Lacuna Operacional** e recomendar configuração do Spectral conforme `DOC-ARC-001`.

---

## 6. PASSO 4: Validação EX-OAS-003 — Operacionalidade do Swagger UI

Leia `apps/api/package.json` e verifique a existência do script `openapi:serve`:

- **Script existe:** Registre como disponível. Oriente o usuário a executar `pnpm --filter api openapi:serve` para validação visual se necessário.
- **Script ausente:** Marcar como **Lacuna de Tooling (EX-OAS-003)** e recomendar adição conforme `DOC-ARC-001`.

> **Nota:** Esta validação é de presença de infraestrutura, não de execução. O agente não sobe o servidor — apenas confirma que a capacidade existe.

---

## 7. PASSO 5: Validação EX-OAS-004 — Testes de Contrato

Verifique se o script `openapi:contract-test` existe no `apps/api/package.json`.

Se existir, execute e interprete a saída:

```bash
pnpm --filter api openapi:contract-test
```

- **Saída de sucesso:** EX-OAS-004 ✅ aprovado.
- **Falhas de contrato:** Liste cada divergência (path, método, campo, valor esperado vs recebido) e exija alinhamento entre código e contrato.
- **Script ausente:** Marcar como **Lacuna Crítica (EX-OAS-004)** — este é o gate mais importante para garantir que o código Fastify não divergiu silenciosamente do contrato publicado.

---

## 8. PASSO 6: Verificação do Marcador `@contract` nos Artefatos

Para cada endpoint auditado, verifique se o arquivo de rota TypeScript correspondente
(`route.ts`, `handler.ts` ou `controller.ts`) contém o marcador de rastreabilidade:

```typescript
// @contract EX-OAS-{ID}
```

- **Presente:** ✅ aprovado.
- **Ausente:** **Violação de Rastreabilidade** — adicionar o comentário com o ID do contrato verificado antes do encerramento da sessão.

---

## 9. Relatório de Saída

Emita o relatório no seguinte formato:

```
## Relatório de Validação OpenAPI — v{X} — {Data}

### Resumo Executivo
| Pilar          | Status | Violações |
|----------------|--------|-----------|
| EX-OAS-001 (Estrutura)       | ✅/❌ | N |
| EX-OAS-002 (Spectral Lint)   | ✅/❌ | N |
| EX-OAS-003 (Swagger UI)      | ✅/⚠️ | N |
| EX-OAS-004 (Contract Test)   | ✅/❌ | N |

### Violações Críticas
[Lista numerada: pilar, path no YAML/código, descrição, correção recomendada]

### Violações Moderadas
[Lista]

### Lacunas Operacionais
[Scripts ausentes, configurações pendentes]

### Status Final
[ ] Contrato aprovado para merge/deploy
[ ] Pendente correções críticas listadas acima
```

---

## Referências Normativas

- `docs/01_normativos/DOC-ARC-001__Padroes_OpenAPI.md` — Fonte canônica das regras
- `apps/api/openapi/v{X}.yaml` — Artefato auditado
- `apps/api/openapi/spectral.yaml` — Ruleset do lint Spectral
