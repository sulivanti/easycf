---
title: "Fix: Criação de Unidade Organizacional falha silenciosamente"
version: 2.0
date_created: 2026-03-25
last_updated: 2026-03-30
owner: Frontend Team
tags: [bugfix, org-units, MOD-003, UX-ORG-002, error-handling, form-fields]
---

# Introduction

Ao preencher o formulário "Criar Unidade Organizacional" e clicar em "Criar unidade", o sistema não confirma o cadastro — nem exibe mensagem de sucesso, nem redireciona, nem mostra erro. O formulário permanece no estado pós-submit sem feedback visível ao usuário.

Este documento especifica a raiz do problema, as correções necessárias e os critérios de aceitação.

## 1. Purpose & Scope

**Propósito:** Corrigir o fluxo de criação de unidades organizacionais (`OrgFormPage`) para que todo resultado (sucesso ou erro) produza feedback visível ao usuário.

**Escopo:**
- `apps/web/src/modules/org-units/pages/OrgFormPage.tsx` — form submit handler + error handling
- `apps/web/src/modules/org-units/hooks/use-create-org-unit.ts` — mutation hook
- `apps/web/src/modules/org-units/types/org-units.types.ts` — COPY catalog

**Audiência:** Desenvolvedores frontend, QA.

**Premissas:**
- Backend (POST /org-units) está implementado e funcional (validado via testes de API)
- O problema está exclusivamente no tratamento de resposta no frontend

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| **OrgFormPage** | Componente de formulário dual-mode (create/edit) para unidades organizacionais |
| **Silent failure** | Situação em que o submit conclui sem nenhum feedback visual (nem sucesso, nem erro) |
| **ApiError** | Classe de erro customizada que encapsula respostas HTTP não-ok com ProblemDetails (RFC 9457) |
| **Idempotency-Key** | Header HTTP usado para garantir que criações duplicadas retornem o mesmo resultado |

## 3. Requirements, Constraints & Guidelines

### Root Cause Analysis

**Problema 1 — Erros genéricos de API são engolidos silenciosamente (CRITICAL)**

O handler de submit (`handleSubmit` ~linha 109) define `onError: () => {}` (callback vazio). O tratamento de erros é delegado ao `useEffect` (~linha 83-95) que monitora `activeError`, mas este **somente trata dois status codes**:

```ts
// Linha 83-95 — apenas 409 e 422 são tratados
if (activeError.status === 409) {
  errors.codigo = COPY.validation.codigoDuplicate;
} else if (activeError.status === 422) {
  errors._form = activeError.message;
}
```

**Erros com status 400 (validation Fastify), 403 (forbidden), 500 (server error), 502, 503 etc. não produzem nenhum feedback.** O `useEffect` cai no `else` e executa `setFieldErrors({})` — limpando qualquer erro anterior sem mostrar novo.

**Problema 2 — Erros de rede são ignorados (HIGH)**

Se o `fetch()` falha (ex: rede indisponível, timeout, DNS), o erro é um `TypeError` nativo — não uma instância de `ApiError`. O `useEffect`:

```ts
if (activeError instanceof ApiError) {
  // ... 409, 422
} else {
  startTransition(() => setFieldErrors({})); // ← limpa erros, sem feedback
}
```

**Problema 3 — Nenhum `toast.error()` genérico no fluxo de submit (HIGH)**

Comparação com o `OrgTreePage.tsx`, que mostra `toast.error()` em todo `onError` callback (~linha 92, 112, 135). O `OrgFormPage` não tem nenhum toast de erro.

**Problema 4 — Idempotency key não regenerada após erro (LOW)**

Se a chamada falha após o backend processar (ex: rede caiu no response), o idempotency key não é regenerado. Na próxima tentativa (dentro da janela de 60s), o backend retorna o resultado cacheado do idempotency service, mas o frontend pode não processar corretamente se a chave estiver inconsistente com o estado do mutation.

### Requirements

- **REQ-001**: Todo submit do formulário DEVE produzir feedback visível — toast de sucesso + navegação, OU toast de erro + permanência no formulário.
- **REQ-002**: Erros de API com qualquer status code (400, 403, 409, 422, 500, etc.) DEVEM mostrar `toast.error()` com a mensagem do servidor.
- **REQ-003**: Erros de rede (TypeError, AbortError) DEVEM mostrar `toast.error()` com mensagem genérica de conectividade.
- **REQ-004**: Erros 409 (código duplicado) e 422 (validação) DEVEM continuar mostrando field-level errors inline, **além** do toast.
- **REQ-005**: O botão de submit DEVE permanecer em estado `disabled` + spinner durante a requisição (já implementado via `isSubmitting`).
- **REQ-006**: Após erro, o idempotency key DEVE ser regenerado para evitar conflitos com idempotency cache server-side.

