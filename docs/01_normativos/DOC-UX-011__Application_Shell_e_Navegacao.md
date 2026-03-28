# DOC-UX-011 — Padrões de Application Shell e Navegação

- **id:** DOC-UX-011
- **version:** 1.6.0
- **status:** READY
- **data_ultima_revisao:** 2026-03-26
- **owner:** produto + arquitetura + UX
- **scope:** global (Application Shell e navegação)

---

## 1. Contexto e Objetivo

Este documento define as regras arquiteturais e de experiência de usuário (UX) obrigatórias para o **Application Shell** (a estrutura externa ou esqueleto da aplicação) gerado pelo EasyCodeFramework.

Ele estabelece que elementos de navegação como Dashboard Inicial, Menus Laterais, Breadcrumbs e Headers (antigamente planejados como User Stories US-016, 017, 018 e 021) são, na verdade, **componentes fundacionais do framework frontend**. Os geradores de código DEVEM produzir projetos (React, Vue, etc.) já com essas estruturas embutidas e integradas ao módulo de segurança ([DOC-FND-000](DOC-FND-000__Foundation.md)).

---

## 2. O Application Shell (Layout Base)

Todo projeto/boilerplate gerado pelo framework DEVE adotar um Application Shell consistente que envelopa as rotas de negócio (`UX-XXX`).

### 2.1 Estrutura Obrigatória

O layout base DEVE ser composto minimamente por:

1. **Sidebar (Menu Lateral) ou Topbar (Navegação Principal):** Para ancoragem dos links de módulos.
2. **Header (Cabeçalho):** Contendo identificação do Tenant/Filial atual, Busca Global (ver `DOC-UX-012`), e Widget de Perfil do usuário.
3. **Breadcrumb Bar:** Faixa horizontal imediatamente acima do conteúdo da página, indicando o rastro de navegação.
4. **Main Content Area:** A área dinâmica onde as telas (ex: `/customers`, `/invoices/123`) serão renderizadas.

### 2.2 Identidade Visual A1

O Application Shell DEVE adotar a identidade visual A1 (Grupo A1), utilizando os tokens definidos em DOC-UX-013 §2.1 (bloco A1 Brand).

#### Topbar (Header) — ref DOC-UX-011-M05

