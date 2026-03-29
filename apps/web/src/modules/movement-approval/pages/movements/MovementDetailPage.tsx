/**
 * @contract UX-009 §31, UX-009-M01 D4
 *
 * View ② — Movimento Detalhe (/approvals/movements/:id)
 * Two-column: HeaderCard + ApprovalChain + ActionButtons + OverridePanel (2/3) | Timeline sticky (1/3)
 */

import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  ArrowLeftIcon,
  CheckIcon,
  XIcon,
  ShieldAlertIcon,
  ZapIcon,
  ClockIcon,
  LockIcon,
  UserIcon,
  AlertTriangleIcon,
} from 'lucide-react';
import { Button, Skeleton } from '@shared/ui';
import { StatusBadge, type StatusType } from '@shared/ui/status-badge';
import { useMovementDetail, useOverrideMovement } from '../../hooks/use-movements.js';
import { useApproveMovement, useRejectMovement } from '../../hooks/use-approvals.js';
import type { MovementStatus, ApprovalInstance } from '../../types/movement-approval.types.js';

// ── Status map ───────────────────────────────────────────────────────────────

const STATUS_MAP: Record<MovementStatus, { label: string; variant: StatusType; auto?: boolean }> = {
  PENDING_APPROVAL: { label: 'Pendente', variant: 'warning' },
  APPROVED: { label: 'Aprovado', variant: 'success' },
  AUTO_APPROVED: { label: 'Auto', variant: 'info', auto: true },
  REJECTED: { label: 'Rejeitado', variant: 'error' },
  CANCELLED: { label: 'Cancelado', variant: 'error' },
  OVERRIDDEN: { label: 'Override', variant: 'purple' },
  EXECUTED: { label: 'Executado', variant: 'success' },
  FAILED: { label: 'Falhou', variant: 'error' },
};

// ── Props ────────────────────────────────────────────────────────────────────

