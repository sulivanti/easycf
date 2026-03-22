# US-MOD-002-F02 — Formulário de Cadastro de Usuário

**Status Ágil:** `READY`
**Versão:** 1.2.0
**Data:** 2026-03-17
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-002** (Gestão de Usuários)

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-002, US-MOD-000-F05, US-MOD-000-F06, SEC-000-01, LGPD-BASE-001
- **nivel_arquitetura:** 1
- **operationIds consumidos:** `users_create`, `roles_list`
- **evidencias:** Revisão cruzada: toast LGPD alinhado, cenário de erro 500 adicionado (2026-03-17)
- **wave_entrega:** Wave 1
- **epico_pai:** US-MOD-002
- **manifests_vinculados:** ux-usr-002
- **pendencias:** N/A

---

## 1. A Solução

Como **administrador**, quero um formulário para criar novos usuários escolhendo entre dois modos: enviar um convite por e-mail (para o usuário definir a própria senha) ou definir uma senha temporária diretamente, para que o onboarding seja flexível e seguro conforme a política da organização.

---

## 2. Escopo

### Inclui

- Dois modos de criação via abas: "Enviar Convite" (padrão) e "Senha Temporária"
- Campos obrigatórios e opcionais com validação inline por campo
- Select de perfil de acesso populado dinamicamente via `roles_list`
- Indicador de força de senha client-side (modo senha temporária)
- Idempotência via `Idempotency-Key` gerado no mount do formulário
- Toast de sucesso sem e-mail (proteção LGPD) + redirect automático

### Não inclui

- Edição de usuários existentes — roadmap futuro
- Upload de avatar — roadmap futuro (via MOD-000-F16)
- Associação de filial — gerenciada via MOD-000-F09

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Formulário de Cadastro de Usuário — UX-USR-002

  # ── Acesso ───────────────────────────────────────────────────
  Cenário: Usuário sem scope de escrita é redirecionado
    Dado que o usuário está autenticado sem scope "users:user:write"
    Quando ele tenta acessar /usuarios/novo
    Então deve ser redirecionado para /usuarios
    E um Toast deve exibir: "Sem permissão para criar usuários."

  # ── Carregamento ─────────────────────────────────────────────
  Cenário: Select de perfil carregado via API
    Dado que o formulário está abrindo
    Quando o componente monta
    Então GET /api/v1/roles é chamado
    E o campo "Perfil de acesso" exibe skeleton durante o carregamento
    E após resposta, o select é populado com as roles disponíveis

  Cenário: Falha ao carregar roles
    Dado que GET /api/v1/roles retorna 500
    Então um Toast de erro exibe "Não foi possível carregar os perfis de acesso." + correlationId
    E o campo "Perfil de acesso" exibe mensagem de erro inline com opção de retry

  # ── Modo Padrão: Enviar Convite ──────────────────────────────
  Cenário: Modo "Enviar Convite" é o padrão ao abrir o formulário
    Dado que o admin abre /usuarios/novo
    Então a aba "Enviar Convite" deve estar selecionada
    E os campos de senha NÃO devem estar visíveis

  Cenário: Criação bem-sucedida no modo convite
    Dado que o admin preencheu nome, e-mail, perfil (campos obrigatórios)
    E está no modo "Enviar Convite"
    Quando clica em "Criar usuário"
    Então o botão entra em isLoading
    E POST /api/v1/users é chamado com { fullName, email, roleId, mode: "invite" }
    E o header Idempotency-Key é enviado com UUID gerado no mount
    E ao receber 201, exibe Toast: "Usuário criado com sucesso. Convite enviado."
    E o e-mail NÃO deve aparecer no Toast
    E após 1.5s, redireciona para /usuarios

  Cenário: E-mail duplicado no modo convite
    Dado que o e-mail informado já existe no sistema
    Quando POST /api/v1/users retorna 409
    Então o erro é exibido INLINE sob o campo e-mail: "Este e-mail já está cadastrado no sistema."
    E NÃO deve exibir toast
    E o botão sai do isLoading

  # ── Modo Senha Temporária ────────────────────────────────────
  Cenário: Trocar para modo "Senha Temporária" reseta o formulário
    Dado que o admin preencheu campos no modo convite
    Quando ele clica na aba "Senha Temporária"
    Então todos os campos são resetados (limpos)
    E todos os erros de validação são limpos
    E os campos de senha aparecem

  Cenário: Indicador de força de senha atualiza em tempo real
    Dado que o admin está no modo "Senha Temporária"
    Quando ele digita uma senha no campo correspondente
    Então o indicador de força atualiza client-side sem chamada de API:
    | Senha           | Nível  |
    | "abc"           | Fraca  |
    | "Abc123"        | Média  |
    | "Abc@123!"      | Forte  |

  Cenário: Validação de confirmação de senha
    Dado que o admin digitou senhas diferentes nos dois campos
    Quando tenta submeter o formulário
    Então o campo "Confirmar senha" exibe inline: "As senhas não coincidem."
    E o botão "Criar usuário" permanece disabled

  Cenário: Criação bem-sucedida no modo senha temporária
    Dado que todos os campos obrigatórios e de senha estão válidos
    E o checkbox "Exigir troca no primeiro acesso" está marcado
    Quando clica em "Criar usuário"
    Então POST /api/v1/users é chamado com { fullName, email, roleId, password, forcePasswordReset: true }
    E ao receber 201, exibe Toast: "Usuário criado com sucesso."
    E após 1.5s, redireciona para /usuarios

  # ── Validações Gerais ────────────────────────────────────────
  Cenário: Campos obrigatórios em branco bloqueiam o submit
    Dado que o admin não preencheu o campo nome
    Quando tenta clicar em "Criar usuário"
    Então o botão permanece disabled
    E o campo nome exibe: "Nome completo é obrigatório."

  Cenário: E-mail com formato inválido
    Dado que o admin digitou "nao-e-email" no campo e-mail
    Quando o campo perde o foco (onBlur)
    Então o campo exibe inline: "Informe um e-mail válido."
    E o botão "Criar usuário" permanece disabled

  Cenário: Erros 422 são exibidos por campo
    Dado que POST /api/v1/users retorna 422 com extensions.invalid_fields
    Então cada campo inválido exibe a mensagem de erro correspondente inline
    E NÃO exibe toast genérico
    E o foco é movido para o primeiro campo com erro (acessibilidade)

  Cenário: Erro 500 ao criar usuário
    Dado que todos os campos estão válidos
    Quando POST /api/v1/users retorna 500
    Então o Toast exibe: "Não foi possível criar o usuário." + correlationId
    E o botão sai do isLoading
    E o formulário permanece preenchido para nova tentativa

  Cenário: Idempotência — double-click não cria dois usuários
    Dado que o admin clicou duas vezes rapidamente em "Criar usuário"
    Então apenas uma requisição POST /api/v1/users é enviada
    E o header Idempotency-Key é o mesmo nas duas tentativas
    E apenas um usuário é criado no sistema

  Cenário: Cancelar descarta o formulário
    Dado que o admin preencheu campos mas clica em "Cancelar"
    Então nenhuma chamada de API é feita
    E o formulário é descartado
    E o admin é redirecionado para /usuarios
