/**
 * @contract UX-008-M01 §3
 *
 * Inline indicator with pulsing dot shown when there are RUNNING or QUEUED logs.
 */

interface AutoRefreshIndicatorProps {
  isActive: boolean;
}

export function AutoRefreshIndicator({ isActive }: AutoRefreshIndicatorProps) {
  if (!isActive) return null;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-[#2E86C1] animate-pulse" />
      <span className="text-xs font-medium text-[#2E86C1]">Atualizando...</span>
    </span>
  );
}
