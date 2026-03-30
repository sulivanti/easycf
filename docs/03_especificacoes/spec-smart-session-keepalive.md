---
title: "Smart Session Keep-Alive — Renovação Automática de Token por Atividade"
version: 1.0
date_created: 2026-03-30
last_updated: 2026-03-30
owner: arquitetura
tags: [auth, session, security, frontend, backend, infrastructure]
---

# Introduction

Especificação para implementação de um mecanismo inteligente de keep-alive de sessão. Enquanto o usuário estiver ativamente utilizando o sistema, a sessão deve ser renovada automaticamente — o access token de 15 minutos reinicia seu TTL sem interrupção da experiência. Quando o usuário para de interagir, o sistema expira naturalmente após o período de inatividade configurado.

## 1. Purpose & Scope

### Propósito

Eliminar a experiência frustrante de ser deslogado no meio de uma tarefa ativa. Hoje o access token (JWT, 15min) expira de forma rígida a partir do momento do login, sem considerar a atividade do usuário. O refresh token (7d) existe no backend mas **não é utilizado automaticamente** pelo frontend.

### Escopo

| Camada   | Componente                                     | Tipo de alteração |
|----------|-------------------------------------------------|-------------------|
| Frontend | `apps/web/src/modules/foundation/api/http-client.ts`  | Interceptor 401 + refresh automático |
| Frontend | `apps/web/src/modules/backoffice-admin/api/api-client.ts` | Interceptor 401 + refresh automático |
| Frontend | Novo: hook `useActivityTracker`                 | Detector de atividade do usuário |
| Frontend | Novo: hook `useSessionKeepAlive`                | Orquestrador de renovação proativa |
| Backend  | `apps/api/src/modules/foundation/presentation/routes/auth.route.ts` | Sem alteração (endpoint `/auth/refresh` já existe) |
| Backend  | `apps/api/src/modules/foundation/infrastructure/services-impl.ts` | Sem alteração (token rotation já implementado) |
| Config   | `.env`                                           | Nova variável `SESSION_IDLE_TIMEOUT_MS` |

### Público-alvo

Desenvolvedores frontend e backend do ECF.

### Premissas

- O endpoint `POST /auth/refresh` já está funcional com token rotation (FR-003)
- O refresh token é enviado via cookie httpOnly com `path: /api/v1/auth/refresh`
- O backend já suporta token rotation com detecção de reuso

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| **Access Token** | JWT de curta duração (15min) usado para autenticação em cada request |
| **Refresh Token** | JWT de longa duração (7d) usado exclusivamente para obter novo access token |
| **Token Rotation** | Ao fazer refresh, o refresh token antigo é invalidado e um novo par (access + refresh) é emitido |
| **Keep-Alive** | Mecanismo que renova o access token automaticamente enquanto o usuário está ativo |
| **Atividade do Usuário** | Qualquer interação detectável: clique, teclado, scroll, toque, navegação de rota, ou request HTTP bem-sucedido |
| **Idle Timeout** | Tempo máximo sem atividade antes que o sistema pare de renovar e deixe a sessão expirar |
| **Proactive Refresh** | Renovação do token _antes_ que expire, evitando janelas de 401 |
| **Refresh Window** | Intervalo antes da expiração em que o sistema tenta refresh proativo (ex: últimos 2 minutos dos 15min) |

## 3. Requirements, Constraints & Guidelines

### Requisitos Funcionais

- **REQ-001**: O sistema DEVE renovar o access token automaticamente enquanto o usuário estiver ativo, sem intervenção manual
- **REQ-002**: O sistema DEVE detectar atividade do usuário via eventos DOM (click, keydown, scroll, touchstart, mousemove) e navegação de rotas
- **REQ-003**: O sistema DEVE iniciar refresh proativo quando o access token estiver dentro da _refresh window_ (últimos 2 minutos do TTL) E houver atividade recente
- **REQ-004**: O sistema DEVE parar de renovar o token quando o usuário estiver inativo por mais de `SESSION_IDLE_TIMEOUT_MS` (padrão: 30 minutos)
- **REQ-005**: O sistema DEVE interceptar respostas 401 e tentar refresh do token uma vez antes de propagar o erro — retrying a request original em caso de sucesso
- **REQ-006**: O sistema DEVE enfileirar requests concorrentes que recebam 401 enquanto um refresh está em andamento (mutex/queue pattern), evitando refresh storms
- **REQ-007**: Se o refresh falhar (refresh token expirado, sessão revogada), o sistema DEVE redirecionar para `/login` com limpeza de estado (force logout)
- **REQ-008**: O sistema DEVE persistir o timestamp da última atividade em `sessionStorage` para sobreviver a reloads da página dentro da mesma aba

