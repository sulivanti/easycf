/**
 * @contract UX-000-M02, UX-DASH-001
 * Metric card — label uppercase, large value, colored dot indicator.
 */

import { cn } from '@shared/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  valueColor?: string;
  dotColor: string;
  indicator: string;
  className?: string;
}

function MetricCard({ label, value, valueColor, dotColor, indicator, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-a1-border bg-white p-6',
        className,
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[1px] text-a1-text-auxiliary">
        {label}
      </p>
      <p
        className="mt-2 font-display text-4xl font-extrabold leading-10"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </p>
      <div className="mt-2.5 flex items-center gap-1.5">
        <span
          className="inline-block size-2 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <span className="text-[11px] text-a1-text-hint">{indicator}</span>
      </div>
    </div>
  );
}

export { MetricCard };
export type { MetricCardProps };
