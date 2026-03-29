/**
 * @contract FR-004, UX-SHELL-001, BR-005, BR-003, BR-004, DOC-UX-011 §2.2, SPEC-THEME-001
 *
 * Application Shell — layout wrapper das rotas autenticadas.
 * - Sidebar 240px FIXA com labels visíveis, categorias, footer com avatar
 * - Topbar branca 64px: logo A1 + "Grupo A1"/"PORTAL INTERNO" + breadcrumb + sino + empresa
 * - Sidebar filtrada por auth_me.scopes (BR-005)
 * - Skeleton durante loading de auth_me
 * - 401 → redirect /login via router
 * - Visual: SPEC-THEME-001 §4 (Layout Shell)
 */

import { useEffect, type ReactNode } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  Info,
  Users,
  Shield,
  Building,
  Activity,
  Settings,
  Cpu,
  Network,
  Fingerprint,
  Workflow,
  Briefcase,
  SlidersHorizontal,
  Plug,
  Inbox,
  Bot,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@shared/ui/skeleton';
import { useAuthMe } from '../hooks/use-auth-me';
import { filterSidebarByScopes } from './sidebar-config';
import { ProfileWidget } from './ProfileWidget';
import { ApiError } from '../api/api-client';
import { forceLogout } from '@modules/foundation/utils/force-logout';
import type { SidebarGroup } from '../types/backoffice-admin.types';