### Requisitos de Segurança

- **SEC-001**: O refresh token DEVE continuar sendo transmitido APENAS via cookie httpOnly — nunca exposto ao JavaScript
- **SEC-002**: O mecanismo de token rotation existente DEVE ser preservado — cada refresh invalida o token anterior
- **SEC-003**: A detecção de reuso de refresh token existente (handleReuseDetected) DEVE continuar ativa como proteção contra replay attacks
- **SEC-004**: O idle timeout DEVE ser respeitado mesmo que o access token ainda seja válido — inatividade prolongada = sessão encerrada no próximo request
- **SEC-005**: Eventos de mousemove DEVEM ser throttled (máximo 1 registro a cada 30 segundos) para evitar ruído e consumo excessivo de CPU

### Restrições

- **CON-001**: Não deve haver alteração no endpoint `/auth/refresh` nem no fluxo de token rotation do backend
- **CON-002**: O comportamento para usuários com sessão inativa (não interagindo) DEVE permanecer idêntico ao atual — timeout natural por expiração do access token
- **CON-003**: A solução DEVE funcionar com múltiplas abas abertas sem conflito (cada aba tem sua própria instância do tracker)
- **CON-004**: Sem dependências externas adicionais — usar apenas APIs nativas do browser e libs já presentes no projeto

### Guidelines

- **GUD-001**: O activity tracker DEVE usar `addEventListener` com `{ passive: true }` para eventos de scroll/touch para não impactar performance
- **GUD-002**: O timer de refresh proativo DEVE usar `setInterval` com cleanup adequado no unmount do React
- **GUD-003**: Logs de refresh devem incluir o `X-Correlation-ID` para rastreabilidade (DOC-ARC-003)

## 4. Interfaces & Data Contracts

### 4.1 Activity Tracker (novo hook)

```typescript
interface UseActivityTrackerOptions {
  /** Eventos DOM a monitorar */
  events?: string[];                    // default: ['click', 'keydown', 'scroll', 'touchstart', 'mousemove']
  /** Intervalo mínimo entre registros de atividade (ms) */
  throttleMs?: number;                  // default: 30_000 (30s)
  /** Chave no sessionStorage para persistir timestamp */
  storageKey?: string;                  // default: 'ecf_last_activity'
}

interface UseActivityTrackerReturn {
  /** Timestamp (epoch ms) da última atividade detectada */
  lastActivity: number;
  /** Indica se o usuário está ativo (dentro do idle timeout) */
  isActive: boolean;
}

function useActivityTracker(options?: UseActivityTrackerOptions): UseActivityTrackerReturn;
```

### 4.2 Session Keep-Alive (novo hook)

```typescript
interface UseSessionKeepAliveOptions {
  /** Tempo de inatividade antes de parar de renovar (ms) */
  idleTimeoutMs?: number;              // default: env SESSION_IDLE_TIMEOUT_MS ou 1_800_000 (30min)
  /** Segundos antes da expiração do access token para iniciar refresh */
  refreshWindowSeconds?: number;       // default: 120 (2min)
  /** Intervalo de verificação do timer (ms) */
  checkIntervalMs?: number;            // default: 30_000 (30s)
}

function useSessionKeepAlive(options?: UseSessionKeepAliveOptions): void;
```

### 4.3 HTTP Client — Interceptor 401 com Refresh Queue

```typescript
// Adição ao http-client.ts existente (foundation)
// e ao api-client.ts existente (backoffice-admin)

// Estado interno do módulo:
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

/**
 * Ao receber 401:
 * 1. Se já existe um refresh em andamento → espera o refreshPromise resolver
 * 2. Senão → chama POST /auth/refresh, seta isRefreshing=true
 * 3. Se refresh OK → retry a request original com novo token (cookie atualizado)
 * 4. Se refresh FAIL → force logout
 */
```

