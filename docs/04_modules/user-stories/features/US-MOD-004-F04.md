# US-MOD-004-F04 — UX: Painel de Compartilhamentos e Delegações

**Status Ágil:** `READY`
**Versão:** 1.0.0
**Data:** 2026-03-15
**Módulo Destino:** **MOD-004** (Identidade Avançada — UX)
**Referências Normativas:** DOC-UX-012

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-004, US-MOD-004-F02, DOC-UX-012
- **nivel_arquitetura:** 2
- **tipo:** UX
- **operationIds consumidos:** admin_access_shares_list, admin_access_shares_create, admin_access_shares_revoke, access_delegations_list, access_delegations_create, access_delegations_revoke, my_shared_accesses
- **epico_pai:** US-MOD-004
- **manifests_vinculados:** ux-idn-002
- **evidencias:** N/A

---

## 1. A Solução

Como **administrador**, quero gerenciar compartilhamentos controlados e delegações temporárias em um painel centralizado, vendo o que está ativo, quem autorizou e quando expira.
Como **usuário**, quero ver os acessos que foram compartilhados ou delegados para mim, entendendo o que posso fazer e por quanto tempo.

---

## 2. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Painel de Compartilhamentos e Delegações — UX-IDN-002

  # ── Painel Compartilhamentos (admin) ─────────────────────────
  Cenário: Listagem de compartilhamentos ativos
    Dado que admin tem scope identity:share:read
    Quando acessa o painel "Compartilhamentos"
    Então GET /admin/access-shares é chamado com filtro status=ACTIVE
    E a tabela exibe: recurso, solicitante, beneficiário, motivo, autorizador, válido até, status

  Cenário: Badge de expiração iminente
    Dado que um share tem valid_until = em 5 dias
    Então o campo "Válido até" exibe badge âmbar com "5 dias"
    E valid_until = amanhã: badge vermelho "Expira amanhã"
    E valid_until = passado + status=EXPIRED: linha em cinza com badge "Expirado"

  Cenário: Criar compartilhamento controlado com sucesso
    Dado que admin preenche todos os campos no drawer CreateShareDrawer
    E autorizador ≠ usuário atual
    Quando clica "Criar compartilhamento"
    Então POST /admin/access-shares é chamado
    E após 201, o item aparece na tabela e Toast "Compartilhamento criado."

  Cenário: Aviso inline no drawer — autorizador = usuário atual
    Dado que admin seleciona a si mesmo como autorizador
    Então aparece aviso inline sob o campo: "Você não pode se auto-autorizar. Selecione outro aprovador."
    E o botão "Criar" permanece disabled

  Cenário: Revogar compartilhamento
    Dado que admin tem identity:share:revoke
    E clica "Revogar" em um share ativo
    Então modal de confirmação: "Confirma revogação deste compartilhamento?"
    Quando confirma
    Então DELETE /admin/access-shares/:id é chamado
    E status muda para REVOKED na tabela e Toast "Compartilhamento revogado."

  # ── Painel Delegações ────────────────────────────────────────
  Cenário: Listar delegações dadas e recebidas
    Dado que o usuário está no painel "Delegações"
    Quando GET /access-delegations é chamado
    Então tabela exibe delegações onde caller = delegator

  Cenário: Escopos de aprovação desabilitados no drawer
    Dado que admin está criando delegação
    E seus escopos incluem "finance:invoice:approve"
    Quando o multi-select de escopos abre
    Então "finance:invoice:approve" está visível mas desabilitado com tooltip:
    "Escopos de aprovação não podem ser delegados."

  Cenário: Aviso de sub-delegação não permitida
    Dado que o drawer de criação está aberto
    Então exibe banner: "Os escopos delegados não podem ser re-delegados pelo beneficiário."

  Cenário: Revogar delegação própria
    Dado que user clica "Revogar" em delegação onde é o delegador
    Então DELETE /access-delegations/:id é chamado
    E Toast "Delegação revogada."
    E linha muda para status REVOKED

  # ── Painel Recebidos por Mim ──────────────────────────────────
  Cenário: Usuário vê compartilhamentos recebidos
    Dado que o usuário acessou o painel "Recebidos por Mim"
    Quando GET /my/shared-accesses retorna 2 shares
    Então tabela exibe: recurso, concedente, ações permitidas, válido até
    E banner informativo: "Estes acessos são temporários e expiram automaticamente."

  Cenário: Usuário vê delegações recebidas
    Dado que usuário tem 1 delegação recebida de outro usuário
    Então seção "Delegações Recebidas" exibe: escopos, delegador, válido até
    E banner: "Escopos obtidos por delegação não podem ser re-delegados."

  Cenário: Acesso ao painel sem scope — painel admin oculto
    Dado que usuário não tem identity:share:read
    Quando acessa /identidade/compartilhamentos
    Então o painel "Compartilhamentos" (admin) NÃO está visível
    E apenas os painéis "Delegações" e "Recebidos por Mim" são exibidos
```

---

## 3. Manifests Vinculados

| Manifest | Screen ID | Propósito |
|---|---|---|
| `docs/05_manifests/screens/ux-idn-002.shares-delegations.yaml` | UX-IDN-002 | Painel de compartilhamentos e delegações |

---

## 4. Regras Críticas

1. Escopos de aprovação: **visíveis mas desabilitados** no drawer de delegação — não ocultos (transparência)
2. Recursos EXPIRED: permanecem na lista por **30 dias** em cinza (histórico auditável)
3. Painel admin (shares): visível apenas com `identity:share:read` — sem redirect, simplesmente não renderiza o painel
4. Auto-autorização: validação **inline no drawer**, antes do submit — não apenas no servidor
5. Banner "Recebidos": sempre informa que o acesso é temporário

## 5. DoR ✅ / DoD

**DoR:** Manifests UX-IDN-002 criados, F02 em READY.
**DoD:** Três painéis funcionando (shares admin, delegations, received), drawer com validação autorizador ≠ solicitante, escopos de aprovação visíveis mas desabilitados, badges de expiração iminente, testes E2E dos fluxos críticos.

## 6. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Gherkin completo para 3 painéis. |