```

---

## 4. Definition of Ready (DoR) ✅

- [x] Manifest UX-USR-002 criado com dois painéis, mapeamento de erros por campo, regras de idempotência
- [x] `users_create` (POST /users) mapeado para MOD-000-F05
- [x] `roles_list` (GET /roles) mapeado para MOD-000-F06
- [x] Regras de proteção de PII nos toasts documentadas
- [x] Épico US-MOD-002 em estado READY

## 5. Definition of Done (DoD)

- [ ] Modo convite e modo senha implementados e funcionando
- [ ] Select de perfis carregado dinamicamente da API
- [ ] Validação inline por campo (422 e 409)
- [ ] Indicador de força de senha client-side
- [ ] Toast de sucesso sem e-mail do usuário
- [ ] Idempotency-Key enviado em todas as requisições de criação
- [ ] Troca de aba reseta o formulário completamente
- [ ] Redirect automático 1.5s após sucesso
- [ ] Testes: criação com convite, com senha, duplicidade, campos inválidos, cancelamento

---

## 6. Manifest Vinculado

`docs/05_manifests/screens/ux-usr-002.user-form.yaml` → UX-USR-002

---

## 7. Regras Críticas

1. Modo padrão SEMPRE é "Enviar Convite" — admin escolhe explicitamente "Senha Temporária"
2. Toast de sucesso: **nunca exibir o e-mail** — modo convite: "Usuário criado com sucesso. Convite enviado."; modo senha: "Usuário criado com sucesso." (LGPD)
3. Erros 422: **inline por campo**, não em toast
4. Erros 409 (e-mail duplicado): **inline no campo e-mail**, não em toast
5. Idempotency-Key: UUID v4 gerado no mount da tela, mantido até resposta bem-sucedida
6. Troca de aba (modo convite ↔ senha): **reseta todo o formulário**
7. Botão submit: **disabled** enquanto houver campo obrigatório vazio ou erro de validação

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.2.0 | 2026-03-17 | arquitetura | Revisão cruzada: toast de sucesso alinhado com LGPD (sem referência a "e-mail informado"), cenário de erro 500 na criação adicionado. |
| 1.1.0 | 2026-03-16 | arquitetura | DoR verificado, conteúdo revisado. |
| 1.0.0 | 2026-03-15 | arquitetura | Criação no padrão ECF. Dois modos, validação inline, idempotência, proteção PII. |
