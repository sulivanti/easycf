# US-MOD-001-F03 — Dashboard Administrativo Executivo

**Status Ágil:** `READY`
**Versão:** 0.5.0
**Data:** 2026-03-16
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-001** (Backoffice Admin)

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-16
- **rastreia_para:** US-MOD-001, DOC-UX-011, DOC-UX-012, DOC-ARC-003, US-MOD-000-F08
- **evidencias:** Transição TODO → READY (2026-03-16) — DoR verificado, conteúdo revisado
- **wave_entrega:** Wave 1
- **epico_pai:** US-MOD-001
- **manifests_vinculados:** ux-dash-001
- **pendencias:** N/A

---

## 1. Contexto e Problema

Após o login bem-sucedido, o administrador precisa de uma tela inicial que apresente sua identidade personalizada, facilite o acesso rápido aos módulos disponíveis (filtrados por permissão) e forneça feedback visual imediato durante o carregamento.

---

## 2. A Solução (Linguagem de Negócio)

Como **administrador autenticado**, ao entrar no sistema quero ver:

- Uma saudação personalizada com meu nome (dados de `/auth/me`)
- Atalhos apenas para os módulos aos quais tenho acesso
- Feedback visual durante o carregamento (skeleton screen)

---

## 3. Escopo

### Inclui

- WelcomeWidget: saudação por período do dia + nome do usuário + filial ativa (via `auth_me`)
- ModuleShortcuts: grade de cards filtrados pelos scopes do JWT
- Skeleton screen para ambos os componentes durante loading
- Proteção de rota: redirect para /login se JWT inválido (gerenciado pelo Shell)
- Toast de erro com correlationId se `auth_me` falhar

### Não inclui

- Métricas, KPIs ou gráficos operacionais
- Notificações ou alertas em tempo real
- Personalização de layout pelo usuário
- Cards de módulos não implementados com contagem de itens pendentes

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Dashboard Administrativo Executivo — UX-DASH-001

  Cenário: Saudação personalizada com período do dia correto
    Dado que o usuário acabou de fazer login e está em /dashboard
    Quando o Dashboard monta e chama GET /api/v1/auth/me
    Então a API retorna { name: "Carlos Silva", tenant: { name: "Matriz SP" } }
    E o WelcomeWidget deve exibir "Bom dia, Carlos Silva!" (se horário entre 5h–12h)
    Ou "Boa tarde, Carlos Silva!" (entre 12h–18h)
    Ou "Boa noite, Carlos Silva!" (entre 18h–5h)
    E deve exibir subtexto: "Matriz SP"

  Cenário: Fonte dos dados é sempre auth_me, nunca localStorage
    Dado que o localStorage contém um nome desatualizado do usuário
    Quando o Dashboard monta
    Então o WelcomeWidget deve exibir o nome retornado por auth_me
    E NUNCA o valor do localStorage ou do JWT decodificado

  Cenário: Skeleton screen durante carregamento de auth_me
    Dado que o Dashboard montou e auth_me ainda não retornou
    Então o WelcomeWidget deve exibir um placeholder de texto animado
    E o ModuleShortcuts deve exibir 4 cards skeleton animados
    E os skeletons devem desaparecer quando auth_me retornar

  Cenário: Skeleton persiste no máximo 3 segundos em caso de timeout
    Dado que auth_me está demorando mais de 3 segundos
    Então o skeleton deve ser substituído por estado de erro
    E o Toast de erro deve ser exibido com correlationId e botão "Tentar novamente"

  Cenário: Atalhos de módulos filtrados pelos scopes do usuário
    Dado que auth_me retorna scopes=["users:user:read", "tenants:branch:read"]
    Quando o Dashboard renderiza o ModuleShortcuts
    Então APENAS os cards "Usuários" e "Filiais" devem aparecer
    E "Perfis e Permissões" (requer users:role:read) NÃO deve aparecer
    E "Auditoria" (requer system:audit:read) NÃO deve aparecer
    E nenhum card deve aparecer desabilitado ou com ícone de "sem acesso"

  Cenário: Dashboard sem nenhum módulo acessível
    Dado que auth_me retorna scopes=[] (usuário sem permissões de módulo)
    Quando o ModuleShortcuts renderiza
    Então uma mensagem deve ser exibida:
    "Nenhum módulo disponível para seu perfil. Contate o administrador."
    E o WelcomeWidget deve ser exibido normalmente

  Cenário: Proteção de rota — JWT inválido
    Dado que o usuário tenta acessar /dashboard com JWT expirado ou ausente
    Quando o Shell (UX-SHELL-001) valida a sessão via interceptor HTTP
    Então o usuário deve ser redirecionado para /login
    E nenhuma chamada a auth_me deve ser feita antes do redirect
    E a tela de login deve exibir Toast: "Sua sessão expirou. Faça login novamente."

  Cenário: Erro em auth_me — exibe toast sem desconectar
    Dado que o Dashboard está carregando
    Quando GET /api/v1/auth/me retorna 500
    Então um Toast de erro deve ser exibido com correlationId (DOC-UX-012 §2.1)
    E o Toast deve incluir botão "Tentar novamente"
    E o usuário NÃO deve ser desconectado automaticamente
    E o skeleton deve ser substituído por estado de erro parcial (não tela branca)

  Cenário: Erro em auth_me — 401 redireciona para login
    Dado que o Dashboard está carregando
    Quando GET /api/v1/auth/me retorna 401
    Então o interceptor HTTP global deve redirecionar para /login
    E deve exibir Toast: "Sua sessão expirou. Faça login novamente."
