# US-MOD-003-F02 — Árvore Organizacional (UX)

**Status Ágil:** `READY`
**Versão:** 1.0.0 | **Data:** 2026-03-15 | **Módulo:** MOD-003
**Referências:** US-MOD-003, US-MOD-003-F01, DOC-UX-011, DOC-UX-012

## Metadados de Governança
- **status_agil:** READY | **owner:** arquitetura
- **rastreia_para:** US-MOD-003, US-MOD-003-F01, DOC-UX-011, DOC-UX-012, DOC-ARC-003
- **nivel_arquitetura:** 1 | **operationIds consumidos:** `org_units_tree`, `org_units_delete`, `org_units_link_tenant`, `org_units_unlink_tenant`

---

## 1. A Solução

Como **administrador organizacional**, quero visualizar a hierarquia corporativa em uma árvore interativa com navegação por nível, poder criar/editar/desativar nós diretamente de seus contextos, e vincular estabelecimentos legais (tenants) às subunidades N4.

---

## 2. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Árvore Organizacional — UX-ORG-001

  Cenário: Carregamento com skeleton
    Dado que o admin acessa /organizacao com scope org:unit:read
    Quando GET /api/v1/org-units/tree está em andamento
    Então a área da árvore exibe linhas skeleton animadas
    E após resposta, a árvore renderiza com N1 expandido e demais colapsados

  Cenário: Estado vazio sem nenhum nó cadastrado
    Dado que GET /org-units/tree retorna lista vazia
    Então exibe: "Nenhuma estrutura organizacional cadastrada."
    E um botão "Criar primeiro nível" visível se scope org:unit:write presente

  Cenário: Ícones diferenciados por nível
    Dado que a árvore está carregada com nós de N1 a N5
    Então cada nível exibe ícone distinto:
    | Nível | Ícone    |
    | N1    | building |
    | N2    | briefcase|
    | N3    | layers   |
    | N4    | folder   |
    | N5    | map-pin  |

  Cenário: Expandir e colapsar nó
    Dado que um nó N2 está colapsado (tem filhos)
    Quando o admin clica no chevron do nó
    Então os filhos N3 são exibidos (expand_node — client_only)
    E nenhuma chamada de API é feita
    Quando clica novamente no chevron
    Então os filhos são ocultados (colapsar)

  Cenário: Busca client-side por nome
    Dado que a árvore está carregada com 30 nós
    Quando o admin digita "Tech" na busca
    Então todos os nós cujo nome contém "Tech" são destacados visualmente
    E seus ancestrais são expandidos automaticamente para torná-los visíveis
    E nenhuma chamada de API é feita

  Cenário: Menu de ações por nó (scope write)
    Dado que o admin tem scope org:unit:write
    Quando clica no menu "..." de um nó N3
    Então o dropdown exibe: "Editar", "Novo filho (N4)", "Desativar"
    E "Desativar" exige adicionalmente scope org:unit:delete

  Cenário: Criar filho com pai pré-selecionado
    Dado que o admin clica em "Novo filho" de um nó N3
    Então é redirecionado para /organizacao/novo?parent=:id
    E no formulário, o nó pai já está pré-selecionado e o nível mostra "N4"

  Cenário: Nós N4 exibem tenants vinculados (N5)
    Dado que um nó N4 tem 2 tenants vinculados
    Quando a árvore está carregada
    Então o nó N4 exibe chips com nome+codigo de cada tenant
    E cada chip tem badge de status do tenant (ACTIVE=verde, BLOCKED=vermelho)
    E botão "Vincular" visível se scope org:unit:write presente

  Cenário: Vincular tenant via modal
    Dado que o admin clica em "Vincular estabelecimento" em um nó N4
    Então o modal LinkTenantModal abre com autocomplete de tenants ACTIVE não vinculados
    Quando seleciona um tenant e clica "Vincular"
    Então POST /org-units/:id/tenants é chamado
    E após 201, o chip do tenant aparece no nó N4 sem reload da página
    E Toast: "Estabelecimento vinculado com sucesso."

  Cenário: Desvincular tenant
    Dado que um chip de tenant tem botão "x" de desvincular
    Quando o admin clica em "x" e confirma
    Então DELETE /org-units/:id/tenants/:tenantId é chamado
    E após 200, o chip desaparece do nó N4
    E Toast: "Vínculo removido."

  Cenário: Desativar nó sem filhos — modal com confirmação
    Dado que o admin clica em "Desativar" de um nó N4 sem filhos ativos
    Então o modal DeactivateNodeModal abre com texto de confirmação
    Quando confirma, DELETE /org-units/:id é chamado
    E após 200, o nó some da árvore e Toast: "Unidade desativada."

  Cenário: Desativar nó com filhos ativos — modal bloqueado
    Dado que o admin clica em "Desativar" de um nó N2 com 3 filhos ativos
    Então o modal abre mas o botão "Desativar" está DESABILITADO
    E exibe: "Esta unidade possui 3 subunidade(s) ativa(s). Desative-as primeiro."
    E a API DELETE NÃO é chamada

  Cenário: Tenant N5 exibe link para gerenciamento
    Dado que a árvore mostra um chip de tenant N5
    Quando o admin clica no nome do tenant
    Então é redirecionado para /filiais/:id (MOD-000-F07)
    E não abre edição direta na tela de organização

  Cenário: Acesso sem scope redirecionado
    Dado que o admin não tem scope org:unit:read
    Quando tenta acessar /organizacao
    Então é redirecionado para /dashboard com Toast "Sem permissão para acessar esta seção."
```

---

## 3. DoR ✅ / DoD

**DoR:** Manifest UX-ORG-001 criado, F01 (API) em READY, escopos definidos.
**DoD:** Árvore expansível testada, busca client-side, vinculação de tenant, modal de desativação com bloqueio por filhos ativos, testes E2E dos fluxos críticos.

## 4. Regras Críticas

1. Busca: **client-side** sobre dados carregados — sem chamada de API extra
2. Tenant N5: **somente leitura** — link para /filiais para gerenciar
3. Modal de desativação: verifica filhos ativos **antes** de habilitar o botão DELETE
4. Estado de expansão: salvo em **memória de sessão** (não backend)
5. Após vincular/desvincular tenant: atualização **inline** da árvore, sem reload

---

## 5. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Árvore expansível N1–N5, vinculação de tenant, busca client-side, modal de desativação. |
