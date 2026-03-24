/**
 * @contract FR-004, UX-SHELL-001, BR-005, BR-003, BR-004
 *
 * Application Shell — layout wrapper das rotas autenticadas.
 * - Sidebar + Header + Breadcrumb + ContentArea (children)
 * - Sidebar filtrada por auth_me.scopes (BR-005)
 * - Skeleton durante loading de auth_me
 * - 401 → redirect /login via router
 * - Empty state Sidebar quando scopes=[] (PENDENTE-002 Opção B)
 */

import { useEffect, type ReactNode } from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Info, Users, Shield, Building, Activity, Settings, Cpu } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@shared/ui/skeleton';
import { useAuthMe } from '../hooks/use-auth-me';
import { filterSidebarByScopes } from './sidebar-config';
import { ProfileWidget } from './ProfileWidget';
import { ApiError } from '../api/api-client';
import type { SidebarGroup } from '../types/backoffice-admin.types';

interface Props {
  children: ReactNode;
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
    <nav className="w-60 shrink-0 border-r border-border bg-muted/40 p-4">
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    </nav>
  );
}

function HeaderSkeleton() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
      <Skeleton className="h-3.5 w-30" />
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-3.5 w-20" />
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function Sidebar({ scopes, currentPath }: { scopes: string[]; currentPath: string }) {
  const groups = filterSidebarByScopes(scopes);

  if (groups.length === 0) {
    return (
      <nav className="w-60 shrink-0 border-r border-border bg-muted/40 p-4">
        <div className="flex items-center gap-2 rounded-md p-3 text-muted-foreground text-sm">
          <Info className="size-4 shrink-0" />
          <span>Nenhum módulo configurado para seu perfil.</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-60 shrink-0 overflow-y-auto border-r border-border bg-muted/40 py-4">
      {groups.map((group: SidebarGroup) => (
        <div key={group.id} className="mb-4">
          <div className="mb-1 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </div>
          {group.items.map((item) => {
            const isActive = currentPath.startsWith(item.activeMatch);
            return (
              <Link
                key={item.id}
                to={item.route}
                className={`flex items-center gap-2 border-r-[3px] px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? 'border-primary bg-primary/5 font-medium text-primary'
                    : 'border-transparent text-foreground/70 hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <IconFor name={item.icon} className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  usuarios: 'Usuários',
  perfis: 'Perfis e Permissões',
  filiais: 'Filiais',
  auditoria: 'Auditoria',
};

function Breadcrumb({ currentPath }: { currentPath: string }) {
  const segments = currentPath.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: ROUTE_LABELS[seg] ?? seg,
    path: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <Link to="/dashboard" className="hover:text-foreground transition-colors">
        Início
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path}>
          <span className="mx-1.5">/</span>
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-foreground transition-colors">
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
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) {
      toast.error('Sua sessão expirou. Faça login novamente.', {
        description: error.correlationId ? `ID: ${error.correlationId}` : undefined,
      });
      navigate({ to: '/login' });
    } else if (error instanceof ApiError) {
      toast.error('Não foi possível carregar seu perfil. Tente novamente.', {
        description: error.correlationId ? `ID: ${error.correlationId}` : undefined,
      });
    }
  }, [error, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col">
        <HeaderSkeleton />
        <div className="flex flex-1">
          <SidebarSkeleton />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-base font-bold text-foreground">
            EasyCode
          </Link>
          <Breadcrumb currentPath={currentPath} />
        </div>
        <ProfileWidget user={user} isLoading={isLoading} />
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar scopes={user?.scopes ?? []} currentPath={currentPath} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
