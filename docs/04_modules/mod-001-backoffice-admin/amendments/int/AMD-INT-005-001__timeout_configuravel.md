> **EMENDA** — Este arquivo altera o artefato-base sem modificá-lo diretamente.
>
> | Campo | Valor |
> |---|---|
> | Artefato-base | INT-005 |
> | Módulo | MOD-001 |
> | Versão da emenda | 0.1.0 |
> | Data | 2026-03-24 |
> | Origem | PENDENTE-008 (PEN-001) |
> | Autor | Marcos Sulivan |

# AMD-INT-005-001 — Timeout configurável por endpoint

## Motivação

INT-005 especifica timeout de 3000ms para `GET /auth/me`, mas o `api-client.ts` usava timeout fixo de 5000ms para todas as requisições. O DashboardPage implementa skeleton timeout de 3s, mas a requisição fetch podia rodar por mais 2s em background, causando desalinhamento entre timeout de rede e timeout de UI.

## Alteração

### api-client.ts — `RequestOptions`

**Antes:**
```typescript
interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown;
  correlationId?: string;
}
```

**Depois:**
```typescript
interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown;
  correlationId?: string;
  /** Per-endpoint timeout in ms. Falls back to REQUEST_TIMEOUT_MS (5 000). */
  timeout?: number;
}
```

### api-client.ts — `apiRequest()`

O `setTimeout` agora usa `options.timeout ?? REQUEST_TIMEOUT_MS` em vez do valor fixo.

### use-auth-me.ts — `fetchAuthMe()`

Passa `timeout: 3_000` na chamada de `apiRequest` para `GET /auth/me`, alinhando o timeout de rede com o skeleton timeout de 3s do DashboardPage e cumprindo INT-005.

## Impacto

- **Compatibilidade:** Retrocompatível — `timeout` é opcional, valor default permanece 5000ms
- **Artefatos modificados:** `api-client.ts`, `use-auth-me.ts`
- **Testes:** Testes existentes não afetados (não dependem do valor de timeout)
