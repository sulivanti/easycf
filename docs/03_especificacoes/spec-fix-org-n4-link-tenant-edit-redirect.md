---
title: "Fix: Vincular Tenant em N4 redireciona para modo de edição"
version: 1.0
date_created: 2026-03-31
owner: Marcos Sulivan
tags: [bugfix, frontend, MOD-003, UX-ORG-001, org-units, tenant-link]
---

# Introduction

Na tela de Árvore Organizacional (UX-ORG-001), ao clicar em "Vincular tenant" no menu de contexto de um nó N4, o sistema ativa o modo de edição inline dos dados cadastrais em vez de abrir o modal de vinculação de tenant (`LinkTenantModal`). Isso confunde o fluxo do usuário, que espera selecionar um tenant para vincular, mas se depara com campos de edição de nome, CNPJ, etc.

## 1. Purpose & Scope

Corrigir o fluxo de vinculação de tenant em nós N4 da árvore organizacional, implementando o `LinkTenantModal` descrito no manifesto UX-ORG-001 e corrigindo os handlers incorretos.

**Audiência:** Desenvolvedores frontend (React/TypeScript).

**Escopo:**
- Corrigir handler `onLinkTenant` em `OrgTreePage.tsx`
- Implementar componente `LinkTenantModal` conforme manifesto UX-ORG-001
- Corrigir botão "+ Novo Departamento" no `DetailPanel.tsx` que também redireciona incorretamente

**Fora de escopo:** Alterações no backend (endpoints já existem e funcionam).

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| **N4** | Quarto nível hierárquico da estrutura organizacional (subunidade) |
| **N5** | Quinto nível, representado por um tenant (entidade jurídica/estabelecimento) vinculado ao N4 — não é um `org_unit` (ADR-001) |
| **LinkTenantModal** | Modal de seleção de tenant para vinculação, descrito no manifesto UX-ORG-001 componente `link-tenant-modal` |
| **Inline Edit** | Modo de edição in-place dos dados cadastrais no `DetailPanel` (UX-001-M02) |

## 3. Requirements, Constraints & Guidelines

### Bugs identificados

- **BUG-001**: `OrgTreePage.tsx:362` — `onLinkTenant={(id) => handleOpenEdit(id)}` mapeia a ação de vincular tenant para o modo de edição inline. Deve abrir o `LinkTenantModal`.
- **BUG-002**: `DetailPanel.tsx:361-365` — Botão "+ Novo Departamento" na seção "Departamentos Vinculados" chama `onCreateChild(detail.id)`, que abre o formulário de criação de org unit (filho). Deveria abrir o `LinkTenantModal` para vincular um tenant, já que N4 é o nível máximo (BR-011) e os itens exibidos nessa seção são tenants vinculados (`detail.tenants`).

### Requisitos

- **REQ-001**: Clicar em "Vincular tenant" no menu de contexto de um nó N4 deve abrir o `LinkTenantModal`.
- **REQ-002**: O `LinkTenantModal` deve exibir um campo de busca/autocomplete de tenants com `status=ACTIVE` que ainda não estão vinculados ao N4 selecionado.
- **REQ-003**: O modal deve permitir busca por `codigo` ou `nome` do tenant.
- **REQ-004**: Ao confirmar a vinculação, deve chamar `POST /api/v1/org-units/:id/tenants` com `{ tenant_id }`.
- **REQ-005**: Sucesso exibe toast de confirmação e recarrega a árvore/detalhes. Erro exibe toast com mensagem do servidor.
- **REQ-006**: O botão "+ Novo Departamento" no `DetailPanel` (seção de tenants vinculados) deve abrir o mesmo `LinkTenantModal`, não o formulário de criação.
- **REQ-007**: O `LinkTenantModal` só deve ser acessível com scope `org:unit:write`.

### Constraints

- **CON-001**: O backend já possui o endpoint `POST /api/v1/org-units/:id/tenants` funcional — nenhuma alteração no backend é necessária.
- **CON-002**: Para buscar tenants disponíveis, usar o endpoint existente de listagem de tenants (MOD-000-F07).
- **CON-003**: Componentes visuais devem seguir o Design System (DOC-UX-013) e usar shared UI components (`Dialog`, `Button`, `SearchBar`).