```

---

## 5. Definition of Ready (DoR)

- [x] Screen Manifest `ux-dash-001.main.yaml` criado com catálogo de atalhos e regras
- [x] `auth_me` especificado em US-MOD-000-F08 com campo `scopes[]` e `tenant.name`
- [x] Regras de skeleton screen documentadas no manifest (max 3s, fallback para erro)
- [x] Épico pai US-MOD-001 em estado READY
- [x] Catálogo de atalhos definido com `required_scope` por card

## 6. Definition of Done (DoD)

- [ ] WelcomeWidget exibe nome e tenant corretos via auth_me
- [ ] Saudação por período do dia usando horário local do browser
- [ ] Skeleton screen implementado para WelcomeWidget e ModuleShortcuts (DOC-UX-012 §5.1)
- [ ] Timeout do skeleton: 3s → estado de erro
- [ ] Cards filtrados por scopes — validado por testes com mock de diferentes perfis
- [ ] Estado vazio (sem scopes) exibe mensagem orientativa
- [ ] Proteção de rota testada: JWT expirado → redirect /login
- [ ] Erro 5xx exibe Toast com correlationId + botão retry
- [ ] Erro 401 aciona redirect via interceptor do Shell
- [ ] Testes E2E cobrindo: carregamento normal, skeleton, filtro de scopes, erro de rede

---

## 7. Manifest Vinculado

| Manifest | Screen ID | Ações rastreadas |
| --- | --- | --- |
| `docs/05_manifests/screens/ux-dash-001.main.yaml` | UX-DASH-001 | load_dashboard_profile (auth_me) |

---

## 8. Catálogo de Atalhos (seed MOD-001)

| Card | Label | Rota | Scope necessário |
| --- | --- | --- | --- |
| shortcut-users | Usuários | /usuarios | `users:user:read` |
| shortcut-roles | Perfis e Permissões | /perfis | `users:role:read` |
| shortcut-branches | Filiais | /filiais | `tenants:branch:read` |
| shortcut-audit | Auditoria | /auditoria | `system:audit:read` |

> Novos módulos (MOD-003 em diante) devem adicionar seus atalhos via amendment nesta tabela e no manifest `ux-dash-001.main.yaml`.

---

## 9. Regras Críticas

1. Dashboard **DEVE** chamar `GET /auth/me` ao montar — nunca usar localStorage ou JWT decodificado
2. Skeleton **DEVE** aparecer durante loading; timeout de 3s → estado de erro (não tela branca)
3. Atalhos **DEVEM** filtrar por `required_scope` contra `auth_me.scopes[]` — módulos sem permissão não aparecem
4. Erro 5xx **DEVE** exibir Toast com correlationId + retry — **não** desconectar o usuário
5. Erro 401 **DEVE** redirecionar para /login via interceptor HTTP do Shell
6. Saudação usa horário local do browser: 5h–12h=dia, 12h–18h=tarde, 18h–5h=noite
7. Fonte dos dados: sempre `auth_me.name` e `auth_me.tenant.name` — nunca cache desatualizado

---

## 10. CHANGELOG

| Versão | Data | Responsável | Descrição |
| --- | --- | --- | --- |
| 0.5.0 | 2026-03-16 | arquitetura | Transição TODO → READY — DoR verificado, conteúdo revisado, rollback concluído |
| 0.4.0 | 2026-03-15 | arquitetura | Incorporação da revisão: +4 cenários Gherkin (fonte auth_me, timeout 3s, estado vazio, diferença 401 vs 5xx), catálogo de atalhos com scopes (seção 8), DoD expandido para 10 itens, saudação por período do dia, 7 regras críticas |
| 0.3.0 | 2026-03-15 | arquitetura | Rollback de READY para TODO — scaffold destruído |
| 0.1.0 | 2026-03-08 | arquitetura | Criação inicial |

---

> ⚠️ **Atenção:** As automações (`forge-module`, `create-amendment`) **SÓ PODEM SER EXECUTADAS** com Status `APPROVED`.