| Propriedade | Valor |
|-------------|-------|
| Altura | `h-16` (64px) |
| Fundo | `bg-white` (#FFFFFF) |
| Borda | `border-b border-neutral-200` |
| Layout | flex, três zonas: logo (w-16) / breadcrumb (flex grow) / profile |

**Zona esquerda (logo):** Largura fixa w-16 (64px, alinhada com sidebar colapsada). Logo: ícone 26x26px rounded-[5px] bg-primary-600 com SVG "A1" branco.

**Zona central (breadcrumb):** Separador "/" em neutral-400, segmentos inativos neutral-500 text-xs, segmento ativo neutral-800 font-semibold.

**Zona direita (profile):** Nome neutral-800 font-medium text-xs, subtexto tenant neutral-500 text-[10px], avatar circle 30px bg-primary-600 com iniciais branco bold 11px.

#### Sidebar — ref DOC-UX-011-M05

| Propriedade | Valor |
|-------------|-------|
| Largura | `w-16` colapsada → `w-56` (224px) on hover |
| Fundo | `bg-white` |
| Border | `border-r border-neutral-200` (#e2e8f0) |
| Padding | `py-4 px-2` |
| Transição | `transition-all duration-300` |

**Sidebar colapsada (w-16):** Exibe apenas ícones centralizados. Labels com opacity-0. Section headers ocultos.

**Sidebar expandida (hover → w-56):** Ícones + labels visíveis. Section headers com opacity-100.

**Section headers:** uppercase tracking-[1.4px] text-[9px] font-bold text-a1-text-placeholder (slate-300), opacity-0 → opacity-100 on group-hover.

**Items inativos:** flex items-center rounded-md py-2 px-2.5 gap-2.5, texto text-[13px] text-neutral-500, ícones stroke-neutral-400 16px, hover:bg-primary-50.

**Item ativo:** bg-primary-50 (#eff6ff), text-primary-600 font-semibold, ícone stroke-primary-600 (sem borda lateral).

**Badges:** rounded-full bg-primary-600 text-white text-[9px].

#### Content Area

| Propriedade | Valor |
|-------------|-------|
| Fundo | `bg-neutral-50` (#f8fafc) |
| Padding | `p-6` (mantido) |

#### Skeleton States

- SidebarSkeleton: w-16 bg-white border-r border-neutral-200
- HeaderSkeleton: h-16 bg-white border-b border-neutral-200
- Skeleton bars: bg-neutral-200 com animate-pulse

### 2.3 Estratégia de Roteamento SPA

O frontend DEVE utilizar **@tanstack/react-router** como router SPA. É PROIBIDO o uso de `react-router-dom` ou navegação via `window.location.href`.

#### Route Tree

A árvore de rotas reside em `apps/web/src/routes/` com a seguinte estrutura base:

```
src/routes/
├── __root.tsx          ← Layout raiz (Application Shell)
├── index.tsx           ← Rota raiz / → redirect para /login ou /dashboard
├── _auth.tsx           ← Layout autenticado (sidebar + header)
├── _auth.dashboard.tsx ← Dashboard pós-login
├── login.tsx           ← Página de login (rota pública)
└── _auth.{module}/     ← Rotas de cada módulo (lazy-loaded)
```

> **REGRA OBRIGATÓRIA:** A rota `index.tsx` (path `/`) DEVE existir e redirecionar para `/login` (se não autenticado) ou `/dashboard` (se autenticado). Sem ela, o TanStack Router retorna "Not Found" ao acessar a raiz do domínio.

#### Code Splitting

Rotas de módulo DEVEM ser lazy-loaded via `lazy()` do TanStack Router para otimizar o bundle:

```typescript
// src/routes/_auth.users.tsx
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_auth/users')({
  component: () => import('@modules/users/pages/UsersListPage'),
});
```

#### Router Context

O Router Context é o mecanismo padrão para compartilhar estado de autenticação e permissões entre rotas. Substitui Redux/Zustand/Context para dados de auth:

```typescript
interface RouterContext {
  auth: {
    user: User | null;
    scopes: string[];
    tenantId: string;
    branchId: string;
  };
  queryClient: QueryClient;
}
```

---

## 3. Navegação Dinâmica Baseada em Roles (Menus)

Os menus de navegação do sistema gerado **NÃO DEVEM** ser estáticos. A renderização dos links na Sidebar/Topbar deve ser condicionada às permissões do usuário logado.

### 3.1 Consumo do Foundation (DOC-FND-000)

1. O Shell DEVE invocar o endpoint de perfil do usuário (`GET /auth/me`) logo após o boot da aplicação ou login bem-sucedido.
2. A resposta do `/auth/me` conterá o array de `scopes` (permissões) e as informações do Tenant/Branch atual.

### 3.2 Regra de Renderização

1. Cada item de menu registrado na aplicação DEVE declarar quais `scopes` (ex: `users:read`, `reports:view`) são necessários para visualizá-lo.
2. O componente de Sidebar DEVE interceptar a lista de menus disponíveis e **ocultar (não renderizar)** qualquer link para o qual o usuário não possua o escopo correspondente no Tenant ativo.
3. **Atenção:** Esconder o menu não substitui a proteção da rota no nível do Router (Frontend) e nem a proteção do Endpoint (Backend). É apenas uma decisão de UX.

### 3.3 Route Guards

O TanStack Router oferece `beforeLoad` como ponto de interceptação antes da renderização da rota. Os seguintes guards são obrigatórios:

#### AuthGuard

Aplicado no layout `_auth.tsx`. Verifica se o usuário possui token válido antes de renderizar qualquer rota autenticada:

```typescript
// src/routes/_auth.tsx
export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: '/login' });
    }
  },
  component: AuthLayout,
});
```

#### GuestGuard

Aplicado na rota `/login`. Redireciona usuários já autenticados para o dashboard:

```typescript
// src/routes/login.tsx
import { LoginPage } from '@modules/foundation/pages/login/LoginPage';

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: '/' });
    }
  },
  component: LoginPage,
});
```

> **PROIBIDO:** Route files NÃO DEVEM conter formulários HTML inline ou componentes de página embutidos. O `component` DEVE sempre importar o Page Component real do módulo correspondente (ex: `@modules/foundation/pages/login/LoginPage`). Formulários inline em route files são placeholders que silenciosamente não funcionam em produção.

#### ScopeGuard

Aplicado em rotas de módulo que requerem scopes específicos. Verifica se o usuário possui os scopes necessários no Tenant ativo:

```typescript
function requireScope(...scopes: string[]) {
  return ({ context }: { context: RouterContext }) => {
    const hasAccess = scopes.every((s) => context.auth.scopes.includes(s));
    if (!hasAccess) {
      throw redirect({ to: '/' });
    }
  };
}

// Uso em rota de módulo:
export const Route = createFileRoute('/_auth/users')({
  beforeLoad: requireScope('users:read'),
});
```

---

## 4. Breadcrumbs Estruturais

O Breadcrumb é obrigatório em todas as telas de detalhe e listagem profunda geradas pelo framework, para evitar desorientação do usuário.

### 4.1 Regras de Construção

1. O rastro de navegação DEVE ser construído automaticamente mapeando a URL atual (`react-router` ou equivalente).
2. O último item do breadcrumb (página atual) DEVE estar em modo texto (não clicável).
3. Os itens anteriores DEVEM ser links clicáveis que retornam para os níveis superiores do módulo ativo.
4. Nomes de entidades no Breadcrumb (ex: `Nome do Cliente`) DEVEM ser injetados via estado ou contexto do Router, evitando "IDs crus" (`/customers/12ab34` -> mostrar `/ Clientes / João Silva`).

---

## 5. Dashboard Pós-Login (Landing Page)

Logo após o sucesso da autenticação (via login nativo, SSO ou MFA garantido pelo Foundation — DOC-FND-000 §1), o usuário DEVE ser redirecionado de `/login` para a rota `/` ou `/dashboard`.

### 5.1 Regras do Dashboard Inicial

1. O scaffold básico do framework DEVE conter uma página inicial de espaço reservado (Placeholder Dashboard).
2. Este Dashboard não precisa, no momento de criação do chassi, exibir métricas complexas de negócio, mas DEVE exibir um resumo agregado genérico: mensagem de boas-vindas com o nome do usuário extraído do `/auth/me`, e atalhos rápidos baseados nos módulos onde ele tem acesso.
3. A rota do Dashboard DEVE ser protegida, forçando re-autenticação se o token estiver inválido.

---

## 6. Widget de Perfil (Header)

A identificação do usuário ativo DEVE estar sempre visível no Shell da aplicação (geralmente no canto superior direito do Header).

### 6.1 Regras do Widget

1. **Avatar/Iniciais:** Exibir foto (se disponível no contrato) ou as iniciais do nome do usuário de forma legível.
2. **Dropdown Menu:** Ao clicar/interagir com o Widget, DEVE ser exibido um menu suspenso contendo:
   - Identificação em texto do Tenant/Filial ativo.
   - Nome e E-mail do usuário.
   - Link de atalho para "Minha Conta" ou "Alterar Senha" (conforme contrato de alteração de senha — DOC-FND-000 §1.3).
   - Botão de "Sair" (Logout), que DEVE abrir um **LogoutConfirmDialog** (§6.2) antes de consumir a rota de logout (invalidando sessões ativas). O logout NÃO DEVE ser executado diretamente — a confirmação explícita do usuário é obrigatória.

### 6.2 LogoutConfirmDialog

#### 6.2.1 Regra

O Widget de Perfil (§6.1) DEVE exibir um diálogo de confirmação modal antes de executar a ação de logout. A execução direta (sem confirmação) é **PROIBIDA**.

#### 6.2.2 Requisitos do Dialog

1. **Acionamento:** O botão "Sair" do dropdown (§6.1 item 2) DEVE abrir o dialog ao invés de executar logout diretamente
2. **Título:** "Confirmar saída"
3. **Mensagem:** "Tem certeza que deseja sair? Sua sessão será encerrada."
4. **Botões:**
   - "Cancelar" (variant `outline`) — fecha o dialog sem efeito
   - "Sair" (variant `destructive`) — executa a mutation de logout
5. **Loading state:** Durante a execução da mutation, o botão "Sair" DEVE exibir spinner + texto "Saindo..." e ambos botões DEVEM estar desabilitados (prevenção de double-click)
6. **Escape:** O dialog DEVE fechar ao pressionar Escape (comportamento padrão do componente `Dialog`)
7. **Componentes:** DEVE usar `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `Button` de `@shared/ui/` (CON-002 do projeto)

#### 6.2.3 Telemetria

O LogoutConfirmDialog DEVE emitir UIActionEnvelope (DOC-ARC-003) com:
- `screenId`: `UX-SHELL-001`
- `actionId`: `confirm_logout`

#### 6.2.4 Localização do Componente

O componente DEVE ser exportado de `apps/web/src/modules/backoffice-admin/components/LogoutConfirmDialog.tsx` e composto dentro do ProfileWidget.

#### 6.2.5 Especificação Técnica Detalhada

Os contratos completos (props, acceptance criteria, edge cases, estratégia de testes) estão formalizados em:

> [`docs/03_especificacoes/spec-auth-ui-components.md`](../03_especificacoes/spec-auth-ui-components.md) — seção "LogoutConfirmDialog" (REQ-LC-001 a REQ-LC-010, AC-007 a AC-010)

---

## 7. Critérios de Aceitação para o Gerador (Scaffold CLI)

Quando a automação do framework gerar um frontend vazio para um novo projeto, ela será avaliada pelos seguintes critérios de aceitação:

- **[CA-01]** O código de Layout/Shell gerado inclui de forma robusta um Header, Sidebar, Wrapper de Content e um Breadcrumb componentizado.
- **[CA-02]** O armazenamento do array de permissões (via Router Context do `@tanstack/react-router`) está implementado e alimentado logo no load principal da aplicação.
- **[CA-03]** Componente de Menu lateral aceita um prop/array de rotas e filtra internamente baseado nas guards de escopo (`scopes`).
- **[CA-04]** A URL `/` em ambiente autenticado aciona um Dashboard amigável lendo os dados de perfil (DOC-FND-000 §1.2 — `GET /auth/me`).
- **[CA-05]** Navegação in-app DEVE usar `<Link>` ou `router.navigate()` do `@tanstack/react-router`. O uso de `window.location.href` para navegação interna é **PROIBIDO**, exceto após login bem-sucedido onde é necessário full reload para reler o auth context do localStorage.
- **[CA-06]** Rotas de módulo DEVEM ser lazy-loaded via `lazy()` do TanStack Router. O bundle principal não deve incluir código de módulos individuais.
- **[CA-07]** Route files (`src/routes/*.tsx`) DEVEM importar Page Components dos módulos. É **PROIBIDO** embutir formulários, lógica de negócio ou componentes de página inline em route files. Route files são apenas wrappers de roteamento.
- **[CA-08]** A rota raiz `/` (index.tsx) DEVE existir com redirect para `/login` ou `/dashboard`.
- **[CA-09]** Toda rota referenciada no sidebar-config DEVE ter um route file correspondente. Se o módulo da rota não foi gerado, o route file DEVE usar `ComingSoonPage`. Rotas sem route file (404 no menu) são **PROIBIDAS**.

---

## 8. Rotas Pendentes (Coming Soon Pattern)

### 8.1 Problema

A Sidebar (§3.2) renderiza itens de menu baseados no catálogo `sidebar-config.ts` e nos scopes do usuário (BR-005). Quando um módulo ainda não passou pelo codegen, a rota correspondente (ex: `/usuarios`, `/perfis`) não existe no routeTree, causando erro 404 ou tela branca.

### 8.2 Regra

Quando o sidebar-config referencia uma rota cujo módulo **ainda não foi gerado**, o codegen do módulo que define o shell (MOD-001) DEVE criar um **route file placeholder** com o componente `ComingSoonPage`.

### 8.3 Componente `ComingSoonPage`

O componente DEVE:

1. Ser um **shared component** em `apps/web/src/shared/ui/ComingSoonPage.tsx`
2. Renderizar:
   - Ícone ilustrativo (ex: `Construction` do Lucide)
   - Título: "Módulo em construção"
   - Subtexto: "Esta funcionalidade está sendo desenvolvida e estará disponível em breve."
   - Botão "Voltar ao Dashboard" → navega para `/dashboard`
3. Seguir o Design System (DOC-UX-013) — usar tokens de cor, tipografia e espaçamento padrão
4. NÃO usar layout inline — route file importa o componente shared (CA-07)

### 8.4 Route Files Placeholder

Para cada rota referenciada no sidebar-config que ainda não tem módulo gerado:

```typescript
// apps/web/src/routes/_auth.{rota}.tsx
import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { ComingSoonPage } from '@shared/ui/ComingSoonPage';

export const Route = createRoute({
  path: '/{rota}',
  getParentRoute: () => authRoute,
  component: ComingSoonPage,
});
```

### 8.5 Ciclo de Vida

1. **Criação:** Quando o shell (MOD-001) é gerado e sidebar-config referencia rotas de módulos pendentes
2. **Substituição:** Quando o módulo alvo é gerado via codegen, o route file placeholder é **substituído** pelo route file real que importa a Page Component do módulo
3. **Detecção:** O codegen DEVE verificar se existe um route file placeholder antes de criar o route file real, para evitar conflito

---

*Este documento substitui formalmente a necessidade das User Stories antigas US-016 (Dashboard), US-017 (Menus), US-018 (Breadcrumb) e US-021 (Widget NavBar).*

---

## CHANGELOG

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.6.0 | 2026-03-27 | Amendment M05: Unificação visual ao stitch modelagem — topbar de dark (#111) para white com border-b h-16, sidebar de fixa 220px para colapsável (w-16 → w-56 hover), accent de laranja para azul (primary-600), backgrounds de warm beige para cool slate. Ref: DOC-UX-013-M06. |
| 1.5.0 | 2026-03-26 | Amendment M04: nova §2.2 Identidade Visual A1 — topbar dark #111, sidebar branca w-220 accent laranja, content bg #F5F5F3, skeleton states A1. Ref: Ux-Paginas.md, DOC-UX-013-M01. |
| 1.4.0 | 2026-03-25 | Amendment M03: nova §6.2 LogoutConfirmDialog obrigatório no Widget de Perfil — confirmação antes de logout, loading state, telemetria (DOC-UX-011-M03). |
| 1.3.0 | 2026-03-25 | Amendment M01 (Coming Soon): nova §8 — Rotas Pendentes (ComingSoonPage pattern), novo CA-09 (toda rota do sidebar DEVE ter route file). |
| 1.2.0 | 2026-03-25 | Amendment M02: Rota index obrigatória, proibição de formulários inline em route files, exceção window.location.href pós-login, novos CA-07 e CA-08. Lições do primeiro deploy em produção. |
| 1.1.0 | 2026-03-24 | Amendment M01: §2.2 Estratégia de Roteamento SPA, §3.3 Route Guards, CA-02 atualizado para Router Context, novos CA-05 e CA-06 |
| 1.0.0 | 2026-03-06 | Versão inicial |
