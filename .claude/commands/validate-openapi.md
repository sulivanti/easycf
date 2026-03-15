# Skill: validate-openapi-contract

Valida e audita contrato OpenAPI contra regras inegociáveis do DOC-ARC-001: versionamento, headers obrigatórios, Problem Details RFC 9457, lint Spectral e rastreabilidade.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `validate-openapi`

> Esta skill NÃO EXECUTA servidores. Lê e analisa arquivos estaticamente.
> Complementar a `/project:validate-endpoint` (que verifica TypeScript do handler).

## Argumento

$ARGUMENTS deve conter a versão da API ou caminho do YAML (ex: `v1` ou `apps/api/openapi/v1.yaml`). Se não fornecido, pergunte ao usuário.

## PASSO 1: Leitura do Normativo

Leia obrigatoriamente: `docs/01_normativos/DOC-ARC-001__Padroes_OpenAPI.md`

## PASSO 2: EX-OAS-001 — Estrutura do YAML

Leia `apps/api/openapi/v{X}.yaml` e verifique:

| Item | Regra | Severidade |
|------|-------|------------|
| Versão OpenAPI | `3.1.0` (preferível) ou `3.0.x` | Aviso |
| Paths versionados | Toda operação em `/api/v{X}/...` | Crítica |
| `operationId` único | Cada operação com ID único e estável | Crítica |
| `tags` por módulo | Ao menos uma tag por operação | Moderada |
| `summary` presente | Descritivo em cada operação | Moderada |
| `$ref` para schemas | Schemas reutilizados via `components/schemas` | Moderada |
| `ProblemDetails` | Schema com `type`, `title`, `status`, `detail`, `correlationId` | Moderada |
| `X-Correlation-ID` | Definido em `components/parameters` | Crítica |
| `Idempotency-Key` | Definido se existirem escritas com side-effect | Crítica |
| `x-permissions` | Operações RBAC declaram permissões | Moderada |

## PASSO 3: EX-OAS-002 — Lint Spectral

Execute: `pnpm --filter api openapi:lint`
- 0 erros: aprovado
- Erros: liste com código de regra e path

## PASSO 4: EX-OAS-003 — Swagger UI

Verifique se `openapi:serve` existe em `apps/api/package.json`. Apenas confirme presença.

## PASSO 5: EX-OAS-004 — Testes de Contrato

Se `openapi:contract-test` existe, execute e interprete. Se ausente: lacuna crítica.

## PASSO 6: Marcador `@contract`

Verifique se arquivos de rota TypeScript contêm `// @contract EX-OAS-{ID}`.

## Relatório

Emita tabela resumo por pilar (EX-OAS-001 a 004), violações críticas/moderadas, lacunas operacionais e status final.