### Constraints

- **CON-001**: Não alterar a API do backend — a correção é 100% frontend.
- **CON-002**: Manter compatibilidade com o modo `edit` que usa `useUpdateOrgUnit`.
- **CON-003**: Manter o padrão de field errors inline para 409/422 (UX existente).

### Guidelines

- **GUD-001**: Usar o mesmo padrão de `toast.error()` do `OrgTreePage` para consistência.
- **GUD-002**: Usar o catálogo `COPY.error` para mensagens de erro (i18n-ready).

## 4. Interfaces & Data Contracts

### 4.1 — Mudanças no `handleSubmit` (OrgFormPage.tsx)

```ts
// ANTES (create mode):
createMutation.mutate(data, {
  onSuccess: (result) => {
    toast.success(COPY.toast.createSuccess(result.codigo, result.nome));
    onSuccess(result.id);
  },
  onError: () => {
    /* fieldErrors handled via useEffect */
  },
});

// DEPOIS:
createMutation.mutate(data, {
  onSuccess: (result) => {
    toast.success(COPY.toast.createSuccess(result.codigo, result.nome));
    createMutation.regenerateKey(); // REQ-006
    onSuccess(result.id);
  },
  onError: (error) => {
    // REQ-006: regenerar idempotency key após erro
    createMutation.regenerateKey();
    // REQ-002/REQ-003: toast de erro genérico
    const message =
      error instanceof ApiError
        ? error.message
        : COPY.error.networkError;
    toast.error(message);
  },
});
```

Aplicar o mesmo padrão ao modo `edit` (com `updateMutation`), exceto regenerateKey.

### 4.2 — Melhoria no useEffect de fieldErrors

```ts
// DEPOIS: manter useEffect apenas para field-level errors (inline)
useEffect(() => {
  if (activeError instanceof ApiError) {
    const errors: Record<string, string> = {};
    if (activeError.status === 409) {
      errors.codigo = COPY.validation.codigoDuplicate;
    } else if (activeError.status === 422) {
      errors._form = activeError.message;
    }
    // Não limpar se não for 409/422 — o toast já cobre
    if (Object.keys(errors).length > 0) {
      startTransition(() => setFieldErrors(errors));
    }
  } else if (!activeError) {
    startTransition(() => setFieldErrors({}));
  }
  // Não limpar fieldErrors para erros non-ApiError — toast é suficiente
}, [activeError]);
```

### 4.3 — Adição ao catálogo COPY (org-units.types.ts)

```ts
// Adicionar em COPY.error:
networkError: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
```

### 4.4 — Regeneração de idempotency key (use-create-org-unit.ts)

O hook já expõe `regenerateKey()`. Nenhuma alteração necessária no hook — apenas chamar `regenerateKey()` no `onSuccess` e `onError` do componente.

## 5. Acceptance Criteria

- **AC-001**: Given um formulário preenchido, When o usuário clica "Criar unidade" e a API retorna 201, Then um toast de sucesso é exibido E o usuário é redirecionado para `/org-units`.
- **AC-002**: Given um formulário com código duplicado, When a API retorna 409, Then o campo "Código" exibe erro inline "Código já cadastrado" E um toast de erro é exibido.
- **AC-003**: Given um formulário válido, When a API retorna 422 (ex: nível máximo), Then um erro de formulário é exibido inline E um toast de erro é exibido.
- **AC-004**: Given um formulário válido, When a API retorna 400 (validação Fastify), Then um toast de erro é exibido com a mensagem do servidor.
- **AC-005**: Given um formulário válido, When a API retorna 403 (sem permissão), Then um toast de erro é exibido com a mensagem do servidor.
- **AC-006**: Given um formulário válido, When a API retorna 500 (erro interno), Then um toast de erro é exibido com a mensagem do servidor.
- **AC-007**: Given um formulário válido, When a conexão de rede está indisponível, Then um toast de erro é exibido com mensagem "Não foi possível conectar ao servidor...".
- **AC-008**: Given uma criação com sucesso, When o usuário navega de volta ao formulário e tenta criar outra unidade, Then a criação funciona independentemente (idempotency key foi regenerada).
- **AC-009**: Given uma criação com erro, When o usuário corrige e resubmete, Then a requisição usa uma nova idempotency key.
- **AC-010**: Given o modo edit, When a API retorna erro em PATCH, Then um toast de erro é exibido (mesma lógica do create).

