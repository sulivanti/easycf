---
title: "Componentes de UI para Autenticação — Logout, Perfil e Sessões"
version: 1.0
date_created: 2026-03-25
owner: ECF Core Team
tags: [frontend, auth, ui, backoffice-admin, MOD-001, MOD-000]
---

# Introduction

Especificação dos componentes de interface para gerenciamento de autenticação do usuário no shell do backoffice-admin: **ProfileWidget** (menu de usuário no header), **ProfileAvatar** (avatar reutilizável), **LogoutConfirmDialog** (confirmação de logout) e **ChangePasswordModal** (troca de senha). Estes componentes consomem endpoints já implementados no backend (MOD-000 Foundation) e hooks já disponíveis no frontend.

## 1. Purpose & Scope

### Propósito

Formalizar os contratos de UI para ações de autenticação do usuário — visualizar perfil, gerenciar sessões, alterar senha e deslogar — integrados ao shell do backoffice-admin.

### Escopo

| Incluso | Excluído | Futuro |
|---------|----------|--------|
| ProfileWidget (dropdown no header) | Tela de login/registro | Upload de avatar (PATCH /auth/me com file) |
| ProfileAvatar (componente reutilizável) | MFA setup/verify UI | Notificações de sessão expirada |
| LogoutConfirmDialog (confirmação) | Admin user management | Dark mode avatar theming |
| ChangePasswordModal (troca de senha) | Forgot/Reset password UI | Biometric auth |
| Integração com AppShell | | |

### Audiência

Desenvolvedores frontend trabalhando no módulo backoffice-admin (MOD-001).

### Estado atual

| Componente | Status | Arquivo |
|------------|--------|---------|
| AppShell | ✅ Implementado | `apps/web/src/modules/backoffice-admin/components/AppShell.tsx` |
| ProfileWidget | ✅ Implementado | `apps/web/src/modules/backoffice-admin/components/ProfileWidget.tsx` |
| ChangePasswordModal | ✅ Implementado | `apps/web/src/modules/backoffice-admin/components/ChangePasswordModal.tsx` |
| ProfileAvatar | ⚠️ Inline no ProfileWidget | Extrair como componente reutilizável |
| LogoutConfirmDialog | ❌ Não existe | Logout é executado sem confirmação |

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| **ProfileWidget** | Componente dropdown no header do AppShell que exibe avatar, nome e menu de ações do usuário |
| **ProfileAvatar** | Componente reutilizável que renderiza avatar circular (imagem ou iniciais) |
| **LogoutConfirmDialog** | Dialog modal de confirmação antes de executar logout |
| **AppShell** | Layout wrapper do backoffice-admin com sidebar, header e área de conteúdo |
| **AuthMeResponse** | Tipo TypeScript do response de `GET /auth/me` |
| **Kill-switch** | Revogação de todas as sessões ativas do usuário |
| **Telemetria** | UIActionEnvelope emitido para rastreabilidade (DOC-ARC-003) |
| **RFC 9457** | Problem Details for HTTP APIs — formato padrão de erro |

## 3. Requirements, Constraints & Guidelines

### Componentes existentes (já implementados)

#### ProfileWidget

- **REQ-PW-001**: Exibe avatar do usuário (imagem ou iniciais) + nome no header do AppShell
- **REQ-PW-002**: Ao clicar, abre dropdown com informações do usuário (nome, email, tenant)
- **REQ-PW-003**: Menu inclui opções: "Meu Perfil" (`/profile`), "Sessões Ativas" (`/sessoes`), "Alterar Senha" (abre modal), "Sair" (executa logout)
- **REQ-PW-004**: Consome dados do hook `useAuthMe` (query key `['auth', 'me']`, staleTime 30s)
- **REQ-PW-005**: Exibe skeleton durante loading do `useAuthMe`
- **REQ-PW-006**: Função `getInitials(name)` extrai iniciais do nome para fallback de avatar

#### ChangePasswordModal

- **REQ-CP-001**: Modal com 3 campos: senha atual, nova senha, confirmação
- **REQ-CP-002**: Toggle de visibilidade por campo (ícone olho)
- **REQ-CP-003**: Validação client-side: `PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/`
- **REQ-CP-004**: Nova senha deve diferir da atual
- **REQ-CP-005**: Confirmação deve ser igual à nova senha
- **REQ-CP-006**: Auto-focus no campo com erro (resposta 422)
- **REQ-CP-007**: Limpa todos os campos ao fechar (segurança)
- **REQ-CP-008**: Toast de sucesso + fecha dialog + invalida `['auth', 'me']` no 200
- **REQ-CP-009**: Exibe mensagem de erro RFC 9457 (detail) no campo correlato

