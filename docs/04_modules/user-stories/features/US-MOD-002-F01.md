# US-MOD-002-F01 — Listagem de Usuários

**Status Ágil:** `READY`
**Versão:** 1.2.0
**Data:** 2026-03-17
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-002** (Gestão de Usuários)

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-002, US-MOD-000-F05, US-MOD-000-F06, DOC-UX-011, DOC-UX-012, SEC-000-01, LGPD-BASE-001
- **nivel_arquitetura:** 1
- **operationIds consumidos:** `users_list`, `users_delete`, `roles_list`
- **evidencias:** Revisão cruzada com Foundation §2.2: scopes alinhados, cenários de erro e scope coverage ampliados (2026-03-17)
- **wave_entrega:** Wave 1
- **epico_pai:** US-MOD-002
- **manifests_vinculados:** ux-usr-001
- **pendencias:** N/A

---

## 1. A Solução

Como **administrador**, quero uma tela com a lista de todos os usuários do sistema, com filtros por status e perfil, busca por nome/e-mail, e ações rápidas por linha, para gerenciar o ciclo de vida de usuários sem precisar de acesso direto ao banco.

---

## 2. Escopo

### Inclui
- Listagem paginada (cursor-based) de usuários com skeleton durante loading
- Filtros: busca textual (debounce 400ms), status, perfil de acesso
- Filtros sincronizados com query params da URL (deep link)
- Ações por linha: navegar para convite, desativar usuário (com modal de confirmação)
- Botão "Novo Usuário" visível apenas com scope adequado
- Estado vazio com CTA de criação

### Não inclui
- Edição de usuário — roadmap futuro (F04)
- Detalhe completo do usuário — roadmap futuro
- Importação em massa

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Listagem de Usuários — UX-USR-001

  # ── Acesso e Permissão ───────────────────────────────────────
  Cenário: Admin com permissão acessa a listagem
    Dado que o usuário está autenticado com scope "users:user:read"
    Quando ele acessa /usuarios
    Então GET /api/v1/users é chamado com limit padrão
    E a tabela é exibida com skeleton durante o carregamento
    E após resposta, os usuários são listados com nome, perfil, status e data de criação

  Cenário: Usuário sem permissão é redirecionado
    Dado que o usuário está autenticado MAS sem scope "users:user:read"
    Quando ele tenta acessar /usuarios
    Então deve ser redirecionado para /dashboard
    E um Toast deve exibir: "Sem permissão para acessar esta seção."

  # ── Listagem e Paginação ─────────────────────────────────────
  Cenário: Skeleton durante carregamento inicial
    Dado que o usuário acessa /usuarios pela primeira vez
    Quando a chamada à API ainda está em andamento
    Então a tabela exibe N linhas com células placeholder animadas (skeleton)
    E o skeleton desaparece quando a resposta retorna

  Cenário: Paginação cursor-based — carregar mais
    Dado que a listagem retornou meta.nextCursor preenchido
    Quando o usuário clica em "Carregar mais usuários"
    Então GET /api/v1/users?cursor=<nextCursor> é chamado
    E os novos usuários são adicionados ao final da tabela existente (append)
    E o botão "Carregar mais" desaparece se meta.nextCursor retornar null

  Cenário: Estado vazio sem usuários
    Dado que GET /api/v1/users retorna data=[] e meta.nextCursor=null
    Então a tabela deve exibir ilustração + "Nenhum usuário encontrado"
    E deve exibir link "Criar primeiro usuário" se scope users:user:write presente

  # ── Filtros ──────────────────────────────────────────────────
  Cenário: Busca com debounce por nome
    Dado que o usuário digita "Carlos" no campo de busca
    Quando 400ms se passam sem nova digitação
    Então GET /api/v1/users?q=Carlos é chamado
    E a tabela é atualizada com overlay leve sobre ela durante refetch
    E a URL é atualizada para /usuarios?search=Carlos

  Cenário: Filtro por status PENDING
    Dado que o usuário seleciona "Pendente" no select de Status
    Então GET /api/v1/users?status=PENDING é chamado
    E a URL é atualizada para /usuarios?status=PENDING
    E apenas usuários com status PENDING são exibidos

  Cenário: Filtros preservados ao navegar de volta
    Dado que o usuário filtrou por status=ACTIVE e navegou para outra tela
    Quando ele clica em "Voltar" do browser
    Então os filtros status=ACTIVE devem estar preservados na URL e aplicados

  Cenário: Limpar filtros restaura listagem completa
    Dado que há filtros ativos (?status=PENDING&search=Carlos)
    Quando o usuário clica em "Limpar filtros"
    Então a URL volta para /usuarios sem query params
    E a listagem recarrega sem filtros aplicados

  # ── Erros de carregamento ────────────────────────────────────
  Cenário: Erro ao carregar lista de usuários
    Dado que o usuário acessa /usuarios
    Quando GET /api/v1/users retorna 500
    Então o skeleton é removido
    E um Toast de erro exibe: "Não foi possível carregar a lista de usuários." + correlationId
    E a tela exibe estado de erro com botão "Tentar novamente"

  # ── Ações por linha ──────────────────────────────────────────
  Cenário: Botão "Novo Usuário" visível apenas com scope correto
    Dado que o usuário tem scope "users:user:write"
    Então o botão "Novo Usuário" deve estar visível no header
    Quando ele clica no botão
    Então é redirecionado para /usuarios/novo

  Cenário: Botão "Novo Usuário" ausente sem scope de escrita
    Dado que o usuário tem apenas scope "users:user:read" (sem :write)
    Então o botão "Novo Usuário" NÃO deve estar presente na tela

  Cenário: Ação "Reenviar convite" visível apenas para usuários PENDING com scope de escrita
    Dado que o usuário tem scope "users:user:write"
    E a tabela exibe um usuário com status PENDING
    Então o dropdown de ações desse usuário deve incluir "Reenviar convite"
    Quando o admin clica em "Reenviar convite"
    Então é redirecionado para /usuarios/:id/convite

  Cenário: Ação "Desativar" visível apenas com scope de exclusão
    Dado que o usuário tem scope "users:user:delete"
    Então o dropdown de ações de cada usuário deve incluir "Desativar"

  Cenário: Ação "Desativar" ausente sem scope de exclusão
    Dado que o usuário NÃO tem scope "users:user:delete"
    Então o dropdown de ações NÃO deve incluir "Desativar"

  Cenário: Ação "Desativar" desabilitada para usuários INACTIVE
    Dado que a tabela exibe um usuário com status INACTIVE
    Então a opção "Desativar" no dropdown NÃO deve estar disponível para esse usuário

  Cenário: Ação "Desativar" abre modal de confirmação
    Dado que o admin clica em "Desativar" no dropdown de um usuário
    Então um modal de confirmação deve aparecer com:
    | Campo    | Valor esperado                                                    |
    | Título   | "Desativar usuário?"                                              |
    | Corpo    | "O usuário {nome} perderá acesso imediatamente."                  |
    E o e-mail do usuário NÃO deve aparecer no modal
    E o botão "Desativar" no modal deve estar habilitado

  Cenário: Confirmação de desativação chama API e atualiza linha
    Dado que o modal de confirmação está aberto
    Quando o admin clica em "Desativar" no modal
    Então o botão entra em isLoading
    E DELETE /api/v1/users/:id é chamado
    E após 200, o status da linha muda para INACTIVE na tabela
    E o modal é fechado
    E um Toast de sucesso é exibido: "Usuário desativado com sucesso."

  Cenário: Erro ao desativar exibe toast com correlationId
    Dado que DELETE /api/v1/users/:id retorna 500
    Então o Toast exibe: "Não foi possível desativar o usuário." + correlationId
    E o modal permanece aberto para nova tentativa
