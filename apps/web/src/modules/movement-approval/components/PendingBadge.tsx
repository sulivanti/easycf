/**
 * @contract UX-APROV-001
 * Sidebar badge showing pending approval count (polls every 60s via React Query).
 */

import { Badge } from '@shared/ui';
import { usePendingCount } from '../hooks/use-approvals.js';

interface PendingBadgeProps {
  className?: string;
}

export function PendingBadge({ className }: PendingBadgeProps) {
  const { data, isLoading } = usePendingCount();
  const count = data?.count ?? 0;

  if (isLoading || count === 0) return null;

  return (
    <Badge
      variant="destructive"
      className={className}
      aria-live="polite"
      title={`${count} aprovação(ões) pendente(s)`}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
}