### Componentes a implementar

#### ProfileAvatar (extrair do ProfileWidget)

- **REQ-PA-001**: Componente reutilizável com props: `name: string`, `avatarUrl: string | null`, `size: 'sm' | 'md' | 'lg'`
- **REQ-PA-002**: Quando `avatarUrl` existe, renderiza `<img>` circular com `object-cover`
- **REQ-PA-003**: Quando `avatarUrl` é `null`, renderiza círculo com iniciais do nome (máximo 2 caracteres)
- **REQ-PA-004**: Cor de fundo determinística baseada em hash do nome (consistente entre renderizações)
- **REQ-PA-005**: Tamanhos mapeados: `sm` = 32px (h-8 w-8), `md` = 40px (h-10 w-10), `lg` = 56px (h-14 w-14)
- **REQ-PA-006**: Usa tokens de design (DOC-UX-013): `border-radius: rounded-full`, tipografia `font-medium`, cores `neutral-*`
- **REQ-PA-007**: Atributo `alt` obrigatório na `<img>` (acessibilidade)

#### LogoutConfirmDialog

- **REQ-LC-001**: Dialog modal acionado pelo botão "Sair" do ProfileWidget (substitui execução direta)
- **REQ-LC-002**: Título: "Confirmar saída"
- **REQ-LC-003**: Mensagem: "Tem certeza que deseja sair? Sua sessão será encerrada."
- **REQ-LC-004**: Botões: "Cancelar" (variant `outline`) e "Sair" (variant `destructive`)
- **REQ-LC-005**: Ao confirmar, chama `useLogout` mutation
- **REQ-LC-006**: Exibe estado de loading no botão "Sair" durante a mutation (spinner + texto "Saindo...")
- **REQ-LC-007**: Desabilita botões durante loading (previne double-click)
- **REQ-LC-008**: Emite telemetria: `screenId: 'UX-SHELL-001'`, `actionId: 'confirm_logout'`
- **REQ-LC-009**: Usa componentes `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `Button` de `@shared/ui/`
- **REQ-LC-010**: Fecha ao pressionar Escape (comportamento padrão do Dialog)

### Constraints

- **CON-001**: Todos os componentes DEVEM usar exclusivamente classes Tailwind dos tokens definidos em DOC-UX-013 — zero cores/tamanhos hardcoded
- **CON-002**: Importar componentes base exclusivamente de `@shared/ui/` (shadcn) — nunca duplicar
- **CON-003**: Composição de classes via `cn()` (clsx + tailwind-merge)
- **CON-004**: Sem `style={{}}` inline para layout, cor ou tipografia
- **CON-005**: ProfileAvatar DEVE ser exportado de `apps/web/src/modules/backoffice-admin/components/ProfileAvatar.tsx`
- **CON-006**: LogoutConfirmDialog DEVE ser exportado de `apps/web/src/modules/backoffice-admin/components/LogoutConfirmDialog.tsx`

### Guidelines

- **GUD-001**: Preferir composição sobre herança — ProfileWidget compõe ProfileAvatar e LogoutConfirmDialog
- **GUD-002**: Loading states devem usar `<Skeleton>` de `@shared/ui/` (consistente com AppShell)
- **GUD-003**: Feedback de ações via `sonner` toast (padrão do projeto)
- **GUD-004**: Suporte a dark mode via variante `dark:` do Tailwind

## 4. Interfaces & Data Contracts

### Backend Endpoints Consumidos

| Endpoint | Método | Hook Frontend | Contrato |
|----------|--------|---------------|----------|
| `/auth/me` | GET | `useAuthMe()` | FR-004 |
| `/auth/me` | PATCH | `useProfile().updateProfile` | FR-004 |
| `/auth/logout` | POST | `useLogout()` | FR-001 |
| `/auth/change-password` | POST | `useChangePassword()` | FR-005 |
| `/auth/sessions` | GET | `useSessions()` | FR-002 |
| `/auth/sessions/:id` | DELETE | `useSessions().revokeSession` | FR-002 |
| `/auth/sessions` | DELETE | `useSessions().revokeAll` | FR-002 |

### Tipos TypeScript

```typescript
// apps/web/src/modules/backoffice-admin/types/backoffice-admin.types.ts

interface Tenant {
  id: string;
  name: string;
}

interface AuthMeResponse {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  tenant: Tenant;
  scopes: string[];
}
```

### ProfileAvatar Props

```typescript
interface ProfileAvatarProps {
  name: string;
  avatarUrl: string | null;
  size?: 'sm' | 'md' | 'lg';  // default: 'md'
  className?: string;           // classes adicionais via cn()
}
```

### LogoutConfirmDialog Props

```typescript
interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

