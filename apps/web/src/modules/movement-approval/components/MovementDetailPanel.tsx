/**
 * @contract UX-APROV-001
 * Split-view detail panel for a selected movement.
 * Shows full metadata, approval chain progress, and action area.
 */

import { Badge, Skeleton } from '@shared/ui';
import type { MovementDetail, ApprovalInstance } from '../types/movement-approval.types.js';
import { OriginBadge } from './OriginBadge.js';
import { CountdownTimer } from './CountdownTimer.js';

interface MovementDetailPanelProps {
  movement: MovementDetail;
  loading?: boolean;
  currentUserId?: string;
  children?: React.ReactNode;
}

export function MovementDetailPanel({
  movement,
  loading,
  currentUserId,
  children,
}: MovementDetailPanelProps) {
  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const isRequester = currentUserId === movement.requester_id;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-foreground">{movement.codigo}</h2>
        <OriginBadge origin={movement.origin} />
        <Badge variant="outline">{movement.status}</Badge>
      </header>

      {/* Info */}
      <section className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <dt className="font-medium text-muted-foreground">Operação</dt>
        <dd className="text-foreground">{movement.operation}</dd>

        <dt className="font-medium text-muted-foreground">Entidade</dt>
        <dd className="text-foreground">
          {movement.entity_type} / {movement.entity_id}
        </dd>

        <dt className="font-medium text-muted-foreground">Solicitante</dt>
        <dd className="text-foreground">{movement.requester_name}</dd>

        {movement.value !== null && (
          <>
            <dt className="font-medium text-muted-foreground">Valor</dt>
            <dd className="text-foreground">
              {movement.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </dd>
          </>
        )}

        <dt className="font-medium text-muted-foreground">Criado em</dt>
        <dd className="text-foreground">{new Date(movement.created_at).toLocaleString('pt-BR')}</dd>

        {movement.sla_deadline && movement.status === 'PENDING_APPROVAL' && (
          <>
            <dt className="font-medium text-muted-foreground">Prazo SLA</dt>
            <dd>
              <CountdownTimer deadline={movement.sla_deadline} />
            </dd>
          </>
        )}
      </section>

      {/* Approval Chain */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Cadeia de Aprovação</h3>
        <ol className="space-y-2">
          {movement.approval_instances
            .sort((a, b) => a.level - b.level)
            .map((ai) => (
              <ApprovalInstanceItem key={ai.id} instance={ai} />
            ))}
        </ol>
      </section>

      {/* Segregation notice */}
      {isRequester && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Você é o solicitante deste movimento. A aprovação está bloqueada por segregação de
          funções.
        </div>
      )}

      {/* Override info */}
      {movement.override_reason && (
        <section className="rounded-md border border-border bg-muted/50 p-4">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Override</h3>
          <p className="text-sm text-foreground">{movement.override_reason}</p>
          <span className="mt-1 text-xs text-muted-foreground">Por: {movement.overridden_by}</span>
        </section>
      )}

      {/* Action area */}
      {children && <section className="border-t border-border pt-4">{children}</section>}
    </div>
  );
}

function ApprovalInstanceItem({ instance }: { instance: ApprovalInstance }) {
  const variant =
    instance.decision === 'APPROVED'
      ? 'default'
      : instance.decision === 'REJECTED'
        ? 'destructive'
        : ('outline' as const);

  return (
    <li className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
      <Badge variant={variant} className="shrink-0">
        Nível {instance.level}
      </Badge>
      <span className="text-sm font-medium text-foreground">{instance.decision ?? 'Pendente'}</span>
      {instance.approver_name && (
        <span className="text-sm text-muted-foreground">{instance.approver_name}</span>
      )}
      {instance.opinion && (
        <span className="truncate text-xs text-muted-foreground italic">
          &ldquo;{instance.opinion}&rdquo;
        </span>
      )}
      {instance.decided_at && (
        <span className="ml-auto text-xs text-muted-foreground">
          {new Date(instance.decided_at).toLocaleString('pt-BR')}
        </span>
      )}
    </li>
  );
}
