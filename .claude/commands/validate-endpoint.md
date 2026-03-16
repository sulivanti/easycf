# Skill: validate-fastify-endpoint

Valida estaticamente código de endpoint Fastify contra contratos arquiteturais inegociáveis: RBAC, rastreabilidade e RFC 9457. Atua como arquiteto revisor automatizado.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `validate-endpoint`

> Esta skill NÃO EXECUTA código. Lê o arquivo e aponta violações contratuais antes de deploy/merge.

## Argumento

$ARGUMENTS deve conter o caminho do arquivo de rota/handler (ex: `src/modules/products/routes/products.route.ts`). Se não fornecido, pergunte ao usuário.

## Padrões Inegociáveis

### 1. Segurança Perimetral (RBAC)

- Rota DEVE usar guard `requireScope('module:resource:action')` no `preHandler`
- **PROIBIDO** decodificar JWT manualmente no handler (`jwt.verify(token)`)
- **Exceção:** Rotas públicas DEVEM ter comentário `// ROTA PÚBLICA (Isenta de Guard)`

### 2. Observabilidade e Rastreabilidade

- Mutações (POST/PUT/PATCH/DELETE) DEVEM extrair e propagar `X-Correlation-ID` via `request.headers['x-correlation-id']` ou `request.id`
- `correlationId` DEVE ser repassado para: eventos de domínio, APIs externas, camadas de banco
- Operações com efeitos colaterais graves DEVEM suportar `Idempotency-Key`

### 3. Erros RFC 9457 (Problem Details)

Blocos `catch` e respostas de falha DEVEM usar:

```json
{
  "type": "https://api.projeto.local/errors/{tipo}",
  "title": "Descrição sucinta",
  "status": 422,
  "detail": "Mensagem orientada ao utilizador",
  "instance": "/caminho/do/request",
  "correlationId": "uuid"
}
```

**PROIBIDO:** `{ "error": "Deu algo errado" }` ou `{ "message": "Invalido" }`

### 4. Schema OpenAPI na Rota (DOC-ARC-001)

- Rota DEVE declarar `schema: { body?, querystring?, params?, response }`
- `response` DEVE ter código de sucesso (200/201) e erro (4xx/5xx) com ProblemDetails
- **Exceção:** Webhooks e health checks podem omitir com justificativa

## Dinâmica de Execução

1. Leia o arquivo alvo completo
2. Varra definições de rota buscando middlewares em `preHandler`
3. Analise blocos `try/catch` para Problem Details
4. Rastreie ciclo de vida do correlationId
5. Emita relatório:
   - **Aprovado:** "Validação Fastify Concluída. RBAC, Rastreabilidade e RFC 9457 verificados."
   - **Reprovado:** Liste linhas problemáticas e correções mandatórias