### 4.4 Variável de ambiente

```env
# Tempo máximo de inatividade antes de encerrar sessão (ms)
# Padrão: 1800000 (30 minutos)
SESSION_IDLE_TIMEOUT_MS=1800000
```

> **Nota:** Esta variável é lida pelo frontend (build-time via Vite `import.meta.env`).
> Deve ser prefixada conforme convenção Vite: `VITE_SESSION_IDLE_TIMEOUT_MS`.

### 4.5 Fluxo: Diagrama de Sequência

```
┌─────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────┐
│  Usuário │     │ ActivityTrack│     │ KeepAlive│     │   API    │
└────┬─────┘     └──────┬───────┘     └────┬─────┘     └────┬─────┘
     │  click/key/scroll │                  │                │
     │──────────────────>│                  │                │
     │                   │ lastActivity=now │                │
     │                   │─────────────────>│                │
     │                   │                  │                │
     │                   │      [timer tick cada 30s]        │
     │                   │                  │ isActive? &&    │
     │                   │                  │ token < 2min?   │
     │                   │                  │───────────────>│
     │                   │                  │ POST /refresh  │
     │                   │                  │<───────────────│
     │                   │                  │ new token pair │
     │                   │                  │                │
     │              [30min sem atividade]    │                │
     │                   │ isActive=false   │                │
     │                   │─────────────────>│                │
     │                   │                  │ [para de       │
     │                   │                  │  renovar]      │
     │                   │                  │                │
     │  (próxima ação)   │                  │                │
     │──────────────────────────────────────────────────────>│
     │                   │                  │   401          │
     │<──────────────────────────────────────────────────────│
     │                   │                  │ force logout   │
```

## 5. Acceptance Criteria

- **AC-001**: Dado um usuário logado que interage continuamente, Quando o access token se aproxima de 2min para expirar, Então o sistema faz refresh proativo e o usuário não percebe interrupção
- **AC-002**: Dado um usuário logado que para de interagir por 30 minutos, Quando o usuário tenta uma ação, Então recebe 401 → tenta refresh → se refresh token ainda válido, renova; se não, redireciona para /login
- **AC-003**: Dado um usuário logado que para de interagir por 30 minutos E o access token expirou, Quando retorna ao sistema, Então é redirecionado para /login
- **AC-004**: Dado 5 requests simultâneos que recebem 401, Quando o interceptor processa, Então apenas 1 request de refresh é enviado e os 5 são retried após o refresh
- **AC-005**: Dado um refresh que falha (sessão revogada), Quando o interceptor processa, Então todos os requests enfileirados são rejeitados e o usuário é redirecionado para /login
- **AC-006**: Dado um reload da página (F5), Quando a página recarrega, Então o lastActivity é recuperado do sessionStorage e o keep-alive continua normalmente
- **AC-007**: Dado duas abas abertas, Quando uma aba faz refresh do token, Então a outra aba receberá o novo cookie automaticamente (httpOnly cookie compartilhado pelo browser)
- **AC-008**: O mousemove DEVE gerar no máximo 1 atualização de lastActivity a cada 30 segundos

## 6. Test Automation Strategy

### Unit Tests (Vitest)

| Componente | Cobertura |
|---|---|
| `useActivityTracker` | Throttle de eventos, persistência sessionStorage, cálculo isActive |
| `useSessionKeepAlive` | Timer de check, decisão refresh vs não-refresh, cleanup no unmount |
| Interceptor 401 | Mutex/queue, retry após refresh OK, force logout após refresh FAIL |

### Integration Tests (Vitest + MSW)

| Cenário | Descrição |
|---|---|
| Refresh proativo | Mock timer + mock `/auth/refresh` → verifica novo token |
| Refresh storm | 5 requests 401 simultâneos → verifica 1 só refresh call |
| Sessão revogada | Mock `/auth/refresh` → 401 → verifica force logout |
| Token rotation | Verifica que refresh retorna novo par e cookie é atualizado |