### Algoritmo de Cor Determinística (ProfileAvatar)

```typescript
// Paleta de cores de fundo para avatares sem imagem
const AVATAR_COLORS = [
  'bg-primary-100 text-primary-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-cyan-100 text-cyan-700',
] as const;

function getAvatarColor(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}
```

## 5. Acceptance Criteria

- **AC-001**: Given um usuário autenticado, When o AppShell renderiza, Then o ProfileWidget exibe o avatar e nome do usuário no header
- **AC-002**: Given `avatar_url` é `null`, When o ProfileAvatar renderiza, Then exibe as iniciais do nome em um círculo colorido determinístico
- **AC-003**: Given `avatar_url` é uma URL válida, When o ProfileAvatar renderiza, Then exibe a imagem circular com `alt` contendo o nome
- **AC-004**: Given o usuário clica no ProfileWidget, When o dropdown abre, Then exibe nome, email, tenant e as opções de menu
- **AC-005**: Given o usuário clica em "Meu Perfil", When a navegação ocorre, Then redireciona para `/profile`
- **AC-006**: Given o usuário clica em "Sessões Ativas", When a navegação ocorre, Then redireciona para `/sessoes`
- **AC-007**: Given o usuário clica em "Sair", When o LogoutConfirmDialog abre, Then exibe título, mensagem e botões "Cancelar" e "Sair"
- **AC-008**: Given o LogoutConfirmDialog está aberto, When o usuário clica "Cancelar", Then o dialog fecha sem executar logout
- **AC-009**: Given o LogoutConfirmDialog está aberto, When o usuário confirma "Sair", Then chama `POST /auth/logout`, limpa tokens e redireciona para `/login`
- **AC-010**: Given a mutation de logout está em progresso, When o botão "Sair" do dialog é exibido, Then mostra spinner + "Saindo..." e desabilita ambos botões
- **AC-011**: Given o usuário clica em "Alterar Senha", When o ChangePasswordModal abre, Then exibe 3 campos de senha com toggles de visibilidade
- **AC-012**: Given o ProfileAvatar recebe `size='sm'`, When renderiza, Then tem dimensões 32x32px (h-8 w-8)

## 6. Test Automation Strategy

### Níveis de Teste

| Nível | Escopo | Framework |
|-------|--------|-----------|
| Unit | ProfileAvatar (renderização, iniciais, cores) | Vitest + React Testing Library |
| Unit | LogoutConfirmDialog (open/close, callbacks) | Vitest + React Testing Library |
| Unit | getInitials, getAvatarColor (funções puras) | Vitest |
| Integration | ProfileWidget + useAuthMe + dropdown | Vitest + MSW (mock API) |
| E2E | Fluxo completo: login → profile → logout | Playwright |

### Casos de Teste Prioritários

1. **ProfileAvatar** renderiza imagem quando `avatarUrl` fornecido
2. **ProfileAvatar** renderiza iniciais quando `avatarUrl` é `null`
3. **ProfileAvatar** gera cor consistente para o mesmo nome
4. **ProfileAvatar** respeita prop `size`
5. **LogoutConfirmDialog** chama `onOpenChange(false)` ao cancelar
6. **LogoutConfirmDialog** chama mutation de logout ao confirmar
7. **LogoutConfirmDialog** desabilita botões durante loading
8. **ProfileWidget** exibe skeleton durante loading do `useAuthMe`
9. **ProfileWidget** abre dropdown com todas as opções de menu
10. **ChangePasswordModal** valida regex de senha e exibe erros

## 7. Rationale & Context

### Por que extrair ProfileAvatar?

A lógica de renderização de avatar (imagem vs iniciais, cores determinísticas) está embutida no ProfileWidget. Extrair como componente reutilizável permite:
- Uso em outros contextos (lista de usuários, comentários, audit log)
- Teste unitário isolado das funções de hash/iniciais
- Consistência visual garantida

### Por que adicionar LogoutConfirmDialog?

Atualmente o logout é executado diretamente ao clicar "Sair", sem confirmação. Isso pode causar logout acidental, especialmente em dispositivos móveis onde toques errados são comuns. O dialog de confirmação:
- Previne logout acidental
- Permite ao usuário cancelar a ação
- Dá feedback visual durante a operação (loading state)
- É padrão UX estabelecido para ações destrutivas/irreversíveis

### Por que não criar componentes novos de sessões e perfil?

As páginas `ProfilePage.tsx` e `SessionsPage.tsx` já existem no módulo foundation (MOD-000) e são funcionais. O escopo desta spec foca nos componentes do shell (header) que dão acesso a essas páginas.