## 4. Interfaces & Data Contracts

### LinkTenantModal Props

```typescript
interface LinkTenantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgUnitId: string;
  orgUnitNome: string;
  /** IDs de tenants já vinculados — para filtrar do autocomplete */
  linkedTenantIds: string[];
  onSuccess: () => void;
}
```

### Endpoint utilizado (existente)

```
POST /api/v1/org-units/:id/tenants
Body: { tenant_id: string }
Headers: Idempotency-Key (opcional)
Response 201: { id, org_unit_id, tenant_id, created_at }
Response 409: tenant já vinculado
```

### Endpoint para buscar tenants disponíveis (existente)

```
GET /api/v1/tenants?status=ACTIVE&search=<termo>
Response 200: { data: Array<{ id, codigo, nome, status }>, next_cursor }
```

## 5. Acceptance Criteria

- **AC-001**: Given um nó N4 ativo na árvore, When o usuário clica "Vincular tenant" no menu de contexto, Then o `LinkTenantModal` é aberto (NÃO o modo de edição inline).
- **AC-002**: Given o `LinkTenantModal` aberto, When o usuário digita no campo de busca, Then a lista exibe tenants ACTIVE filtrados por nome/código, excluindo os já vinculados.
- **AC-003**: Given um tenant selecionado no modal, When o usuário clica "Vincular", Then `POST /api/v1/org-units/:id/tenants` é chamado e, em sucesso, toast de confirmação é exibido e a árvore/detalhes são recarregados.
- **AC-004**: Given o `DetailPanel` de um nó N4, When o usuário clica "+ Vincular Estabelecimento" (antes chamado "+ Novo Departamento"), Then o `LinkTenantModal` é aberto.
- **AC-005**: Given o usuário sem scope `org:unit:write`, Then o botão "Vincular tenant" e o botão "+ Vincular Estabelecimento" NÃO são visíveis.

## 6. Test Automation Strategy

- **Test Levels**: Unitário (componente `LinkTenantModal`) + Integração (fluxo completo na `OrgTreePage`)
- **Frameworks**: Vitest + Testing Library
- **Cenários críticos**:
  - Modal abre ao clicar "Vincular tenant" no contexto de N4
  - Modal NÃO abre modo de edição
  - Busca filtra tenants corretamente
  - Tenants já vinculados são excluídos da lista
  - Submit chama endpoint correto
  - Toast de sucesso/erro é exibido
  - Botão oculto sem scope adequado

## 7. Rationale & Context

O bug surgiu porque o `LinkTenantModal` descrito no manifesto UX-ORG-001 (componente `link-tenant-modal`, linhas 174-182) nunca foi implementado. Como solução temporária, o handler `onLinkTenant` foi mapeado para `handleOpenEdit`, mas isso criou um comportamento confuso:

1. O usuário clica "Vincular tenant" esperando selecionar um tenant
2. O sistema seleciona o nó N4 e ativa modo de edição dos dados cadastrais
3. O usuário vê campos de Nome, CNPJ, Razão Social, etc. — sem relação com vinculação de tenant

O mesmo problema afeta o botão "+ Novo Departamento" no `DetailPanel`, que chama `onCreateChild` — que tentaria criar um org_unit filho sob N4 (impossível pela BR-011, nível máximo = 4).

## 8. Dependencies & External Integrations

### Módulos dependentes
- **MOD-000-F07** (Foundation/Tenants): Fornece listagem de tenants para o autocomplete
- **MOD-003** (Estrutura Organizacional): Módulo afetado pelo fix

### Componentes shared UI necessários
- `Dialog` / `DialogContent` / `DialogHeader` — modal container
- `SearchBar` — campo de busca
- `Button` — ações
- `Skeleton` — loading state da lista

## 9. Examples & Edge Cases

### Fluxo correto (após fix)

