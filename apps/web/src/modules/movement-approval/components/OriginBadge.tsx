/**
 * @contract UX-APROV-001
 * Badge displaying the origin of a movement (HUMAN, API, MCP, AGENT).
 */

import { Badge } from '@shared/ui';
import type { MovementOrigin } from '../types/movement-approval.types.js';

interface OriginBadgeProps {
  origin: MovementOrigin;
  className?: string;
}

const ORIGIN_CONFIG: Record<
  MovementOrigin,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  HUMAN: { label: 'Humano', variant: 'secondary' },
  API: { label: 'API', variant: 'outline' },
  MCP: { label: 'MCP', variant: 'default' },
  AGENT: { label: 'Agente', variant: 'destructive' },
};

export function OriginBadge({ origin, className }: OriginBadgeProps) {
  const config = ORIGIN_CONFIG[origin];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
