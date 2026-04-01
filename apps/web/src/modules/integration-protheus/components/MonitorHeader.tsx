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
      <div className="mb-6 grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="mb-6 grid grid-cols-4 gap-4">
      <div className="rounded-xl border bg-card px-6 py-4">
        <p className="text-xs text-muted-foreground">{COPY.metrics_label_total}</p>
        <p className="text-[28px] font-extrabold text-[#111]">{metrics.total}</p>
      </div>
      <div className="rounded-xl border bg-card px-6 py-4">
        <p className="text-xs text-muted-foreground">{COPY.metrics_label_success_rate}</p>
        <p className="text-[28px] font-extrabold text-emerald-600">{metrics.success_rate}%</p>
        <div className="mt-2 h-1 w-full rounded-full bg-[#E8E8E6]">
          <div
            className="h-1 rounded-full bg-[#27AE60]"
            style={{ width: `${Math.min(metrics.success_rate, 100)}%` }}
          />
        </div>
      </div>
      <div
        className={`rounded-xl border px-6 py-4 ${
          metrics.dlq > 0 ? 'border-[#F5C6CB] bg-[#FFEBEE]' : 'bg-card'
        }`}
      >
        <p className="text-xs text-muted-foreground">{COPY.metrics_label_dlq}</p>
        <p className={`text-[28px] font-extrabold ${metrics.dlq > 0 ? 'text-red-600' : 'text-[#111]'}`}>
          {metrics.dlq}
        </p>
        {metrics.dlq > 0 && (
          <p className="text-[10px] font-semibold text-[#C0392B]">requer atenção</p>
        )}
      </div>
      <div className="rounded-xl border bg-card px-6 py-4">
        <p className="text-xs text-muted-foreground">{COPY.metrics_label_avg_latency}</p>
        <p className="text-[28px] font-extrabold text-[#111]">
          {metrics.avg_latency_ms != null ? `${metrics.avg_latency_ms}ms` : '—'}
        </p>
      </div>
    </div>
  );
}