export interface MovementDetailPageProps {
  movementId: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatValue(value: number | null) {
  if (value === null) return '—';
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Approval Chain Level ─────────────────────────────────────────────────────

type LevelState = 'approved' | 'waiting' | 'blocked';

function getLevelState(instance: ApprovalInstance): LevelState {
  if (instance.decision === 'APPROVED') return 'approved';
  if (instance.decision === null && instance.approver_id) return 'waiting';
  return 'blocked';
}

function ApprovalLevelCard({ instance, index }: { instance: ApprovalInstance; index: number }) {
  const state = getLevelState(instance);

  const stateConfig = {
    approved: {
      bg: 'bg-[#f0fdf4]',
      border: 'border-[#bbf7d0]',
      circleBg: 'bg-[#16a34a]',
      icon: <CheckIcon className="size-3 text-white" />,
      label: 'Aprovado',
    },
    waiting: {
      bg: 'bg-[#fefce8]',
      border: 'border-amber-200',
      circleBg: 'bg-[#ca8a04]',
      icon: <ClockIcon className="size-3 text-white" />,
      label: 'Aguardando',
    },
    blocked: {
      bg: 'bg-[#F5F5F3]',
      border: 'border-slate-200',
      circleBg: 'bg-[#888888]',
      icon: <LockIcon className="size-3 text-white" />,
      label: 'Bloqueado',
    },
  }[state];

  return (
    <div className={`rounded-lg border ${stateConfig.border} ${stateConfig.bg} p-4`}>
      <div className="flex items-start gap-3">
        <div
          className={`flex size-6 shrink-0 items-center justify-center rounded-full ${stateConfig.circleBg} ${state === 'waiting' ? 'animate-pulse' : ''}`}
        >
          {stateConfig.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[#111111]">
            Nível {index + 1}
            <span className="ml-2 text-[11px] font-normal text-[#888888]">
              {stateConfig.label}
            </span>
          </p>
          {instance.approver_name && (
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#888888]">
              <UserIcon className="size-3" />
              {instance.approver_name}
              {instance.decided_at && ` · ${formatDate(instance.decided_at)}`}
            </p>
          )}
          {instance.opinion && (
            <p className="mt-1.5 rounded-md bg-white/60 px-2 py-1 text-[12px] italic text-[#888888]">
              "{instance.opinion}"
            </p>
          )}
          {state === 'waiting' && instance.sla_deadline && (
            <p className="mt-1 text-[11px] text-[#ca8a04]">
              SLA: {formatDate(instance.sla_deadline)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Timeline ─────────────────────────────────────────────────────────────────

type TimelineDotVariant = 'info' | 'success' | 'warning' | 'neutral';

interface TimelineEvent {
  id: string;
  variant: TimelineDotVariant;
  title: string;
  detail: string;
  timestamp?: string;
}

function TimelineDot({ variant }: { variant: TimelineDotVariant }) {
  const colors: Record<TimelineDotVariant, string> = {
    info: 'bg-[#E3F2FD]',
    success: 'bg-[#f0fdf4]',
    warning: 'bg-[#fefce8]',
    neutral: 'bg-[#F5F5F3]',
  };
  const innerColors: Record<TimelineDotVariant, string> = {
    info: 'bg-[#2E86C1]',
    success: 'bg-[#16a34a]',
    warning: 'bg-[#ca8a04]',
    neutral: 'bg-[#888888]',
  };
  return (
    <div
      className={`flex size-5 shrink-0 items-center justify-center rounded-full ${colors[variant]}`}
    >
      <div className={`size-2 rounded-full ${innerColors[variant]}`} />
    </div>
  );
}

function buildTimeline(instances: ApprovalInstance[]): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: 'created',
      variant: 'info',
      title: 'Movimento criado',
      detail: 'Motor de regras avaliou',
    },
  ];
  for (const inst of instances) {
    if (inst.decision === 'APPROVED') {
      events.push({
        id: `inst-${inst.id}`,
        variant: 'success',
        title: `Nível ${inst.level} aprovado`,
        detail: inst.approver_name ?? 'Aprovador',
        timestamp: inst.decided_at ?? undefined,
      });
    } else if (inst.decision === 'REJECTED') {
      events.push({
        id: `inst-${inst.id}`,
        variant: 'warning',
        title: `Nível ${inst.level} rejeitado`,
        detail: inst.approver_name ?? 'Aprovador',
        timestamp: inst.decided_at ?? undefined,
      });
    } else if (inst.approver_id) {
      events.push({
        id: `inst-${inst.id}`,
        variant: 'warning',
        title: `Nível ${inst.level} pendente`,
        detail: 'Aguardando decisão',
        timestamp: inst.created_at,
      });
    } else {
      events.push({
        id: `inst-${inst.id}`,
        variant: 'neutral',
        title: `Nível ${inst.level} bloqueado`,
        detail: 'Aguardando níveis anteriores',
      });
    }
  }
  return events;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function MovementDetailPage({ movementId }: MovementDetailPageProps) {
  const [justification, setJustification] = useState('');
  const [approveOpinion, setApproveOpinion] = useState('');
  const [rejectOpinion, setRejectOpinion] = useState('');
  const [showActions, setShowActions] = useState(false);

  const detailQuery = useMovementDetail(movementId);
  const approveMut = useApproveMovement();
  const rejectMut = useRejectMovement();
  const overrideMut = useOverrideMovement();

  const detail = detailQuery.data ?? null;

  function handleApprove() {
    if (approveOpinion.trim().length < 10) {
      toast.error('Parecer deve ter pelo menos 10 caracteres.');
      return;
    }
    approveMut.mutate(
      { movementId, data: { opinion: approveOpinion.trim() } },
      {
        onSuccess: () => {
          toast.success('Movimento aprovado.');
          setApproveOpinion('');
          setShowActions(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao aprovar.'),
      },
    );
  }

  function handleReject() {
    if (rejectOpinion.trim().length < 10) {
      toast.error('Parecer deve ter pelo menos 10 caracteres.');
      return;
    }
    rejectMut.mutate(
      { movementId, data: { opinion: rejectOpinion.trim() } },
      {
        onSuccess: () => {
          toast.success('Movimento rejeitado.');
          setRejectOpinion('');
          setShowActions(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao rejeitar.'),
      },
    );
  }

  function handleOverride() {
    if (justification.trim().length < 20) return;
    overrideMut.mutate(
      { id: movementId, data: { justification: justification.trim(), confirmation: true } },
      {
        onSuccess: () => {
          toast.success('Override realizado.');
          setJustification('');
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro no override.'),
      },
    );
  }

  if (detailQuery.isLoading) {
    return (
      <div className="space-y-[var(--space-lg)]">
        <Skeleton className="h-8 w-48 rounded-md" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-36 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="py-16 text-center text-[13px] text-[#888888]">
        Movimento não encontrado.
      </div>
    );
  }

  const st = STATUS_MAP[detail.status];
  const isPending = detail.status === 'PENDING_APPROVAL';
  const instances = detail.approval_instances ?? [];
  const timeline = buildTimeline(instances);
  const justLen = justification.trim().length;

  return (
    <div className="space-y-[var(--space-lg)]">
      {/* Breadcrumb + Back */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-1 text-[11px] text-[#888888]">
          <span>Aprovação</span>
          <span className="text-[#E8E8E6]">/</span>
          <Link to="/approvals/movements" className="hover:text-[#111111]">
            Movimentos
          </Link>
          <span className="text-[#E8E8E6]">/</span>
          <span className="font-semibold text-[#111111]">{detail.codigo}</span>
        </nav>
        <Link to="/approvals/movements">
          <Button variant="outline" size="sm" className="border-[#E8E8E6]">
            <ArrowLeftIcon className="size-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left Column ── */}
        <div className="space-y-4 lg:col-span-2">
          {/* Header Card */}
          <div className="rounded-[10px] border border-[#E8E8E6] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-[20px] font-extrabold text-[#111111]">{detail.codigo}</h1>
                <StatusBadge status={st.variant}>
                  {st.auto && <ZapIcon className="size-2.5" />}
                  {st.label}
                </StatusBadge>
              </div>
              <span className="font-mono text-[24px] font-extrabold tabular-nums text-[#111111]">
                R$ {formatValue(detail.value)}
              </span>
            </div>
            <p className="mb-4 text-[13px] text-[#888888]">
              {detail.entity_type} · {detail.operation}
            </p>
            <div className="grid grid-cols-2 gap-4 border-t border-[#E8E8E6] pt-4 lg:grid-cols-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                  Solicitante
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="flex size-6 items-center justify-center rounded-full bg-[#E3F2FD]">
                    <UserIcon className="size-3 text-[#2E86C1]" />
                  </div>
                  <p className="text-[13px] font-medium text-[#111111]">
                    {detail.requester_name}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                  Tipo
                </p>
                <p className="mt-1 text-[13px] text-[#111111]">{detail.entity_type}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                  Origem
                </p>
                <p className="mt-1 text-[13px] text-[#111111]">{detail.origin}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                  Regra Aplicada
                </p>
                <p className="mt-1 text-[13px] font-semibold text-[#2E86C1]">
                  {detail.control_rule_id ?? '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Approval Chain */}
          <div className="rounded-[10px] border border-[#E8E8E6] bg-white p-6">
            <h2 className="mb-4 text-[14px] font-bold text-[#111111]">Cadeia de Aprovação</h2>
            {instances.length === 0 ? (
              <p className="text-[13px] text-[#888888]">Nenhuma cadeia definida.</p>
            ) : (
              <div className="space-y-2">
                {instances.map((inst, i) => (
                  <div key={inst.id}>
                    <ApprovalLevelCard instance={inst} index={i} />
                    {i < instances.length - 1 && (
                      <div className="ml-3 h-4 w-0.5 bg-[#E8E8E6]" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons — only for pending */}
          {isPending && (
            <div className="rounded-[10px] border border-[#E8E8E6] bg-white p-6">
              <h2 className="mb-4 text-[14px] font-bold text-[#111111]">Decisão</h2>
              {!showActions ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowActions(true)}
                    className="flex h-11 w-36 items-center justify-center gap-2 rounded-md bg-[#16a34a] text-[13px] font-semibold text-white hover:bg-[#15803d] transition-colors"
                  >
                    <CheckIcon className="size-4" />
                    Aprovar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowActions(true)}
                    className="flex h-11 w-36 items-center justify-center gap-2 rounded-md bg-[#dc2626] text-[13px] font-semibold text-white hover:bg-[#b91c1c] transition-colors"
                  >
                    <XIcon className="size-4" />
                    Rejeitar
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Approve */}
                  <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-4">
                    <p className="mb-2 text-[12px] font-semibold text-[#16a34a]">Aprovar</p>
                    <textarea
                      rows={2}
                      value={approveOpinion}
                      onChange={(e) => setApproveOpinion(e.target.value)}
                      placeholder="Parecer de aprovação (mínimo 10 caracteres)..."
                      className="w-full resize-none rounded-md border border-[#E8E8E6] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-[#CCCCCC] focus:border-[#16a34a]"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-[#888888]">
                        {approveOpinion.trim().length}/10 caracteres mínimos
                      </span>
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={approveMut.isPending || approveOpinion.trim().length < 10}
                        className="rounded-md bg-[#16a34a] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[#15803d] disabled:opacity-50"
                      >
                        Confirmar Aprovação
                      </button>
                    </div>
                  </div>
                  {/* Reject */}
                  <div className="rounded-lg border border-[#fecaca] bg-[#fee2e2] p-4">
                    <p className="mb-2 text-[12px] font-semibold text-[#dc2626]">Rejeitar</p>
                    <textarea
                      rows={2}
                      value={rejectOpinion}
                      onChange={(e) => setRejectOpinion(e.target.value)}
                      placeholder="Motivo da rejeição (mínimo 10 caracteres)..."
                      className="w-full resize-none rounded-md border border-[#E8E8E6] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-[#CCCCCC] focus:border-[#dc2626]"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-[#888888]">
                        {rejectOpinion.trim().length}/10 caracteres mínimos
                      </span>
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={rejectMut.isPending || rejectOpinion.trim().length < 10}
                        className="rounded-md bg-[#dc2626] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[#b91c1c] disabled:opacity-50"
                      >
                        Confirmar Rejeição
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowActions(false)}
                    className="text-[12px] text-[#888888] hover:text-[#111111]"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Override Panel */}
          {isPending && (
            <div className="rounded-[10px] border border-[#E8E8E6] bg-white p-6">
              <div className="mb-3 flex items-center gap-2">
                <ShieldAlertIcon className="size-4 text-[#ca8a04]" />
                <h2 className="text-[14px] font-bold text-[#111111]">Override Administrativo</h2>
              </div>
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#fde68a] bg-[#fefce8] px-4 py-3">
                <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-[#ca8a04]" />
                <p className="text-[12px] text-[#92400e]">
                  Esta ação será registrada no log de auditoria e não pode ser desfeita.
                </p>
              </div>
              <textarea
                rows={3}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Descreva o motivo do override administrativo..."
                className="w-full resize-none rounded-md border border-[#E8E8E6] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-[#CCCCCC] focus:border-[#ca8a04]"
              />
              <div className="mt-2 flex items-center justify-between">
                <span
                  className={[
                    'text-[11px] font-medium',
                    justLen < 20 ? 'text-[#ca8a04]' : 'text-[#16a34a]',
                  ].join(' ')}
                >
                  {justLen}/20 caracteres mínimos
                </span>
                <button
                  type="button"
                  onClick={handleOverride}
                  disabled={justLen < 20 || overrideMut.isPending}
                  className={[
                    'rounded-md px-4 py-2 text-[13px] font-semibold text-white transition-opacity',
                    justLen < 20 ? 'bg-[#ca8a04] opacity-50 cursor-not-allowed' : 'bg-[#ca8a04] hover:bg-[#b45309]',
                  ].join(' ')}
                >
                  Aplicar Override
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column — Timeline ── */}
        <div className="lg:sticky lg:top-5 lg:self-start">
          <div className="rounded-[10px] border border-[#E8E8E6] bg-white p-6">
            <h2 className="mb-4 text-[14px] font-extrabold text-[#111111]">Timeline</h2>
            {timeline.length === 0 ? (
              <p className="text-[13px] text-[#888888]">Nenhum evento registrado.</p>
            ) : (
              <div className="space-y-0">
                {timeline.map((event, i) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <TimelineDot variant={event.variant} />
                      {i < timeline.length - 1 && (
                        <div className="my-1 w-0.5 flex-1 bg-[#E8E8E6]" style={{ minHeight: 16 }} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-[12px] font-semibold text-[#111111]">{event.title}</p>
                      <p className="text-[11px] text-[#888888]">
                        {event.detail}
                        {event.timestamp && ` · ${formatDate(event.timestamp)}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
