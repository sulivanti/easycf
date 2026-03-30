---
title: "Adicionar funcionalidade de edição na tela Papéis de Processo"
version: 1.0
date_created: 2026-03-30
owner: Marcos Sulivan
tags: [bugfix, frontend, process-modeling, MOD-005]
---

# Introduction

A tela de Papéis de Processo (`/processos/papeis`) permite apenas criar novos papéis, mas não oferece opção de editar papéis existentes. O endpoint backend `PATCH /admin/process-roles/:id` já está implementado e funcional — a lacuna é exclusivamente no frontend (API client, hook React Query e UI da página).

## 1. Purpose & Scope

**Propósito:** Completar o CRUD de Papéis de Processo no frontend, adicionando a funcionalidade de edição que já existe no backend.

**Escopo:**
- Adicionar função `updateProcessRole` no API client
- Adicionar tipo `UpdateProcessRoleRequest` nos types
- Adicionar hook `useUpdateProcessRole` nos hooks
- Adicionar botão de editar em cada linha da tabela e dialog de edição na `ProcessRolesPage`

**Fora de escopo:**
- Backend (já implementado)
- Endpoint DELETE (funcionalidade separada)
- Manifesto de tela (não existe para esta página — fora de escopo desta spec)

## 2. Definitions

| Termo | Definição |
|---|---|
| **Papel de Processo** | Entidade global reutilizável que define um papel atribuível a etapas e gates de processos (ex: APROVADOR, REVISOR) |
| **MOD-005** | Módulo de Modelagem de Processos |
| **FR-008** | Requisito funcional de CRUD de Papéis de Processo |
| **PATCH** | Método HTTP para atualização parcial de recurso |

## 3. Requirements, Constraints & Guidelines

- **REQ-001**: A tabela de papéis deve exibir um botão de editar (ícone lápis ou texto) em cada linha
- **REQ-002**: Ao clicar em editar, deve abrir um dialog preenchido com os dados atuais do papel (`nome`, `descricao`, `can_approve`) — o campo `codigo` é somente leitura (não editável após criação)
- **REQ-003**: O submit do dialog deve chamar `PATCH /admin/process-roles/:id` com os campos alterados
- **REQ-004**: Após sucesso, invalidar cache React Query (`['process-modeling', 'roles']`) e exibir toast de sucesso
- **REQ-005**: Em caso de erro, exibir toast de erro sem fechar o dialog
- **CON-001**: O campo `codigo` NÃO deve ser editável (o backend não aceita `codigo` no PATCH body)
- **CON-002**: O endpoint requer scope `process:cycle:write` (já satisfeito — mesmo scope do create)
- **GUD-001**: Reutilizar o padrão visual já estabelecido no dialog de criação (mesmos componentes Dialog, Input, Label, Button)
- **GUD-002**: Seguir o padrão de edição inline já usado em outras páginas do projeto (ex: `RolesPage` do MOD-000)

## 4. Interfaces & Data Contracts

### 4.1 Tipo TypeScript (frontend)

```typescript
// Adicionar em process-modeling.types.ts
export interface UpdateProcessRoleRequest {
  nome?: string;
  descricao?: string | null;
  can_approve?: boolean;
}
```

### 4.2 Função API client

```typescript
// Adicionar em process-modeling.api.ts
/** @contract FR-008 — PATCH /admin/process-roles/:id */
export async function updateProcessRole(
  id: string,
  data: UpdateProcessRoleRequest,
): Promise<ProcessRoleDTO> {
  return httpClient.patch<ProcessRoleDTO>(`/admin/process-roles/${id}`, data);
}
```

### 4.3 Hook React Query

```typescript
// Adicionar em use-process-roles.ts
/** @contract FR-008 — PATCH /admin/process-roles/:id */
export function useUpdateProcessRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateProcessRoleRequest & { id: string }) =>
      updateProcessRole(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROCESS_ROLES_KEY });
    },
  });
}
```

### 4.4 Contrato backend (já existente)

```
PATCH /api/v1/admin/process-roles/:id
Scope: process:cycle:write
Body (parcial): { nome?, descricao?, can_approve? }
Response 200: { id, codigo, nome, descricao, can_approve }
```

## 5. Acceptance Criteria

