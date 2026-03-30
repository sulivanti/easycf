/**
 * @contract FR-005, UX-DASH-001, DOC-UX-011 §2.2
 *
 * Dashboard executivo pós-login.
 * - MetricCards (4 KPIs), DonutChart (distribuição), ActivityList (recentes)
 * - Dados reais via API /dashboard/* (sem mock data)
 * - Skeleton por seção — falha parcial não bloqueia as demais
 * - Erro 5xx NÃO desconecta (BR-010)
 */

import { useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@shared/ui/skeleton';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/page-header';
import { MetricCard } from '../components/dashboard/MetricCard';
import { DonutChart, type DonutSegment } from '../components/dashboard/DonutChart';
import { ActivityList } from '../components/dashboard/ActivityList';
import type { ActivityItemProps } from '../components/dashboard/ActivityItem';
import {
  useDashboardMetrics,
  useDashboardDistribution,
  useDashboardActivities,
} from '../hooks/use-dashboard';

// ── Metric card configuration (labels + colors are static, values come from API) ──

const METRIC_CONFIG = [
  { key: 'active_cases', label: 'Processos Ativos', dotColor: '#2E86C1', indicator: 'Em execução' },
  { key: 'pending_approvals', label: 'Aprovações Pendentes', valueColor: '#E67E22', dotColor: '#E67E22', indicator: 'Aguardando revisão' },
  { key: 'active_users', label: 'Usuários Ativos', dotColor: '#27AE60', indicator: 'Base cadastrada' },
  { key: 'active_agents', label: 'Agentes MCP', valueColor: '#27AE60', dotColor: '#27AE60', indicator: 'Online e operando' },
] as const;

// ── Relative timestamp formatter ──

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMin / 60);

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (isToday) return `Hoje, ${time}`;
  if (isYesterday) return `Ontem, ${time}`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + `, ${time}`;
}

// ── Skeleton sections ──

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-2xl bg-a1-border" />
      ))}
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-[5fr_7fr] gap-5">
      <Skeleton className="h-64 rounded-2xl bg-a1-border" />
      <Skeleton className="h-64 rounded-2xl bg-a1-border" />
    </div>
  );
}

// ── ErrorBanner ──

function ErrorBanner({ message, onRetry, isRetrying }: { message: string; onRetry: () => void; isRetrying: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-a1-border bg-status-error-bg px-4 py-3">
      <span className="font-display text-[13px] text-danger-600">{message}</span>
      <Button variant="outline" size="sm" onClick={onRetry} isLoading={isRetrying}>
        <RefreshCw className="mr-1 size-3.5" />
        Tentar novamente
      </Button>
    </div>
  );
}

// ── DashboardPage ──

export function DashboardPage() {
  const metrics = useDashboardMetrics();
  const distribution = useDashboardDistribution();
  const activities = useDashboardActivities();

  // Map API response → MetricCard props
  const metricCards = useMemo(() => {
    if (!metrics.data) return null;
    const data = metrics.data;
    return METRIC_CONFIG.map((cfg) => ({
      label: cfg.label,
      value: String(data[cfg.key as keyof typeof data] ?? 0).padStart(2, '0'),
      valueColor: 'valueColor' in cfg ? cfg.valueColor : undefined,
      dotColor: cfg.dotColor,
      indicator: cfg.indicator,
    }));
  }, [metrics.data]);

  // Map API response → DonutSegment[]
  const donutSegments: DonutSegment[] = distribution.data?.data ?? [];
  const donutTotal = distribution.data?.total ?? 0;

  // Map API response → ActivityItemProps[]
  const activityItems: ActivityItemProps[] = useMemo(() => {
    if (!activities.data) return [];
    return activities.data.data.map((a) => ({
      dotColor: a.dot_color,
      actor: a.actor,
      description: a.description,
      badge: a.badge
        ? { code: a.badge.code, variant: (a.badge.variant as 'normal' | 'danger') ?? undefined }
        : undefined,
      timestamp: formatRelativeTime(a.timestamp),
    }));
  }, [activities.data]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral em tempo real dos processos e agentes do sistema."
      />

      {/* Metric cards */}
      {metrics.isError && (
        <ErrorBanner
          message="Erro ao carregar métricas."
          onRetry={() => metrics.refetch()}
          isRetrying={metrics.isRefetching}
        />
      )}
      {metrics.isLoading ? (
        <MetricsSkeleton />
      ) : metricCards ? (
        <div className="grid grid-cols-4 gap-5">
          {metricCards.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
      ) : null}

      {/* Charts row */}
      {(distribution.isLoading || activities.isLoading) && !distribution.data && !activities.data ? (
        <ChartsSkeleton />
      ) : (
        <div className="grid grid-cols-[5fr_7fr] gap-5">
          {distribution.isError ? (
            <ErrorBanner
              message="Erro ao carregar distribuição."
              onRetry={() => distribution.refetch()}
              isRetrying={distribution.isRefetching}
            />
          ) : (
            <DonutChart
              title="Distribuição por Status"
              segments={donutSegments}
              total={donutTotal}
            />
          )}

          {activities.isError ? (
            <ErrorBanner
              message="Erro ao carregar atividades."
              onRetry={() => activities.refetch()}
              isRetrying={activities.isRefetching}
            />
          ) : (
            <ActivityList
              title="Atividades Recentes"
              items={activityItems}
              onViewAll={() => {/* TODO: navigate to full activity log */}}
            />
          )}
        </div>
      )}
    </div>
  );
}
