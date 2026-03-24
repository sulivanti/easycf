/**
 * @contract FR-005, UX-DASH-001, BR-008, BR-009, BR-010
 *
 * Dashboard executivo pós-login.
 * - WelcomeWidget (saudação por horário local) + ModuleShortcuts (cards por scopes)
 * - Skeleton com timeout 3s → estado de erro + retry (BR-009)
 * - Erro 5xx NÃO desconecta (BR-010)
 * - Dados exclusivamente de auth_me via React Query (BR-008)
 */

import { useState, useEffect, useRef, startTransition } from 'react';
import { Link } from '@tanstack/react-router';
import { Users, Shield, Building, Activity, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@shared/ui/skeleton';
import { Button } from '@shared/ui/button';
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
};

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full rounded-lg" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WelcomeWidget
// ---------------------------------------------------------------------------

function WelcomeWidget({ name, tenantName }: { name: string; tenantName: string }) {
  return (
    <div className="rounded-lg bg-primary/5 p-5">
      <h1 className="text-xl font-bold text-foreground">{getGreeting(name)}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{tenantName}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ModuleShortcuts
// ---------------------------------------------------------------------------

function ModuleShortcuts({ cards }: { cards: ShortcutCard[] }) {
  if (cards.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Nenhum módulo disponível para seu perfil. Contate o administrador.
      </div>
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
            className="group rounded-lg border border-border bg-background p-4 transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
              {Icon ? <Icon className="size-5" /> : null}
            </div>
            <div className="text-sm font-semibold">{card.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{card.description}</div>
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
      <p className="mb-4 text-sm text-muted-foreground">Erro ao carregar dados. Tente novamente.</p>
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
    <div className="space-y-6">
      <WelcomeWidget name={user.name} tenantName={user.tenant.name} />
      <ModuleShortcuts cards={shortcuts} />
    </div>
  );
}