## 8. Dependencies & External Integrations

### Módulos Internos

- **MOD-000 (Foundation)**: Hooks (`useProfile`, `useSessions`, `useChangePassword`), API client (`auth.api.ts`), types, pages (ProfilePage, SessionsPage)
- **MOD-001 (Backoffice Admin)**: Hooks (`useLogout`, `useAuthMe`), AppShell, ProfileWidget, ChangePasswordModal

### Componentes @shared/ui/ (shadcn)

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuTrigger`
- `Button`
- `Skeleton`
- `Avatar`, `AvatarImage`, `AvatarFallback` (se disponível no shadcn instalado)

### Bibliotecas

- `@tanstack/react-query` — cache e mutations
- `react-router-dom` — navegação (`useNavigate`)
- `sonner` — toast notifications
- `lucide-react` — ícones (User, LogOut, Shield, Key, Settings)

## 9. Examples & Edge Cases

### Edge Case: Nome com uma única palavra

```typescript
getInitials("Admin")    // → "A"  (uma inicial apenas)
getInitials("João Silva") // → "JS" (duas iniciais)
getInitials("")          // → ""  (string vazia — ProfileAvatar deve tratar)
```

### Edge Case: Avatar URL inválida

```tsx
// A tag <img> deve ter onError handler para fallback para iniciais
<img
  src={avatarUrl}
  alt={name}
  onError={(e) => {
    e.currentTarget.style.display = 'none';
    // Mostrar fallback de iniciais
  }}
/>
```

### Edge Case: Logout falha (rede)

O hook `useLogout` já trata isso: `onSettled` (não `onSuccess`) limpa estado e redireciona. Mesmo que o `POST /auth/logout` falhe, o client-side limpa tokens e redireciona — a sessão expira naturalmente no backend pelo TTL.

### Edge Case: `useAuthMe` retorna 401

O AppShell já intercepta 401 e redireciona para `/login`. O ProfileWidget não precisa tratar este caso independentemente.

### Exemplo de Composição Final

```tsx
// ProfileWidget.tsx (atualizado)
import { ProfileAvatar } from './ProfileAvatar';
import { LogoutConfirmDialog } from './LogoutConfirmDialog';

function ProfileWidget() {
  const { data: user, isLoading } = useAuthMe();
  const [logoutOpen, setLogoutOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-10 w-10 rounded-full" />;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <ProfileAvatar
            name={user.name}
            avatarUrl={user.avatar_url}
            size="md"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* ... menu items ... */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setLogoutOpen(true)}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
      />
    </>
  );
}
```

## 10. Validation Criteria

- [ ] ProfileAvatar renderiza corretamente com imagem, iniciais e todos os 3 tamanhos
- [ ] ProfileAvatar gera cores determinísticas (mesmo nome → mesma cor entre renders/sessões)
- [ ] LogoutConfirmDialog abre ao clicar "Sair" no dropdown
- [ ] LogoutConfirmDialog executa logout apenas ao confirmar
- [ ] LogoutConfirmDialog mostra loading state durante mutation
- [ ] ProfileWidget exibe skeleton durante loading
- [ ] ProfileWidget dropdown contém todas as opções de menu
- [ ] ChangePasswordModal valida senha conforme regex
- [ ] Nenhuma cor/tamanho hardcoded — apenas tokens Tailwind (DOC-UX-013)
- [ ] Todos os componentes importados de `@shared/ui/`
- [ ] Telemetria emitida para ações de logout (UIActionEnvelope)
- [ ] Testes unitários cobrem ProfileAvatar e LogoutConfirmDialog

## 11. Related Specifications / Further Reading

- [DOC-FND-000 — Foundation](../01_normativos/DOC-FND-000__Foundation.md) — Auth flow, RBAC, domain events
- [DOC-UX-013 — Design System e Tokens Visuais](../01_normativos/DOC-UX-013__Design_System_e_Tokens_Visuais.md) — Tokens, componentes, anti-patterns
- [DOC-ARC-003 — Rastreabilidade](../01_normativos/DOC-ARC-003__Ponte_de_Rastreabilidade.md) — UIActionEnvelope, telemetria
- [FR-000-C02 — GET /auth/me endpoint](../04_modules/mod-000-foundation/amendments/fr/FR-000-C02.md) — Shape do response
- [FR-000-C05 — JWT tenant/scopes](../04_modules/mod-000-foundation/amendments/fr/FR-000-C05.md) — Token payload
- [spec-fix-auth-flow-session-expired](spec-fix-auth-flow-session-expired.md) — Fix JWT payload