## 6. Test Automation Strategy

- **Test Levels**: Unit (Vitest + React Testing Library)
- **Frameworks**: Vitest, @testing-library/react, msw (Mock Service Worker)
- **Test Cases**:
  1. Render form → submit → mock 201 response → assert toast.success + onSuccess called
  2. Submit → mock 409 → assert fieldErrors.codigo set + toast.error shown
  3. Submit → mock 422 → assert fieldErrors._form set + toast.error shown
  4. Submit → mock 500 → assert toast.error shown with server message
  5. Submit → mock network error → assert toast.error shown with connectivity message
  6. Submit success → assert regenerateKey called
  7. Submit error → assert regenerateKey called
- **Coverage Requirements**: 100% dos paths de erro no handleSubmit

## 7. Rationale & Context

A implementação original delegou o error handling para um `useEffect` observando `mutation.error`, que era um padrão válido para 409/422 field-level errors. Porém, a ausência de um `toast.error` genérico no callback `onError` criou um buraco de feedback para todos os outros status codes e erros de rede.

O `OrgTreePage` usa o padrão correto (toast em todo `onError`), mas o `OrgFormPage` não seguiu o mesmo padrão — provavelmente porque o tratamento de field errors inline foi priorizado durante o desenvolvimento.

## 8. Dependencies & External Integrations

### Technology Platform Dependencies
- **PLT-001**: `sonner` — Biblioteca de toasts (já instalada e usada no componente)
- **PLT-002**: `@tanstack/react-query` — Gerenciamento de mutations (já integrado)

### Data Dependencies
- **DAT-001**: Backend POST /org-units — já implementado e funcional, sem alterações necessárias

## 9. Examples & Edge Cases

### Edge Case 1: Double-click
O botão está protegido por `disabled={isSubmitting}`. Após o primeiro click, o segundo é ignorado. A idempotency key garante que se duas requisições passarem, o resultado é o mesmo.

### Edge Case 2: Formulário resubmitido após erro 409
1. User submete → API retorna 409 → toast.error + fieldErrors.codigo
2. User corrige o código → submete novamente
3. `setFieldErrors({})` é chamado no início de `handleSubmit` → limpa erro anterior
4. `regenerateKey()` foi chamado no `onError` anterior → nova idempotency key
5. Requisição prossegue normalmente

### Edge Case 3: Timeout do servidor
Se a requisição leva mais que o timeout do fetch (default do browser ~300s), o erro é um `TypeError` ou `AbortError`. Ambos são tratados pelo branch genérico de rede no `onError`.

### Edge Case 4: Navegação durante loading
Se o usuário navega para outra rota enquanto a requisição está in-flight, o componente desmonta. O React Query cancela a mutation e os callbacks não são executados. Ao voltar ao formulário, um novo componente é montado com estado limpo. Nenhum feedback residual.

## 10. Validation Criteria

1. Build compila sem erros: `pnpm -F @easycode/web build`
2. Todos os ACs de §5 passam em teste manual
3. Nenhum cenário de submit resulta em ausência total de feedback (silent failure)
4. Console do browser não mostra erros uncaught durante o fluxo

## v2.0 — Novos defeitos identificados (2026-03-30)

### DEF-005: `extractFieldErrors` (RFC 9457) existe mas nunca é chamada

- **Localização:** Definida em `org-units.types.ts:490`, nunca importada em `OrgFormPage.tsx`
- **Impacto:** Erros 422 com `extensions.invalid_fields` nunca são mapeados para campos específicos
- **Fix:** Importar e chamar no error handler para erros 422:
  ```typescript
  import { extractFieldErrors } from '../types/org-units.types.js';

  // No useEffect de activeError:
  } else if (activeError.status === 422) {
    const fieldMap = extractFieldErrors(activeError.problem.extensions);
    for (const [field, msg] of fieldMap) {
      errors[field] = msg;
    }
    if (fieldMap.size === 0) {
      errors._form = activeError.message;
    }
  }
  ```

### DEF-006: `CreateOrgUnitRequest` faltando 3 campos cadastrais