### Frameworks

- **Vitest** para unit + integration
- **MSW (Mock Service Worker)** para mock de endpoints HTTP
- **@testing-library/react** para hooks React
- **fake-timers** (vi.useFakeTimers) para simular passagem de tempo

### Coverage Requirements

- Mínimo 90% de cobertura nos novos hooks e interceptor
- Todos os edge cases (refresh fail, concurrent 401, tab reload) cobertos

## 7. Rationale & Context

### Problema atual

O access token JWT expira em 15 minutos a partir do login. O frontend possui o endpoint `POST /auth/refresh` mapeado (`authApi.refresh()`) mas **nunca o chama automaticamente**. Resultado: um usuário que está preenchendo um formulário complexo há 16 minutos perde o trabalho ao submeter.

### Por que Proactive Refresh + Activity Tracking?

1. **Refresh reativo (só no 401)** causa UX ruim — o usuário vê loading, recebe 401, espera refresh, depois retry. Com refresh proativo, o token é renovado _antes_ de expirar.

2. **Sem activity tracking**, o sistema renovaria tokens indefinidamente mesmo com laptop aberto e abandonado — risco de segurança. O idle timeout garante que sessões ociosas expiram.

3. **O padrão "sliding window"** (renovar a cada request) sobrecarregaria o endpoint de refresh. A abordagem por timer (check a cada 30s) é muito mais eficiente.

### Por que 30 minutos de idle timeout?

- 15 minutos (access token TTL) é muito curto para tarefas reais (preencher formulário, ler relatório)
- 30 minutos é o padrão de mercado (OWASP Session Management)
- Configurável via variável de ambiente para ambientes com requisitos diferentes

## 8. Dependencies & External Integrations

### Infrastructure Dependencies

- **INF-001**: Endpoint `POST /api/v1/auth/refresh` — já implementado e funcional (FR-003, `auth.route.ts:118`)
- **INF-002**: Cookie httpOnly `refreshToken` — já configurado no login e refresh (`auth.route.ts:56-60`)
- **INF-003**: Token rotation com detecção de reuso — já implementado (`refresh-token.use-case.ts`)

### Technology Platform Dependencies

- **PLT-001**: `sessionStorage` API — disponível em todos os browsers modernos
- **PLT-002**: Vite `import.meta.env` — para injeção build-time de `VITE_SESSION_IDLE_TIMEOUT_MS`

### Compliance Dependencies

- **COM-001**: OWASP Session Management Cheat Sheet — idle timeout recomendado entre 15-30 minutos para aplicações corporativas

## 9. Examples & Edge Cases

### Edge Case 1: Refresh durante multiple concurrent requests

```typescript
// 5 requests simultâneos → todos recebem 401
// O interceptor deve:
// 1. Detectar que isRefreshing === false
// 2. Primeiro request: isRefreshing = true, chama /auth/refresh
// 3. Requests 2-5: detectam isRefreshing === true, aguardam refreshPromise
// 4. Após refresh OK: todos os 5 retentam com novo cookie
```

### Edge Case 2: Refresh token expirado (> 7 dias sem login)

```typescript
// Usuário abre aba antiga após 8 dias
// 1. Access token expirado → 401
// 2. Interceptor tenta /auth/refresh
// 3. Refresh token expirado → 401
// 4. Force logout → redirect /login
// 5. Cleanup: localStorage.removeItem('auth_tokens'), queryClient.clear()
```

### Edge Case 3: Tab focus/blur

```typescript
// Usuário muda de aba por 20 minutos
// 1. Activity tracker NÃO detecta eventos (aba em background)
// 2. lastActivity fica 20 min no passado
// 3. Ao voltar para a aba:
//    - Se access token expirado → 401 → tenta refresh (provavelmente OK, pois 20min < 7d)
//    - Se idle > 30min → refresh NÃO é proativo, mas 401 reactive ainda tenta refresh
//    - Activity tracker atualiza lastActivity ao detectar novo evento
```

### Edge Case 4: Múltiplas abas