- **AC-001**: Given a tabela de papéis de processo com pelo menos 1 registro, When o usuário visualiza a tabela, Then cada linha deve ter um botão de ação para editar
- **AC-002**: Given o usuário clica em editar, When o dialog abre, Then os campos `nome`, `descricao` e `can_approve` devem estar preenchidos com os valores atuais do papel, e `codigo` deve ser exibido como somente leitura
- **AC-003**: Given o usuário altera o campo `nome` e submete, When a requisição PATCH é enviada, Then o papel deve ser atualizado e a tabela deve refletir a alteração
- **AC-004**: Given o endpoint retorna erro 4xx/5xx, When o submit falha, Then um toast de erro deve ser exibido e o dialog deve permanecer aberto

## 6. Test Automation Strategy

- **Nível:** Não se aplica nesta spec — testes serão definidos durante implementação
- **Pré-condição:** O endpoint backend já funciona corretamente (pode ser validado manualmente em produção)

## 7. Rationale & Context

A tela foi implementada inicialmente apenas com listagem e criação. O endpoint de update já existia no backend desde o codegen original do MOD-005, mas a integração no frontend foi omitida. Sem edição, o usuário precisa deletar e recriar um papel para corrigir um nome — operação destrutiva que pode falhar se o papel estiver vinculado a estágios.

## 8. Dependencies & External Integrations

### Technology Platform Dependencies
- **PLT-001**: React Query v5 (TanStack Query) — `useMutation` + `invalidateQueries`
- **PLT-002**: Componentes shared/ui (Dialog, Input, Label, Button) — já importados na página

Nenhuma dependência externa nova.

## 9. Examples & Edge Cases

### Edge Case 1: Papel vinculado a estágios
Editar um papel vinculado a estágios deve funcionar normalmente — o backend permite update de papéis em uso.

### Edge Case 2: Campo descricao vazio
Se o usuário limpar a descrição, enviar `descricao: null` no PATCH.

### Edge Case 3: Nenhum campo alterado
Se o usuário abrir o dialog e submeter sem alterar nada, a requisição PATCH deve ser enviada normalmente (o backend é idempotente).

## 10. Validation Criteria

1. O botão de editar aparece em cada linha da tabela
2. O dialog de edição abre com dados preenchidos
3. O submit envia PATCH para `/admin/process-roles/:id`
4. Após sucesso, a tabela é atualizada automaticamente
5. Toast de feedback é exibido (sucesso ou erro)

## 11. Related Specifications / Further Reading

- Módulo: `docs/04_modules/mod-005-modelagem-processos/mod-005-modelagem-processos.md`
- Requisitos: `docs/04_modules/mod-005-modelagem-processos/requirements/fr/FR-005.md`
- Endpoint backend: `apps/api/src/modules/process-modeling/presentation/routes/process-roles.route.ts` (linhas 88-122)
- OpenAPI: `apps/api/openapi/v1.yaml` (operationId: `admin_process_roles_update`)

---

## Appendix A: Plano de Execução

### Arquivos afetados

| # | Arquivo | Ação | Descrição |
|---|---------|------|-----------|
| 1 | `apps/web/src/modules/process-modeling/types/process-modeling.types.ts` | Editar | Adicionar `UpdateProcessRoleRequest` interface |
| 2 | `apps/web/src/modules/process-modeling/api/process-modeling.api.ts` | Editar | Adicionar `updateProcessRole()` function |
| 3 | `apps/web/src/modules/process-modeling/hooks/use-process-roles.ts` | Editar | Adicionar `useUpdateProcessRole` hook |
| 4 | `apps/web/src/modules/process-modeling/pages/ProcessRolesPage.tsx` | Editar | Adicionar botão editar na tabela + dialog de edição |

### Steps

| Step | Arquivos | Paralelizável | Descrição |
|------|----------|---------------|-----------|
| 1 | #1 | — | Adicionar type `UpdateProcessRoleRequest` |
| 2 | #2, #3 | Sim (entre si) | Adicionar API function + hook (dependem do type do step 1) |
| 3 | #4 | — | Adicionar UI de edição na página (depende dos steps anteriores) |

**Nota:** Steps 1 e 2 podem ser combinados num único amendment pois são pequenos. Total: 4 arquivos, 0 arquivos novos.
