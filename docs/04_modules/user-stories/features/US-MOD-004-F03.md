# US-MOD-004-F03 — UX: Gestão de Escopo Organizacional do Usuário

**Status Ágil:** `READY`
**Versão:** 1.1.0
**Data:** 2026-03-16
**Módulo Destino:** **MOD-004** (Identidade Avançada — UX)
**Referências Normativas:** DOC-UX-012

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-16
- **rastreia_para:** US-MOD-004, US-MOD-004-F01, US-MOD-003-F01, DOC-UX-012
- **nivel_arquitetura:** 2
- **tipo:** UX
- **operationIds consumidos:** admin_user_org_scopes_list, admin_user_org_scopes_create, admin_user_org_scopes_delete, org_units_list
- **epico_pai:** US-MOD-004
- **manifests_vinculados:** ux-idn-001
- **evidencias:** N/A

---

## 1. A Solução

Como **administrador de acesso**, quero gerenciar as áreas organizacionais vinculadas a um usuário — definindo sua área principal e áreas adicionais — para que processos e rotinas saibam em qual contexto organizacional o usuário atua.

---

## 2. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Gestão de Escopo Organizacional — UX-IDN-001

  Cenário: Carregar vínculos com skeleton
    Dado que admin acessa /usuarios/:id/escopo-organizacional
    Quando GET /admin/users/:id/org-scopes está em andamento
    Então a lista exibe skeleton durante o carregamento

  Cenário: Exibir vínculos existentes com breadcrumb
    Dado que o usuário tem 1 PRIMARY (N3) e 1 SECONDARY (N2)
    Quando a tela carrega
    Então o PRIMARY mostra badge azul "Área Principal" com breadcrumb completo
    E o SECONDARY mostra badge cinza "Área Adicional"
    E cada card exibe data de concessão e validade (se houver)

  Cenário: Adicionar área principal quando não há nenhum
    Dado que o usuário não tem nenhum vínculo org
    Quando admin seleciona tipo PRIMARY e nó org no drawer
    E clica em "Vincular"
    Então POST /admin/users/:id/org-scopes é chamado com scope_type=PRIMARY
    E após 201, o card aparece na lista com badge "Área Principal"
    E Toast: "Área organizacional vinculada com sucesso."

  Cenário: Aviso ao tentar criar segundo PRIMARY
    Dado que o usuário já tem vínculo PRIMARY ativo
    Quando admin seleciona tipo PRIMARY no drawer
    Então o drawer exibe aviso: "Remova a área principal atual antes de adicionar uma nova."
    E o botão "Vincular" fica disabled para tipo PRIMARY

  Cenário: Nós N5 (tenant) não aparecem no autocomplete
    Dado que admin está no drawer de adicionar área
    Quando pesquisa no autocomplete de nós org
    Então apenas nós com nivel 1–4 são exibidos
    E nenhum tenant (N5) aparece como opção

  Cenário: Remover vínculo com confirmação
    Dado que admin clica em "Remover" em um vínculo SECONDARY
    Então modal de confirmação abre: "Deseja remover este vínculo organizacional?"
    Quando confirma
    Então DELETE /admin/users/:id/org-scopes/:scopeId é chamado
    E o card some da lista
    E Toast: "Vínculo removido."

  Cenário: Aviso ao remover vínculo PRIMARY
    Dado que admin clica em "Remover" no vínculo PRIMARY
    Então o modal exibe aviso adicional:
    "Ao remover a área principal, processos vinculados a este usuário podem perder contexto organizacional."
    E botão "Remover mesmo assim" diferente visualmente do botão de remover SECONDARY

  Cenário: Vínculo com expiração exibe badge de aviso
    Dado que um vínculo tem valid_until = em 3 dias
    Então o card exibe badge âmbar "Expira em 3 dias"
    E badge vermelho "Expirado" para vínculos já expirados

  Cenário: Acesso sem scope redirecionado
    Dado que admin não tem identity:org_scope:read
    Quando acessa /usuarios/:id/escopo-organizacional
    Então é redirecionado para /usuarios/:id com Toast "Sem permissão."
```

---

## 3. Manifests Vinculados

| Manifest | Screen ID | Propósito |
|---|---|---|
| `docs/05_manifests/screens/ux-idn-001.org-scope.yaml` | UX-IDN-001 | Gestão de escopo organizacional do usuário |

---

## 4. DoR ✅ / DoD

**DoR:** Manifest UX-IDN-001 criado, F01 em READY, MOD-003 em READY.
**DoD:** Skeleton, badges PRIMARY/SECONDARY, breadcrumb do nó, autocomplete sem N5, modal com aviso para PRIMARY, badge de expiração, testes com mocks de scopes.

## 5. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Gherkin completo para gestão de escopo organizacional. |
| 1.1.0 | 2026-03-16 | Marcos Sulivan | Revisão: typo corrigido, CHANGELOG adicionado. |
