# US-MOD-002-F03 — Fluxo de Convite e Ativação de Usuário

**Status Ágil:** `READY`
**Versão:** 1.2.0
**Data:** 2026-03-17
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-002** (Gestão de Usuários)

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-002, US-MOD-000-F05, DOC-UX-012, LGPD-BASE-001
- **nivel_arquitetura:** 1
- **operationIds consumidos:** `users_get`, `users_invite_resend`
- **evidencias:** Revisão cruzada: cenário de acesso e 404 adicionados, regra de scope documentada (2026-03-17)
- **wave_entrega:** Wave 1
- **epico_pai:** US-MOD-002
- **manifests_vinculados:** ux-usr-003
- **pendencias:** Amendment users_invite_resend pendente no MOD-000-F05 (DoD, não bloqueia READY)

---

## 1. Amendment Necessário no MOD-000-F05

> **Antes do scaffolding desta feature, é necessário criar um amendment no MOD-000-F05** para adicionar o endpoint:
>
> `POST /api/v1/users/:id/invite/resend` — operationId: `users_invite_resend`
>
> **Contrato mínimo do endpoint:**
> - Requer scope: `users:user:write`
> - Status permitidos: apenas usuários com `status=PENDING`
> - Gera novo token de ativação (invalida o anterior)
> - Registra `domain_events`: `event_type='user.invite_resent'`, `sensitivity_level=1`
> - Envio de e-mail via Outbox Pattern (falha de envio não retorna erro ao frontend)
> - Retorna `200 { message: "Invite sent" }` — sem revelar e-mail ou token
> - Suporta `Idempotency-Key` com TTL de 60s

---

## 2. A Solução

Como **administrador**, quero uma tela para acompanhar o status do convite de um usuário e reenviar o e-mail de ativação quando necessário, para garantir que o onboarding seja concluído mesmo se o convite original expirar ou não for recebido.

---

## 3. Escopo

### Inclui
- Visualização do status atual do convite (PENDING / ACTIVE / BLOCKED / INACTIVE)
- Botão de reenvio com cooldown de 60s (anti-spam)
- Alerta visual quando token está expirado
- Histórico de eventos do convite (se disponível na API)
- Proteção LGPD: nome do usuário na tela, nunca o e-mail

### Não inclui
- Geração de link de ativação para copiar — funcionalidade futura
- Cancelamento do convite — roadmap futuro
- Tela de ativação pelo próprio usuário — fora do backoffice admin

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Fluxo de Convite e Ativação — UX-USR-003

  # ── Acesso e Permissão ───────────────────────────────────────
  Cenário: Admin sem permissão é redirecionado
    Dado que o usuário está autenticado sem scope "users:user:read"
    Quando ele tenta acessar /usuarios/:id/convite
    Então deve ser redirecionado para /usuarios
    E um Toast deve exibir: "Sem permissão para acessar esta seção."

  # ── Carregamento e Status ────────────────────────────────────
  Cenário: Skeleton durante carregamento dos dados do convite
    Dado que o admin acessa /usuarios/:id/convite
    Quando GET /api/v1/users/:id ainda não retornou
    Então o card de status exibe skeleton animado
    E o breadcrumb exibe "Usuários > Convite" sem o nome ainda

  Cenário: Status PENDING — convite aguardando ativação
    Dado que GET /api/v1/users/:id retorna { status: "PENDING", nome: "Carlos" }
    Então o card exibe badge âmbar "Aguardando ativação"
    E o texto: "Convite enviado. O usuário ainda não ativou a conta."
    E o botão "Reenviar convite" está habilitado
    E o título da tela usa o nome: "Convite — Carlos"
    E o e-mail NÃO aparece em nenhum lugar na tela

  Cenário: Status PENDING com token expirado
    Dado que GET /api/v1/users/:id retorna status=PENDING e token expirado
    Então um alerta âmbar deve aparecer: "O link de ativação expirou. Reenvie o convite."
    E o botão "Reenviar convite" deve estar habilitado e destacado

  Cenário: Status ACTIVE — usuário já ativou a conta
    Dado que GET /api/v1/users/:id retorna { status: "ACTIVE" }
    Então o card exibe badge verde "Ativo"
    E o texto: "O usuário ativou a conta com sucesso."
    E o botão "Reenviar convite" NÃO deve ser exibido

  Cenário: Status BLOCKED — usuário bloqueado
    Dado que GET /api/v1/users/:id retorna { status: "BLOCKED" }
    Então o card exibe badge vermelho "Bloqueado"
    E o botão "Reenviar convite" está desabilitado
    E um tooltip no botão explica: "Desbloqueie o usuário antes de reenviar o convite."

  Cenário: Status INACTIVE — usuário desativado
    Dado que GET /api/v1/users/:id retorna { status: "INACTIVE" }
    Então o card exibe badge cinza "Inativo"
    E o botão "Reenviar convite" NÃO deve ser exibido

  Cenário: Usuário não encontrado (404)
    Dado que o admin acessa /usuarios/:id/convite com um ID inválido
    Quando GET /api/v1/users/:id retorna 404
    Então a tela exibe mensagem inline: "Usuário não encontrado."
    E o botão "Reenviar convite" NÃO deve ser exibido
    E o breadcrumb oferece link para retornar à listagem

  # ── Reenvio de Convite ───────────────────────────────────────
  Cenário: Reenvio bem-sucedido
    Dado que o usuário tem status PENDING
    Quando o admin clica em "Reenviar convite"
    Então o botão entra em isLoading
    E POST /api/v1/users/:id/invite/resend é chamado
    E ao receber 200, exibe Toast: "Convite reenviado com sucesso."
    E o Toast NÃO contém o e-mail do usuário
    E um countdown de 60 segundos é iniciado
    E o botão fica desabilitado durante o countdown

  Cenário: Cooldown impede reenvio imediato
    Dado que o admin reenviou o convite há menos de 60 segundos
    Então o botão "Reenviar convite" está desabilitado
    E exibe: "Aguarde X segundos para reenviar novamente."
    E o countdown decrementa em tempo real sem reload

  Cenário: Botão reabilita automaticamente após cooldown
    Dado que o countdown de 60s chegou a zero
    Então o botão "Reenviar convite" é reabilitado automaticamente
    E o texto de cooldown desaparece

  Cenário: Erro ao reenviar convite
    Dado que POST /api/v1/users/:id/invite/resend retorna 500
    Então o Toast exibe: "Não foi possível reenviar o convite." + correlationId
    E o botão sai do isLoading e fica habilitado novamente (sem cooldown)

  Cenário: Reenvio para usuário ACTIVE retorna erro
    Dado que o usuário já está ACTIVE (edge case: status mudou após carregar a tela)
    Quando POST /api/v1/users/:id/invite/resend retorna 422
    Então o Toast exibe mensagem de erro genérica + correlationId
    E a tela é recarregada (load_user_invite_status) para refletir o status atual

  # ── Navegação ────────────────────────────────────────────────
  Cenário: Botão voltar retorna para listagem
    Dado que o admin está na tela de convite
    Quando clica em "Voltar" ou no breadcrumb "Usuários"
    Então é redirecionado para /usuarios
    E os filtros anteriores da listagem são preservados (query params)
