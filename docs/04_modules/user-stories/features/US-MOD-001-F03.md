# US-MOD-001-F03 — Dashboard Administrativo Executivo

**Status:** `READY`
**Versão:** 0.1.0  
**Data:** 2026-03-08  
**Autor(es):** Produto + Arquitetura  
**Módulo Destino:** **MOD-001** (Backoffice Admin)

## Metadados de Governança

- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-08
- **rastreia_para:** US-MOD-001, DOC-UX-011, DOC-UX-012, DOC-ARC-003, US-MOD-000-F08
- **evidencias:** N/A (aguardando aprovação do épico US-MOD-001)

---

## 1. Contexto e Problema

Após o login bem-sucedido, o administrador precisa de uma tela inicial que apresente sua identidade (boas-vindas), facilite o acesso rápido aos módulos disponíveis (baseado em permissões) e forneça feedback instantâneo durante o carregamento de dados. Sem especificação formal, a tela tende a ser genérica e sem rastreabilidade de permissões.

---

## 2. A Solução (Linguagem de Negócio)

Como **administrador autenticado**, quero ver ao entrar no sistema:

- Uma saudação personalizada com meu nome (consumida de `/auth/me`)
- Atalhos apenas para os módulos aos quais tenho acesso
- Feedback visual durante o carregamento (skeleton screen)

---

## 3. Escopo

### Inclui

- Widget de boas-vindas com nome do usuário (via `auth_me`)
- Atalhos de módulos filtrados por `scopes` do JWT (client-side, sem API adicional)
- Skeleton screen durante carregamento de `/auth/me` (DOC-UX-012 §5.1)
- Proteção de rota: redirect para login se JWT inválido

### Não inclui

- Métricas, KPIs ou gráficos operacionais (fora de escopo do MOD-001)
- Notificações ou alertas (roadmap futuro)
- Personalização de layout pelo usuário

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Dashboard Administrativo Executivo

  Cenário: Saudação personalizada exibida após login
    Dado que o usuário acabou de fazer login
    Quando o Dashboard é carregado
    Então o sistema deve chamar GET /auth/me (auth_me)
    E exibir widget de saudação com o nome do usuário retornado

  Cenário: Skeleton screen durante carregamento
    Dado que o Dashboard está carregando dados de /auth/me
    Então um skeleton screen deve ser exibido no lugar do widget de saudação (DOC-UX-012 §5.1)
    E o skeleton deve desaparecer quando a resposta da API chegar

  Cenário: Atalhos de módulos filtrados por scopes
    Dado que o usuário está autenticado com escopos específicos
    Quando o Dashboard é exibido
    Então apenas os atalhos para módulos com scopes correspondentes devem ser visíveis
    E módulos sem permissão NÃO devem aparecer (nem desabilitados)

  Cenário: Rota protegida redireciona para login se JWT inválido
    Dado que o usuário tenta acessar /dashboard com JWT expirado
    Quando o sistema valida o token
    Então o usuário deve ser redirecionado para /login
    E nenhuma chamada a /auth/me deve ser feita antes da reautenticação

  Cenário: Erro em /auth/me exibe toast com correlationId
    Dado que o Dashboard está carregando
    Quando GET /auth/me retorna 500
    Então um Toast de erro deve ser exibido com correlationId (DOC-UX-012 §2.1)
    E o usuário não deve ser desconectado automaticamente
```

---

## 5. Definition of Ready (DoR)

- [x] Screen Manifest `ux-dash-001.main.yaml` criado
- [x] `auth_me` documentado em US-MOD-000-F08
- [x] Regras de skeleton screen definidas em DOC-UX-012 §5.1
- [x] Épico pai US-MOD-001 definido
- [x] US-MOD-001 aprovada pelo owner

## 6. Definition of Done (DoD)

- [x] Widget de saudação exibe nome correto do usuário autenticado
- [x] Skeleton screen implementado conforme DOC-UX-012 §5.1
- [x] Atalhos de módulos filtram corretamente por scopes
- [x] Proteção de rota validada por teste E2E
- [x] Evidências (PR/issue) documentadas neste arquivo

---

## 7. Manifests Vinculados

| Manifest | Screen ID | Propósito |
| --- | --- | --- |
| [ux-dash-001.main.yaml](file:///d:/Dev/EasyCodeFramework/docs/05_manifests/screens/ux-dash-001.main.yaml) | UX-DASH-001 | Dashboard pós-login |

---

## 8. Regras Críticas

1. Dashboard DEVE chamar `GET /auth/me` para obter o nome do usuário — nunca usar dados do localStorage
2. Skeleton screen DEVE ser exibido durante o carregamento (DOC-UX-012 §5.1)
3. Atalhos de módulos DEVEM ser filtrados por scopes do JWT — módulos sem permissão não aparecem
4. Rota `/dashboard` DEVE ser protegida — JWT inválido redireciona para `/login`
5. Erros de `/auth/me` DEVEM exibir Toast com `correlationId` (DOC-UX-012 §2.1)
