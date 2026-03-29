/**
 * @contract FR-005, UX-DASH-001, UX-000-M02, BR-008, BR-009, BR-010, DOC-UX-011 §2.2
 *
 * Dashboard executivo pós-login.
 * - MetricCards (4 KPIs), DonutChart (distribuição), ActivityList (recentes)
 * - Skeleton com timeout 3s → estado de erro + retry (BR-009)
 * - Erro 5xx NÃO desconecta (BR-010)
 * - Dados mock nesta fase; integração com endpoints de contadores em FR futuro
 */

import { useState, useEffect, useRef, startTransition } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@shared/ui/skeleton';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/page-header';
import { MetricCard } from '../components/dashboard/MetricCard';
import { DonutChart, type DonutSegment } from '../components/dashboard/DonutChart';
import { ActivityList } from '../components/dashboard/ActivityList';
import type { ActivityItemProps } from '../components/dashboard/ActivityItem';
import { useAuthMe } from '../hooks/use-auth-me';
import { ApiError, generateCorrelationId } from '../api/api-client';

const SKELETON_TIMEOUT_MS = 3_000;

// ── Mock Data (UX-000-M02: valores estáticos nesta fase) ──

const METRICS = [
  { label: 'Processos Ativos', value: '12', dotColor: '#2E86C1', indicator: 'Em execução' },
  { label: 'Aprovações Pendentes', value: '08', valueColor: '#E67E22', dotColor: '#E67E22', indicator: 'Aguardando revisão' },
  { label: 'Usuários Ativos', value: '47', dotColor: '#27AE60', indicator: 'Base cadastrada' },
  { label: 'Agentes MCP', value: '05', valueColor: '#27AE60', dotColor: '#27AE60', indicator: 'Online e operando' },
] as const;

const DONUT_SEGMENTS: DonutSegment[] = [
  { label: 'Concluído', value: 29, color: '#27AE60' },
  { label: 'Andamento', value: 18, color: '#E67E22' },
  { label: 'Atrasado', value: 14, color: '#E74C3C' },
  { label: 'Planejado', value: 11, color: '#2E86C1' },
];

const ACTIVITIES: ActivityItemProps[] = [
  {
    dotColor: '#27AE60',
    actor: 'Carlos Silva',
    description: 'aprovou o processo',
    badge: { code: 'PR-0042' },
    timestamp: 'Hoje, 14:32',
  },
  {
    dotColor: '#2E86C1',
    actor: 'Ana Martins',
    description: 'criou nova modelagem',
    badge: { code: 'MOD-018' },
    timestamp: 'Hoje, 11:15',
  },
  {
    dotColor: '#E67E22',
    actor: 'Agente DocParser',
    description: 'processou 24 documentos em lote',
    timestamp: 'Hoje, 09:48',
  },
  {
    dotColor: '#E74C3C',
    actor: 'Sistema',
    description: 'detectou falha crítica no agente',
    badge: { code: 'MCP-003', variant: 'danger' },
    timestamp: 'Ontem, 18:20',
  },
];

// ── Skeleton ──

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 bg-a1-border" />
        <Skeleton className="mt-2 h-4 w-80 bg-a1-border" />
      </div>
      <div className="grid grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl bg-a1-border" />
        ))}
      </div>
      <div className="grid grid-cols-[5fr_7fr] gap-5">
        <Skeleton className="h-64 rounded-2xl bg-a1-border" />
        <Skeleton className="h-64 rounded-2xl bg-a1-border" />
      </div>
    </div>
  );
}

// ── ErrorState ──

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

// ── DashboardPage ──

export function DashboardPage() {
  const { data: user, isLoading, error, refetch, isRefetching } = useAuthMe('UX-DASH-001');
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // BR-009 — skeleton timeout 3s
  useEffect(() => {
    if (isLoading) {
      timerRef.current = setTimeout(() => {
        startTransition(() => setTimedOut(true));
        toast.error('Erro ao carregar dados. Tente novamente.', {
          description: `ID: ${generateCorrelationId()}`,
        });
      }, SKELETON_TIMEOUT_MS);
    } else {
      startTransition(() => setTimedOut(false));
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

  if (isLoading && !timedOut) return <DashboardSkeleton />;

  if (timedOut || (error && !(error instanceof ApiError && error.status === 401))) {
    return <ErrorState onRetry={handleRetry} isRetrying={isRefetching} />;
  }

  if (!user) return null;

  const donutTotal = DONUT_SEGMENTS.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        title="Dashboard"
        description="Visão geral em tempo real dos processos e agentes do sistema."
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Dashboard' },
        ]}
      />

      {/* Metric cards — 4 columns */}
      <div className="grid grid-cols-4 gap-5">
        {METRICS.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Second row — Donut (5fr) + Activities (7fr) */}
      <div className="grid grid-cols-[5fr_7fr] gap-5">
        <DonutChart
          title="Distribuição por Status"
          segments={DONUT_SEGMENTS}
          total={donutTotal}
        />
        <ActivityList
          title="Atividades Recentes"
          items={ACTIVITIES}
          onViewAll={() => {/* TODO: navigate to full activity log */}}
        />
      </div>
    </div>
  );
}