```

---

## 4. Definition of Ready (DoR) ✅

- [x] Manifest UX-USR-001 criado com actions, componentes e query_params documentados
- [x] operationIds `users_list`, `users_delete` mapeados para MOD-000-F05
- [x] operationId `roles_list` mapeado para MOD-000-F06 (select de filtro)
- [x] Regras LGPD (e-mail fora do modal de desativação) documentadas no manifest
- [x] Épico US-MOD-002 em estado READY

## 5. Definition of Done (DoD)

- [ ] Listagem com skeleton implementada e testada
- [ ] Filtros sincronizados com query params da URL
- [ ] Busca com debounce de 400ms
- [ ] Paginação cursor-based (append na tabela)
- [ ] Modal de desativação sem e-mail do usuário
- [ ] Visibilidade do botão "Novo Usuário" por scope `users:user:write`
- [ ] Visibilidade da ação "Desativar" por scope `users:user:delete`
- [ ] Ação "Desativar" desabilitada para status INACTIVE
- [ ] Estado vazio com CTA
- [ ] Estado de erro com retry ao falhar carregamento da lista
- [ ] Testes de integração com mock de diferentes scopes e estados

---

## 6. Manifest Vinculado

`docs/05_manifests/screens/ux-usr-001.users-list.yaml` → UX-USR-001

---

## 7. Regras Críticas

1. Scope `users:user:read` obrigatório — sem ele, redirect para /dashboard com Toast
2. Botão "Novo Usuário" visível apenas com scope `users:user:write`
3. Ação "Desativar" visível apenas com scope `users:user:delete`; desabilitada para usuários INACTIVE
4. Modal de desativação usa **nome** do usuário, **nunca o e-mail** (LGPD)
5. Filtros sincronizados com query params para deep link e navegação com "Voltar"
6. Paginação cursor-based: append, nunca substituição da lista
7. Busca: debounce 400ms — sem chamada por keystroke
8. Após desativação: linha atualizada inline (sem reload da página)

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.2.0 | 2026-03-17 | arquitetura | Revisão cruzada: scope `users:user:delete` para desativar (alinhado DOC-FND-000 §2.2), cenários de erro GET 500, visibilidade por scope granular, desativar disabled para INACTIVE. |
| 1.1.0 | 2026-03-16 | arquitetura | DoR verificado, conteúdo revisado. |
| 1.0.0 | 2026-03-15 | arquitetura | Criação no padrão ECF. Feature cascade do MOD-002. |