```typescript
// Aba A e Aba B abertas
// Aba A faz refresh → novo cookie httpOnly gravado pelo browser
// Aba B faz request → usa novo cookie automaticamente (cookie é compartilhado)
// ⚠️ Se Aba B também tenta refresh com token antigo → token rotation detecta reuso
//    → handleReuseDetected revoga sessão de ambas as abas
// SOLUÇÃO: usar BroadcastChannel para coordenar refresh entre abas (melhoria futura, fora do escopo v1)
```

> **Nota sobre múltiplas abas (v1):** Na v1, aceitamos o risco de race condition entre abas fazendo refresh simultâneo. O token rotation do backend protege contra replay. Em v2, podemos adicionar `BroadcastChannel` para coordenação cross-tab.

## 10. Validation Criteria

- [ ] Access token é renovado automaticamente enquanto o usuário interage
- [ ] Após 30 minutos sem atividade, o sistema para de renovar e a sessão expira naturalmente
- [ ] Requests que recebem 401 são retried automaticamente após refresh bem-sucedido
- [ ] Apenas 1 refresh é feito mesmo com múltiplos requests 401 simultâneos
- [ ] Force logout ocorre quando o refresh token está expirado ou sessão foi revogada
- [ ] O lastActivity sobrevive a page reload (sessionStorage)
- [ ] Nenhuma alteração no backend é necessária
- [ ] Variável `VITE_SESSION_IDLE_TIMEOUT_MS` é respeitada se configurada
- [ ] Testes unitários e de integração passam com >= 90% de cobertura nos novos componentes

## 11. Related Specifications / Further Reading

- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- `docs/04_modules/mod-000-foundation/mod-000-foundation.md` — MOD-000 Foundation
- `apps/api/src/modules/foundation/presentation/routes/auth.route.ts` — Endpoint refresh existente
- `apps/api/src/modules/foundation/application/use-cases/auth/refresh-token.use-case.ts` — Use case refresh com rotation

---

## Appendix A: Plano de Execução

### Arquivos afetados

| # | Arquivo | Ação | Descrição |
|---|---------|------|-----------|
| 1 | `apps/web/src/modules/foundation/hooks/useActivityTracker.ts` | **Criar** | Hook de detecção de atividade com throttle e sessionStorage |
| 2 | `apps/web/src/modules/foundation/hooks/useSessionKeepAlive.ts` | **Criar** | Hook orquestrador de refresh proativo baseado em atividade |
| 3 | `apps/web/src/modules/foundation/api/http-client.ts` | **Modificar** | Adicionar interceptor 401 → refresh → retry com mutex queue |
| 4 | `apps/web/src/modules/backoffice-admin/api/api-client.ts` | **Modificar** | Adicionar interceptor 401 → refresh → retry com mutex queue |
| 5 | `apps/web/src/modules/backoffice-admin/components/AppShell.tsx` | **Modificar** | Montar `useSessionKeepAlive()` no shell da aplicação |
| 6 | `.env` / `.env.example` | **Modificar** | Adicionar `VITE_SESSION_IDLE_TIMEOUT_MS=1800000` |
| 7 | `apps/web/src/modules/foundation/hooks/useActivityTracker.test.ts` | **Criar** | Testes unitários do activity tracker |
| 8 | `apps/web/src/modules/foundation/hooks/useSessionKeepAlive.test.ts` | **Criar** | Testes unitários do keep-alive |

### Steps de execução

```text
Step 1 (paralelo):
  ├── [1] Criar useActivityTracker.ts
  └── [6] Atualizar .env e .env.example

Step 2 (depende de Step 1):
  └── [2] Criar useSessionKeepAlive.ts (depende de useActivityTracker)

Step 3 (paralelo):
  ├── [3] Modificar http-client.ts (interceptor 401)
  └── [4] Modificar api-client.ts (interceptor 401)

Step 4 (depende de Steps 2 + 3):
  └── [5] Montar useSessionKeepAlive no AppShell

Step 5 (paralelo, depende de Steps 1 + 2):
  ├── [7] Testes useActivityTracker
  └── [8] Testes useSessionKeepAlive
```

### Estimativa de paralelização

- **3 waves** de execução principal (Steps 1-4)
- **1 wave** de testes (Step 5, paralela)
- Zero alterações no backend
