/**
 * @contract UX-APROV-001
 * Movement card displaying code, operation, requester, value,
 * countdown timer, level indicator, and origin badge.
 */

import { Badge } from '@shared/ui';
import type { Movement, MovementStatus } from '../types/movement-approval.types.js';
import { OriginBadge } from './OriginBadge.js';
import { CountdownTimer } from './CountdownTimer.js';

interface MovementCardProps {
  movement: Movement;
  selected?: boolean;
  onSelect: (id: string) => void;
}

const STATUS_BADGE: Record<
  MovementStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  PENDING_APPROVAL: { label: 'Pendente', variant: 'outline' },
  APPROVED: { label: 'Aprovado', variant: 'default' },
  AUTO_APPROVED: { label: 'Auto-Aprovado', variant: 'default' },
  REJECTED: { label: 'Rejeitado', variant: 'destructive' },
  CANCELLED: { label: 'Cancelado', variant: 'secondary' },
  OVERRIDDEN: { label: 'Override', variant: 'destructive' },
  EXECUTED: { label: 'Executado', variant: 'default' },
  FAILED: { label: 'Falhou', variant: 'destructive' },
};

export function MovementCard({ movement, selected, onSelect }: MovementCardProps) {
  const statusCfg = STATUS_BADGE[movement.status] ?? {
    label: movement.status,
    variant: 'outline' as const,
  };

  return (
    <div
      className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent/50 ${
        selected ? 'border-primary bg-accent' : 'border-border bg-background'
      }`}
      onClick={() => onSelect(movement.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect(movement.id);
      }}
      aria-label={`Movimento ${movement.codigo}, ${movement.entity_type}, ${statusCfg.label}`}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-foreground">{movement.codigo}</span>
        <OriginBadge origin={movement.origin} />
      </div>

      {/* Body */}
      <div className="mb-3 space-y-1 text-sm text-muted-foreground">
        <div className="font-medium text-foreground">{movement.operation}</div>
        <div>Solicitante: {movement.requester_name}</div>
        {movement.value !== null && (
          <div>
            Valor: {movement.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          Nível {movement.current_level}/{movement.total_levels}
        </span>
        {movement.sla_deadline && movement.status === 'PENDING_APPROVAL' && (
          <CountdownTimer deadline={movement.sla_deadline} />
        )}
        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
      </div>
    </div>
  );
}