```

---

## 5. Definition of Ready (DoR) ✅

- [x] Manifest UX-USR-003 criado com todos os estados do card e regras de cooldown
- [x] Amendment do endpoint `users_invite_resend` documentado (seção 1)
- [x] `users_get` (GET /users/:id) mapeado para MOD-000-F05
- [x] Regras LGPD (nome na tela, nunca e-mail) documentadas
- [x] Épico US-MOD-002 em estado READY

## 6. Definition of Done (DoD)

- [ ] Amendment `users_invite_resend` criado e aprovado no MOD-000-F05
- [ ] Todos os estados do card implementados (PENDING, ACTIVE, BLOCKED, INACTIVE)
- [ ] Alerta de token expirado implementado
- [ ] Cooldown de 60s com countdown em tempo real
- [ ] Toast de reenvio sem e-mail do usuário
- [ ] Histórico de eventos exibido (se API disponibilizar)
- [ ] Testes de integração para cada estado e cenário de reenvio

---

## 7. Manifest Vinculado

`docs/05_manifests/screens/ux-usr-003.user-invite.yaml` → UX-USR-003

---

## 8. Regras Críticas

1. Scope `users:user:read` obrigatório — sem ele, redirect para /usuarios com Toast
2. **Título e conteúdo da tela usam nome** — nunca o e-mail (LGPD)
3. **Botão "Reenviar"** disponível apenas para `status=PENDING`; para BLOCKED: desabilitado com tooltip; para ACTIVE/INACTIVE: não renderizado
4. **Cooldown de 60s** após reenvio: countdown em tempo real, sem reload, sem chamada de API
5. **Toast de sucesso**: genérico sem e-mail — "Convite reenviado com sucesso."
6. **Erro de reenvio**: não inicia cooldown — usuário pode tentar novamente imediatamente
7. **Amendment obrigatório**: `users_invite_resend` deve ser criado no MOD-000-F05 **antes** do scaffolding desta feature

---

## 9. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.2.0 | 2026-03-17 | arquitetura | Revisão cruzada: cenário de acesso (guard sem scope), cenário 404 (usuário não encontrado), regra de scope nas Regras Críticas. |
| 1.1.0 | 2026-03-16 | arquitetura | DoR verificado, conteúdo revisado. |
| 1.0.0 | 2026-03-15 | arquitetura | Criação no padrão ECF. Amendment documentado, cooldown 60s, todos os estados mapeados, proteção PII completa. |
