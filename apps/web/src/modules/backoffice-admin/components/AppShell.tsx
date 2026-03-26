/**
 * @contract FR-004, UX-SHELL-001, BR-005, BR-003, BR-004, DOC-UX-011 §2.2
 *
 * Application Shell — layout wrapper das rotas autenticadas.
 * - Sidebar + Header + Breadcrumb + ContentArea (children)
 * - Sidebar filtrada por auth_me.scopes (BR-005)
 * - Skeleton durante loading de auth_me
 * - 401 → redirect /login via router
 * - Empty state Sidebar quando scopes=[] (PENDENTE-002 Opção B)
 * - Visual A1: topbar dark, sidebar branca, accent laranja (DOC-UX-011-M04)
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
// A1 Logo SVG
// ---------------------------------------------------------------------------

function A1Logo() {
  return (
    <div className="flex size-[26px] shrink-0 items-center justify-center rounded-[5px] bg-a1-accent">
      <svg
        width="16"
        height="12"
        viewBox="0 0 16 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: '0' }}
      >
        <text
          x="0"
          y="11"
          fontFamily="Arial"
          fontSize="12"
          fontWeight="900"
          fontStyle="italic"
          fill="#FFFFFF"
        >
          <tspan>A</tspan>
          <tspan fill="#111111">1</tspan>
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
// Skeleton components (A1 theme)
// ---------------------------------------------------------------------------

function SidebarSkeleton() {
  return (
    <nav className="w-[220px] shrink-0 border-r border-a1-border bg-white p-4">
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full bg-a1-border" />
        ))}
      </div>
    </nav>
  );
}

function HeaderSkeleton() {
  return (
    <header className="flex h-13 shrink-0 items-center justify-between bg-a1-dark px-5">
      <div className="flex items-center gap-2.5">
        <Skeleton className="size-[26px] rounded-[5px] bg-white/10" />
        <Skeleton className="h-4 w-24 bg-white/10" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-20 bg-white/10" />
        <Skeleton className="size-[30px] rounded-full bg-white/10" />
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Sidebar (A1 theme)
// ---------------------------------------------------------------------------

function Sidebar({ scopes, currentPath }: { scopes: string[]; currentPath: string }) {
  const groups = filterSidebarByScopes(scopes);

  if (groups.length === 0) {
    return (
      <nav className="w-[220px] shrink-0 border-r border-a1-border bg-white p-4">
        <div className="flex items-center gap-2 rounded-md p-3 font-display text-[13px] text-a1-text-auxiliary">
          <Info className="size-4 shrink-0" />
          <span>Nenhum módulo configurado para seu perfil.</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-[220px] shrink-0 overflow-y-auto border-r border-a1-border bg-white px-2.5 py-4">
      {groups.map((group: SidebarGroup, groupIdx: number) => (
        <div key={group.id}>
          {groupIdx > 0 && <div className="mx-0 mb-3.5 mt-1 h-px bg-a1-border-light" />}
          <div className="mb-5">
            <div className="mb-1.5 px-2 font-display text-[9px] font-bold uppercase tracking-[1.4px] text-a1-text-placeholder">
              {group.label}
            </div>
            <div className="flex flex-col gap-px">
              {group.items.map((item) => {
                const isActive = currentPath.startsWith(item.activeMatch);
                return (
                  <Link
                    key={item.id}
                    to={item.route}
                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 font-display text-[13px] transition-colors ${
                      isActive
                        ? 'border-l-[2.5px] border-l-a1-accent bg-a1-active-bg font-bold text-a1-accent'
                        : 'border-l-[2.5px] border-l-transparent text-a1-text-auxiliary hover:bg-a1-bg'
                    }`}
                  >
                    <IconFor
                      name={item.icon}
                      className={`size-3.5 ${isActive ? 'stroke-a1-accent' : 'stroke-a1-text-muted-icon'}`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Breadcrumb (A1 dark topbar variant)
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
  const crumbs = segments.map((seg, i) => ({
    label: ROUTE_LABELS[seg] ?? seg,
    path: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-display text-xs">
      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-1.5">
          <span className="text-a1-text-secondary">/</span>
          {crumb.isLast ? (
            <span className="font-semibold text-white">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="text-a1-text-tertiary transition-colors hover:text-white">
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
          <main className="flex-1 overflow-auto bg-a1-bg p-6">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col font-display">
      {/* Header — A1 dark topbar */}
      <header className="sticky top-0 z-50 flex h-13 shrink-0 items-center bg-a1-dark">
        {/* Logo zone */}
        <div className="flex w-[220px] shrink-0 items-center gap-2.5 border-r border-r-[#1E1E1E] px-5">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <A1Logo />
            <div className="flex flex-col gap-px">
              <span className="font-display text-[13px] font-bold tracking-[-0.2px] text-white">
                Grupo A1
              </span>
              <span className="font-display text-[10px] text-[#444444]">
                Portal Interno
              </span>
            </div>
          </Link>
        </div>

        {/* Breadcrumb zone */}
        <div className="flex flex-1 items-center px-5">
          <Breadcrumb currentPath={currentPath} />
        </div>

        {/* Profile zone */}
        <div className="flex items-center px-5">
          <ProfileWidget user={user} isLoading={isLoading} variant="dark" />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar scopes={user?.scopes ?? []} currentPath={currentPath} />
        <main className="flex-1 overflow-auto bg-a1-bg p-6">{children}</main>
      </div>
    </div>
  );
}
