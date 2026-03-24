/**
 * @contract UX-008 §3.3, FR-011
 *
 * Metrics header cards: Total (24h), Success Rate, DLQ badge.
 */

import { Skeleton } from '@shared/ui';
import { COPY } from '../types/view-model.js';
import type { MetricsDTO } from '../types/integration-protheus.types.js';

interface MonitorHeaderProps {
  metrics: MetricsDTO | undefined;
  isLoading: boolean;
}

export function MonitorHeader({ metrics, isLoading }: MonitorHeaderProps) {
  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="mb-6 grid grid-cols-3 gap-4">
      <div className="rounded-lg border bg-card px-6 py-4">
        <p className="text-xs text-muted-foreground">{COPY.metrics_label_total}</p>
        <p className="text-3xl font-bold">{metrics.total}</p>
      </div>
      <div className="rounded-lg border bg-card px-6 py-4">
        <p className="text-xs text-muted-foreground">{COPY.metrics_label_success_rate}</p>
        <p className="text-3xl font-bold text-emerald-600">{metrics.success_rate}%</p>
      </div>
      <div
        className={`rounded-lg border px-6 py-4 ${metrics.dlq > 0 ? 'border-red-200 bg-red-50' : 'bg-card'}`}
      >
        <p className="text-xs text-muted-foreground">{COPY.metrics_label_dlq}</p>
        <p className={`text-3xl font-bold ${metrics.dlq > 0 ? 'text-red-600' : ''}`}>
          {metrics.dlq}
        </p>
      </div>
    </div>
  );
}
