/**
 * @contract FR-005, UX-DASH-001, BR-008, BR-009, BR-010, DOC-UX-011 §2.2
 *
 * Dashboard executivo pós-login.
 * - WelcomeWidget (saudação por horário local) + ModuleShortcuts (cards por scopes)
 * - Skeleton com timeout 3s → estado de erro + retry (BR-009)
 * - Erro 5xx NÃO desconecta (BR-010)
 * - Dados exclusivamente de auth_me via React Query (BR-008)
 * - Visual A1: page header branco, cards com accent laranja (DOC-UX-011-M04)
 */

import { useState, useEffect, useRef, startTransition } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Users,
  Shield,
  Building,
  Activity,
  RefreshCw,
  Network,
  Workflow,
  Briefcase,
  Inbox,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@shared/ui/skeleton';
import { Button } from '@shared/ui/button';
import { EmptyState } from '@shared/ui/empty-state';
import { useAuthMe } from '../hooks/use-auth-me';
import { getGreeting } from '../components/greeting';
import { filterShortcutsByScopes } from '../components/shortcut-config';
import { ApiError, generateCorrelationId } from '../api/api-client';
import type { ShortcutCard } from '../types/backoffice-admin.types';

const SKELETON_TIMEOUT_MS = 3_000;

// ---------------------------------------------------------------------------
// Icon resolver
// ---------------------------------------------------------------------------

const SHORTCUT_ICONS: Record<string, React.ElementType> = {
  users: Users,
  shield: Shield,
  building: Building,
  activity: Activity,
  network: Network,
  workflow: Workflow,
  briefcase: Briefcase,
  inbox: Inbox,
};

// ---------------------------------------------------------------------------
// Skeleton (A1 theme)
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="-m-6">
      <div className="border-b border-a1-border bg-white px-6 py-4.5">
        <Skeleton className="h-6 w-64 bg-a1-border" />
        <Skeleton className="mt-2 h-4 w-40 bg-a1-border" />
      </div>
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-[10px] bg-a1-border" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WelcomeWidget (A1 page header style)
// ---------------------------------------------------------------------------

function WelcomeWidget({ name, tenantName }: { name: string; tenantName: string }) {
  return (
    <div className="border-b border-a1-border bg-white px-6 py-4.5">
      <h1 className="font-display text-xl font-bold tracking-[-0.4px] text-a1-text-primary">
        {getGreeting(name)}
      </h1>
      <p className="mt-0.5 font-display text-xs text-a1-text-hint">{tenantName}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ModuleShortcuts (A1 card grid)
// ---------------------------------------------------------------------------

function ModuleShortcuts({ cards }: { cards: ShortcutCard[] }) {
  if (cards.length === 0) {
    return (
      <EmptyState
        title="Nenhum módulo disponível"
        description="Nenhum módulo disponível para seu perfil. Contate o administrador."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = SHORTCUT_ICONS[card.icon];
        return (
          <Link
            key={card.id}
            to={card.route}
            className="group flex flex-col gap-3 rounded-[10px] border border-a1-border bg-white p-5 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary-600/10">
                {Icon ? <Icon className="size-[18px] stroke-primary-600" strokeWidth={1.8} /> : null}
              </div>
              <ChevronRight className="size-4 stroke-a1-text-placeholder transition-colors group-hover:stroke-a1-text-auxiliary" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-display text-[15px] font-bold text-a1-text-primary">
                {card.label}
              </div>
              <div className="font-display text-xs text-a1-text-hint">{card.description}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ErrorState
// ---------------------------------------------------------------------------

function ErrorState({ onRetry, isRetrying }: { onRetry: () => void; isRetrying: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="mb-4 font-display text-[13px] text-a1-text-auxiliary">
        Erro ao carregar dados. Tente novamente.
      </p>
      <Button onClick={onRetry} isLoading={isRetrying}>
        <RefreshCw className="size-4" />
        Tentar novamente
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DashboardPage
// ---------------------------------------------------------------------------

export function DashboardPage() {
  const { data: user, isLoading, error, refetch, isRefetching } = useAuthMe('UX-DASH-001');
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // BR-009 — skeleton timeout de 3s
  useEffect(() => {
    if (isLoading) {
      timerRef.current = setTimeout(() => {
        startTransition(() => {
          setTimedOut(true);
        });
        toast.error('Erro ao carregar dados. Tente novamente.', {
          description: `ID: ${generateCorrelationId()}`,
        });
      }, SKELETON_TIMEOUT_MS);
    } else {
      startTransition(() => {
        setTimedOut(false);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoading]);

  // BR-010 — 5xx NÃO desconecta
  useEffect(() => {
    if (error instanceof ApiError && error.status !== 401) {
      toast.error('Erro ao processar. Tente novamente.', {
        description: `ID: ${error.correlationId}`,
      });
    }
  }, [error]);

  function handleRetry() {
    setTimedOut(false);
    refetch();
  }

  if (isLoading && !timedOut) {
    return <DashboardSkeleton />;
  }

  if (timedOut || (error && !(error instanceof ApiError && error.status === 401))) {
    return <ErrorState onRetry={handleRetry} isRetrying={isRefetching} />;
  }

  if (!user) return null;

  const shortcuts = filterShortcutsByScopes(user.scopes);

  return (
    <div className="-m-6">
      <WelcomeWidget name={user.name} tenantName={user.tenant.name} />
      <div className="p-6">
        <ModuleShortcuts cards={shortcuts} />
      </div>
    </div>
  );
}