```
1. Usuário expande árvore até N4
2. Clica "⋯" → "Vincular tenant"
3. LinkTenantModal abre com campo de busca vazio
4. Usuário digita "MAT" → lista mostra tenants filtrados
5. Seleciona "MATRIZ-001 — Matriz São Paulo"
6. Clica "Vincular"
7. POST /api/v1/org-units/:id/tenants { tenant_id: "..." }
8. Toast: "Estabelecimento MATRIZ-001 vinculado com sucesso"
9. Árvore recarrega mostrando o tenant como chip no N4
```

### Edge cases

- **Nenhum tenant disponível**: Modal exibe "Nenhum estabelecimento disponível para vinculação."
- **Tenant já vinculado (409)**: Toast de erro "Este estabelecimento já está vinculado a esta unidade."
- **Busca sem resultados**: "Nenhum estabelecimento encontrado para o termo buscado."
- **Todos os tenants já vinculados**: Lista vazia com mensagem explicativa.

## 10. Validation Criteria

- [ ] "Vincular tenant" no menu de contexto de N4 abre `LinkTenantModal` (não modo de edição)
- [ ] `LinkTenantModal` exibe lista de tenants ACTIVE não vinculados
- [ ] Busca funciona por nome e código
- [ ] Vinculação chama endpoint correto e exibe toast
- [ ] Botão na seção de tenants do DetailPanel abre o mesmo modal
- [ ] Modo de edição inline (Editar Dados) continua funcionando normalmente
- [ ] Sem regressões no fluxo de edição, criação, desativação e restauração

## 11. Related Specifications / Further Reading

- Manifesto UX-ORG-001: `docs/05_manifests/screens/ux-org-001.org-tree.yaml` (componente `link-tenant-modal`)
- Manifesto UX-ORG-002: `docs/05_manifests/screens/ux-org-002.org-form.yaml`
- Módulo MOD-003: `docs/04_modules/mod-003-estrutura-organizacional/mod-003-estrutura-organizacional.md`

---

## Appendix A: Plano de Execução

### Arquivos afetados

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `apps/web/src/modules/org-units/components/LinkTenantModal.tsx` | **NOVO** — Componente modal de vinculação |
| 2 | `apps/web/src/modules/org-units/hooks/use-link-tenant.ts` | **NOVO** — Hook de mutation para POST link |
| 3 | `apps/web/src/modules/org-units/hooks/use-available-tenants.ts` | **NOVO** — Hook para buscar tenants disponíveis (com filtro) |
| 4 | `apps/web/src/modules/org-units/pages/OrgTreePage.tsx` | **EDITAR** — Substituir handler `onLinkTenant`, adicionar estado do modal, integrar `LinkTenantModal` |
| 5 | `apps/web/src/modules/org-units/components/DetailPanel.tsx` | **EDITAR** — Alterar botão "+ Novo Departamento" para abrir modal de vinculação, renomear label |

### Steps

| Step | Descrição | Paralelizável |
|------|-----------|---------------|
| S1 | Criar `use-available-tenants.ts` — hook que busca tenants ACTIVE filtrando os já vinculados | Sim (com S2) |
| S2 | Criar `use-link-tenant.ts` — hook de mutation POST `/org-units/:id/tenants` | Sim (com S1) |
| S3 | Criar `LinkTenantModal.tsx` — componente com Dialog + SearchBar + lista + botão vincular | Após S1+S2 |
| S4 | Editar `OrgTreePage.tsx` — novo estado `linkTenantState`, handler `handleLinkTenant`, renderizar `LinkTenantModal` | Após S3 |
| S5 | Editar `DetailPanel.tsx` — adicionar prop `onLinkTenant`, alterar botão na seção de tenants | Sim (com S4) |
| S6 | Validar fluxo completo: vincular via menu de contexto + via DetailPanel + verificar que edição inline continua ok | Após S4+S5 |

### Paralelização

```
S1 ──┐
     ├── S3 ── S4 ──┐
S2 ──┘               ├── S6
          S5 ────────┘
```