interface Props {
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// A1 Logo SVG — SPEC-THEME-001 §5
// ---------------------------------------------------------------------------

function A1Logo() {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-primary-600">
      <svg
        width="20"
        height="15"
        viewBox="0 0 20 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: '0' }}
      >
        <text
          x="0"
          y="14"
          fontFamily="Arial"
          fontSize="16"
          fontWeight="900"
          fontStyle="italic"
          fill="#FFFFFF"
        >
          <tspan>A</tspan>
          <tspan fill="#FFFFFF">1</tspan>
        </text>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icon resolver
// ---------------------------------------------------------------------------

const ICONS: Record<string, React.ElementType> = {
  users: Users,
  shield: Shield,
  building: Building,
  activity: Activity,
  settings: Settings,
  cpu: Cpu,
  network: Network,
  fingerprint: Fingerprint,
  workflow: Workflow,
  briefcase: Briefcase,
  sliders: SlidersHorizontal,
  plug: Plug,
  inbox: Inbox,
  bot: Bot,
};

function IconFor({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------

function SidebarSkeleton() {
  return (
    <nav className="w-60 shrink-0 border-r border-a1-border bg-white px-3 py-4">
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md bg-neutral-200" />
        ))}
      </div>
    </nav>
  );
}

function HeaderSkeleton() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-a1-border bg-white px-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-[10px] bg-neutral-200" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20 bg-neutral-200" />
          <Skeleton className="h-2.5 w-28 bg-neutral-200" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-20 bg-neutral-200" />
        <Skeleton className="size-8 rounded-full bg-neutral-200" />
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Sidebar — 240px fixa, labels visíveis, categorias, footer avatar
// SPEC-THEME-001 §4.1
// ---------------------------------------------------------------------------

function Sidebar({
  scopes,
  currentPath,
  userName,
  userEmail,
}: {
  scopes: string[];
  currentPath: string;
  userName?: string;
  userEmail?: string;
}) {
  const groups = filterSidebarByScopes(scopes);

  if (groups.length === 0) {
    return (
      <nav className="flex w-60 shrink-0 flex-col border-r border-a1-border bg-white px-3 py-4">
        <div className="flex items-center gap-2 rounded-md p-3 font-display text-[13px] text-a1-text-auxiliary">
          <Info className="size-4 shrink-0" />
          <span>Nenhum módulo configurado para seu perfil.</span>
        </div>
      </nav>
    );
  }

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '??';

  return (
    <nav className="flex w-60 shrink-0 flex-col overflow-y-auto border-r border-a1-border bg-white px-3 py-4">
      <div className="flex-1">
        {groups.map((group: SidebarGroup, groupIdx: number) => (
          <div key={group.id}>
            {groupIdx > 0 && <div className="mx-0 mb-3.5 mt-1 h-px bg-neutral-100" />}
            <div className="mb-5">
              <div className="mb-1.5 px-3 font-display text-[9px] font-bold uppercase tracking-[1.4px] text-a1-text-hint">
                {group.label}
              </div>
              <div className="flex flex-col gap-px">
                {group.items.map((item) => {
                  const isActive = currentPath.startsWith(item.activeMatch);
                  return (
                    <Link
                      key={item.id}
                      to={item.route}
                      className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 font-display text-[13px] transition-colors ${
                        isActive
                          ? 'bg-primary-50 font-bold text-primary-600'
                          : 'text-a1-text-auxiliary hover:bg-neutral-50'
                      }`}
                    >
                      <IconFor
                        name={item.icon}
                        className={`size-4 shrink-0 ${isActive ? 'stroke-primary-600' : 'stroke-neutral-400'}`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer — user block */}
      <div className="mt-auto border-t border-a1-border pt-4">
        <div className="flex items-center gap-2.5 px-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-600 font-display text-[11px] font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-[12px] font-bold text-a1-text-primary">
              {userName ?? 'Carregando...'}
            </div>
            <div className="truncate font-display text-[11px] text-a1-text-auxiliary">
              {userEmail ?? ''}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Breadcrumb — SPEC-THEME-001 §3.3
// ---------------------------------------------------------------------------

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  usuarios: 'Usuários',
  perfis: 'Perfis e Permissões',
  filiais: 'Filiais',
  auditoria: 'Auditoria',
  profile: 'Meu Perfil',
  sessoes: 'Sessões Ativas',
  'org-units': 'Estrutura Organizacional',
  identity: 'Identidade',
  'org-scope': 'Escopos Organizacionais',
  delegations: 'Compartilhamentos',
  processos: 'Processos',
  ciclos: 'Ciclos',
  editor: 'Editor',
  cases: 'Casos',
  framers: 'Enquadradores',
  routines: 'Rotinas',
  integration: 'Integrações',
  monitor: 'Monitor',
  approvals: 'Aprovações',
  inbox: 'Caixa de Entrada',
  config: 'Configuração',
  mcp: 'Automação',
  agents: 'Agentes',
  executions: 'Execuções',
  form: 'Formulário',
};

function Breadcrumb({ currentPath }: { currentPath: string }) {
  const segments = currentPath.split('/').filter(Boolean);
  const crumbs = [
    { label: 'Início', path: '/dashboard', isLast: false },
    ...segments.map((seg, i) => ({
      label: ROUTE_LABELS[seg] ?? seg,
      path: '/' + segments.slice(0, i + 1).join('/'),
      isLast: i === segments.length - 1,
    })),
  ];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-display text-[13px]">
      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-1.5">
          {crumb !== crumbs[0] && <span className="text-a1-text-placeholder">›</span>}
          {crumb.isLast ? (
            <span className="font-bold text-a1-text-primary">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className="text-a1-text-auxiliary transition-colors hover:text-a1-text-primary"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// AppShell
// ---------------------------------------------------------------------------

export function AppShell({ children }: Props) {
  const { data: user, isLoading, error } = useAuthMe();
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) {
      toast.error('Sua sessão expirou. Faça login novamente.', {
        id: 'session-expired',
        description: error.correlationId ? `ID: ${error.correlationId}` : undefined,
      });
      forceLogout(queryClient);
      return;
    } else if (error instanceof ApiError) {
      toast.error('Não foi possível carregar seu perfil. Tente novamente.', {
        description: error.correlationId ? `ID: ${error.correlationId}` : undefined,
      });
    }
  }, [error, queryClient]);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col font-display">
        <HeaderSkeleton />
        <div className="flex flex-1">
          <SidebarSkeleton />
          <main className="flex-1 overflow-auto bg-bg-page p-8">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col font-display">
      {/* Header — white topbar 64px, SPEC-THEME-001 §4.2 */}
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center border-b border-a1-border bg-white">
        {/* Logo zone — logo + branding text */}
        <div className="flex items-center gap-3 px-5">
          <Link to="/dashboard" className="flex items-center">
            <A1Logo />
          </Link>
          <div className="flex flex-col">
            <span className="font-display text-[14px] font-extrabold text-a1-text-primary">
              Grupo A1
            </span>
            <span className="font-display text-[10px] font-semibold uppercase tracking-[1.2px] text-a1-text-auxiliary">
              PORTAL INTERNO
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-a1-border" />

        {/* Breadcrumb zone */}
        <div className="flex flex-1 items-center px-5">
          <Breadcrumb currentPath={currentPath} />
        </div>

        {/* Notifications + Company + Profile */}
        <div className="flex items-center gap-4 px-5">
          {/* Bell icon with red dot */}
          <button className="relative" aria-label="Notificações">
            <Bell className="size-[18px] stroke-a1-text-auxiliary" />
            <span className="absolute -right-0.5 -top-0.5 size-[7px] rounded-full bg-danger-500" />
          </button>

          {/* Company */}
          <span className="font-display text-[12px] font-medium text-a1-text-tertiary">
            Empresa: A1 Engenharia
          </span>

          {/* Profile widget */}
          <ProfileWidget user={user} isLoading={isLoading} variant="light" />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          scopes={user?.scopes ?? []}
          currentPath={currentPath}
          userName={user?.name}
          userEmail={user?.email}
        />
        <main className="flex-1 overflow-auto bg-bg-page p-8">{children}</main>
      </div>
    </div>
  );
}
