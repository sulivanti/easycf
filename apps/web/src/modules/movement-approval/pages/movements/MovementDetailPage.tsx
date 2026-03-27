/**
 * @contract UX-009 §31
 *
 * UX-APPROV-004: Detalhe do Movimento.
 * Two-column: info + cadeia de aprovação à esquerda, timeline à direita.
 * Override com justificativa ≥20 chars.
 * Route: /approvals/movements/:id
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldAlertIcon,
  ZapIcon,
  UserIcon,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button, Skeleton } from '@shared/ui';
import { PageHeader } from '@shared/ui/page-header';
import { StatusBadge, type StatusType } from '@shared/ui/status-badge';
import { FormField } from '@shared/ui/form-field';
import { httpClient } from '@modules/foundation/api/http-client.js';

// ── Types ────────────────────────────────────────────────────

type MovementStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'OVERRIDDEN' | 'AUTO_APPROVED';

interface ApprovalLevel {
  level: number;
  approvers: Array<{
    id: string;
    name: string;
    avatar_url?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    decided_at?: string;
  }>;
}

interface MovementDetail {
  id: string;
  codigo: string;
  tipo: string;
  objeto: string;
  valor: string;
  status: MovementStatus;
  solicitante: string;
  created_at: string;
  approval_chain: ApprovalLevel[];
  can_override: boolean;
}

interface TimelineEvent {
  id: string;
  type: 'ENGINE_EVAL' | 'APPROVAL' | 'REJECTION' | 'OVERRIDE' | 'EXECUTION' | 'AUTO_APPROVE';
  actor: string;
  description: string;
  timestamp: string;
}

const STATUS_MAP: Record<MovementStatus, { label: string; variant: StatusType }> = {
  PENDING_APPROVAL: { label: 'Pendente', variant: 'warning' },
  APPROVED: { label: 'Aprovado', variant: 'success' },
  REJECTED: { label: 'Rejeitado', variant: 'error' },
  OVERRIDDEN: { label: 'Override', variant: 'purple' },
  AUTO_APPROVED: { label: 'Auto-aprovado', variant: 'info' },
};

const TIMELINE_ICONS: Record<TimelineEvent['type'], typeof CheckCircleIcon> = {
  ENGINE_EVAL: ZapIcon,
  APPROVAL: CheckCircleIcon,
  REJECTION: XCircleIcon,
  OVERRIDE: ShieldAlertIcon,
  EXECUTION: CheckCircleIcon,
  AUTO_APPROVE: ZapIcon,
};

// ── Props ────────────────────────────────────────────────────

export interface MovementDetailPageProps {
  movementId: string;
}

// ── Component ────────────────────────────────────────────────

export function MovementDetailPage({ movementId }: MovementDetailPageProps) {
  const [detail, setDetail] = useState<MovementDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [justification, setJustification] = useState('');
  const [overrideLoading, setOverrideLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [d, t] = await Promise.all([
          httpClient.get<MovementDetail>(`/approvals/movements/${movementId}`),
          httpClient.get<TimelineEvent[]>(`/approvals/movements/${movementId}/timeline`),
        ]);
        if (!cancelled) {
          setDetail(d);
          setTimeline(t);
        }
      } catch {
        if (!cancelled) toast.error('Erro ao carregar detalhes do movimento.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [movementId]);

  async function handleOverride() {
    if (justification.length < 20) return;
    setOverrideLoading(true);
    try {
      await httpClient.post(`/approvals/movements/${movementId}/override`, {
        justification,
      });
      toast.success('Override realizado com sucesso.');
      // Reload detail
      const d = await httpClient.get<MovementDetail>(`/approvals/movements/${movementId}`);
      setDetail(d);
      setJustification('');
    } catch {
      toast.error('Erro ao realizar override.');
    } finally {
      setOverrideLoading(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-[var(--space-lg)]">
        <Skeleton className="h-8 w-64 rounded-md" />
        <div className="grid grid-cols-1 gap-[var(--space-lg)] lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="py-12 text-center text-a1-text-auxiliary">Movimento não encontrado.</div>
    );
  }

  const st = STATUS_MAP[detail.status];

  return (
    <div className="space-y-[var(--space-lg)]">
      <PageHeader
        title={`Movimento ${detail.codigo}`}
        breadcrumbs={[
          { label: 'Aprovação', href: '/approvals/inbox' },
          { label: 'Movimentos', href: '/approvals/movements' },
          { label: detail.codigo },
        ]}
        actions={
          <Link to="/approvals/movements">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="mr-1.5 size-4" />
              Voltar
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-[var(--space-lg)] lg:grid-cols-3">
        {/* Left Column — Detail + Approval Chain */}
        <div className="space-y-[var(--space-lg)] lg:col-span-2">
          {/* Movement Info Card */}
          <div className="rounded-lg border border-a1-border bg-white p-[var(--space-lg)]">
            <div className="mb-[var(--space-md)] flex items-center gap-[var(--space-sm)]">
              <h2 className="font-display text-lg font-bold text-a1-text-primary">
                {detail.codigo}
              </h2>
              <StatusBadge status={st.variant}>{st.label}</StatusBadge>
            </div>
            <dl className="grid grid-cols-2 gap-x-[var(--space-lg)] gap-y-[var(--space-sm)] text-sm">
              <div>
                <dt className="font-display text-[length:var(--type-label)] font-semibold uppercase tracking-wide text-a1-text-tertiary">
                  Tipo
                </dt>
                <dd className="text-a1-text-primary">{detail.tipo}</dd>
              </div>
              <div>
                <dt className="font-display text-[length:var(--type-label)] font-semibold uppercase tracking-wide text-a1-text-tertiary">
                  Objeto
                </dt>
                <dd className="text-a1-text-primary">{detail.objeto}</dd>
              </div>
              <div>
                <dt className="font-display text-[length:var(--type-label)] font-semibold uppercase tracking-wide text-a1-text-tertiary">
                  Valor
                </dt>
                <dd className="text-a1-text-primary">{detail.valor}</dd>
              </div>
              <div>
                <dt className="font-display text-[length:var(--type-label)] font-semibold uppercase tracking-wide text-a1-text-tertiary">
                  Solicitante
                </dt>
                <dd className="text-a1-text-primary">{detail.solicitante}</dd>
              </div>
              <div>
                <dt className="font-display text-[length:var(--type-label)] font-semibold uppercase tracking-wide text-a1-text-tertiary">
                  Data
                </dt>
                <dd className="text-a1-text-auxiliary">{formatDate(detail.created_at)}</dd>
              </div>
            </dl>
          </div>

          {/* Approval Chain */}
          <div className="rounded-lg border border-a1-border bg-white p-[var(--space-lg)]">
            <h3 className="mb-[var(--space-md)] font-display text-base font-bold text-a1-text-primary">
              Cadeia de Aprovação
            </h3>
            {detail.approval_chain.length === 0 ? (
              <p className="text-sm text-a1-text-auxiliary">
                Nenhuma cadeia de aprovação definida.
              </p>
            ) : (
              <div className="space-y-[var(--space-md)]">
                {detail.approval_chain.map((level) => (
                  <div
                    key={level.level}
                    className="rounded-md border border-a1-border p-[var(--space-sm)]"
                  >
                    <p className="mb-[var(--space-xs)] text-[length:var(--type-caption)] font-semibold uppercase tracking-wide text-a1-text-tertiary">
                      Nível {level.level}
                    </p>
                    <div className="flex flex-wrap gap-[var(--space-sm)]">
                      {level.approvers.map((approver) => {
                        const approverVariant: StatusType =
                          approver.status === 'APPROVED'
                            ? 'success'
                            : approver.status === 'REJECTED'
                              ? 'error'
                              : 'neutral';
                        return (
                          <div
                            key={approver.id}
                            className="flex items-center gap-2 rounded-md bg-a1-bg px-3 py-1.5"
                          >
                            <div className="flex size-6 items-center justify-center rounded-full bg-a1-accent/10 text-a1-accent">
                              <UserIcon className="size-3.5" />
                            </div>
                            <span className="text-sm text-a1-text-primary">{approver.name}</span>
                            <StatusBadge status={approverVariant}>
                              {approver.status === 'APPROVED'
                                ? 'Aprovado'
                                : approver.status === 'REJECTED'
                                  ? 'Rejeitado'
                                  : 'Pendente'}
                            </StatusBadge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Override Panel */}
          {detail.can_override && detail.status === 'PENDING_APPROVAL' && (
            <div className="rounded-lg border border-status-warning-bg bg-white p-[var(--space-lg)]">
              <h3 className="mb-[var(--space-md)] font-display text-base font-bold text-a1-text-primary">
                Override
              </h3>
              <FormField
                label="Justificativa"
                name="override-justification"
                required
                hint={`${justification.length}/20 caracteres mínimos`}
                error={
                  justification.length > 0 && justification.length < 20
                    ? 'Justificativa deve ter pelo menos 20 caracteres.'
                    : undefined
                }
              >
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-a1-border bg-white px-3 py-2 text-sm text-a1-text-primary outline-none placeholder:text-a1-text-placeholder focus-visible:border-a1-accent focus-visible:ring-[3px] focus-visible:ring-a1-accent/20"
                  placeholder="Descreva o motivo do override..."
                />
              </FormField>
              <div className="mt-[var(--space-sm)] flex justify-end">
                <Button
                  variant="destructive"
                  onClick={handleOverride}
                  disabled={justification.length < 20}
                  isLoading={overrideLoading}
                >
                  <ShieldAlertIcon className="mr-1.5 size-4" />
                  Override
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Timeline */}
        <div className="rounded-lg border border-a1-border bg-white p-[var(--space-lg)]">
          <h3 className="mb-[var(--space-md)] font-display text-base font-bold text-a1-text-primary">
            Timeline
          </h3>
          {timeline.length === 0 ? (
            <p className="text-sm text-a1-text-auxiliary">Nenhum evento registrado.</p>
          ) : (
            <div className="relative space-y-0">
              {timeline.map((event, i) => {
                const Icon = TIMELINE_ICONS[event.type];
                const isLast = i === timeline.length - 1;
                return (
                  <div key={event.id} className="relative flex gap-3 pb-[var(--space-md)]">
                    {/* Vertical line */}
                    {!isLast && (
                      <div className="absolute left-[11px] top-6 h-full w-px bg-a1-border" />
                    )}
                    <div className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-a1-bg">
                      <Icon className="size-3.5 text-a1-text-auxiliary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-a1-text-primary">
                        {event.description}
                      </p>
                      <p className="text-[length:var(--type-caption)] text-a1-text-hint">
                        {event.actor} · {formatDate(event.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