- **Localização:** `org-units.types.ts:90-98`
- **Campos faltando:** `filial`, `telefone`, `email_contato`
- **Fix:** Adicionar ao interface:
  ```typescript
  export interface CreateOrgUnitRequest {
    codigo: string;
    nome: string;
    descricao?: string | null;
    parent_id?: string | null;
    cnpj?: string;
    razao_social?: string;
    filial?: string;         // ← NOVO
    responsavel?: string;
    telefone?: string;       // ← NOVO
    email_contato?: string;  // ← NOVO
  }
  ```

### DEF-007: Formulário create mode não renderiza campos cadastrais completos

- **Localização:** `OrgFormPage.tsx:417-427`
- **Impacto:** Em create mode, apenas `responsavel` é renderizado; `filial`, `telefone`, `email_contato` ficam ocultos — mas edit mode tem todos
- **Fix:** Renderizar os mesmos campos cadastrais do edit mode no create mode

### DEF-008: `handleSubmit` create mode não envia campos cadastrais completos

- **Localização:** `OrgFormPage.tsx:134-142`
- **Impacto:** Mesmo se os campos forem renderizados, o payload não inclui `filial`, `telefone`, `email_contato`
- **Fix:**
  ```typescript
  const data: CreateOrgUnitRequest = {
    // ... campos existentes ...
    ...(filial.trim() && { filial: filial.trim() }),
    ...(telefone.trim() && { telefone: telefone.trim() }),
    ...(emailContato.trim() && { email_contato: emailContato.trim() }),
  };
  ```

### Requisitos adicionais (v2.0)

- **REQ-007:** Para erros 422, o handler DEVE chamar `extractFieldErrors` e mapear os field errors para os campos correspondentes.
- **REQ-008:** A interface `CreateOrgUnitRequest` DEVE incluir `filial`, `telefone` e `email_contato` como campos opcionais.
- **REQ-009:** O formulário em create mode DEVE renderizar `filial`, `telefone`, `email_contato` (mesmos do edit mode).
- **REQ-010:** O `handleSubmit` create mode DEVE incluir os 3 campos no payload quando preenchidos.

### Acceptance Criteria adicionais (v2.0)

- **AC-011:** Given erro 422 com `invalid_fields: [{field: "cnpj", message: "CNPJ inválido"}]`, When o handler processa, Then o campo cnpj exibe "CNPJ inválido" inline.
- **AC-012:** Given o formulário em create mode, When renderizado, Then os campos `filial`, `telefone`, `email_contato` estão visíveis.
- **AC-013:** Given o formulário em create mode com `filial=ABC`, When submetido, Then o payload contém `filial: "ABC"`.

---

### Appendix A: Plano de Execução (v2.0 atualizado)

| # | Arquivo | Ação | Descrição |
|---|---------|------|-----------|
| 1 | `apps/web/src/modules/org-units/types/org-units.types.ts` | Editar | Adicionar `filial`, `telefone`, `email_contato` ao `CreateOrgUnitRequest` |
| 2 | `apps/web/src/modules/org-units/pages/OrgFormPage.tsx` | Editar | (a) Importar `extractFieldErrors`; (b) reescrever error handler com extractFieldErrors + fallback genérico + toast; (c) renderizar campos cadastrais em create mode; (d) adicionar campos ao handleSubmit; (e) regenerar idempotency key |

| Step | Descrição | Paralelo? |
|------|-----------|-----------|
| 1 | Adicionar campos ao `CreateOrgUnitRequest` | Sim (com 2a) |
| 2a | Importar `extractFieldErrors` no OrgFormPage | Sim (com 1) |
| 2b | Reescrever error handler completo (useEffect + onError) | Após 2a |
| 2c | Renderizar campos cadastrais em create mode | Após 2b |
| 2d | Adicionar campos ao handleSubmit create | Após 2c |
| 3 | Build web para validar compilação | Após 1-2d |

## 11. Related Specifications / Further Reading

- [spec-auth-ui-components.md](./spec-auth-ui-components.md) — Auth UI components (ProfileAvatar, LogoutConfirmDialog)
- [spec-fix-session-timeout-redirect-loop.md](./spec-fix-session-timeout-redirect-loop.md) — Fix 401 redirect loop
- [spec-fix-org-tree-first-use-bootstrap.md](./spec-fix-org-tree-first-use-bootstrap.md) — Fix seed org unit N1 + error logging handler
- `docs/04_modules/mod-003-org-units/mod-003-org-units.md` — Especificação executável MOD-003
- `apps/api/src/modules/org-units/presentation/routes/org-units.route.ts` — Backend route handler
