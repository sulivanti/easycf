/**
 * @contract UX-CASE-001, FR-010, FR-002, FR-003, FR-004, FR-005, FR-006, FR-008
 *
 * Case Panel — Detail screen with 4 tabs:
 * 1. Overview (header + progress bar + transition buttons)
 * 2. Gates (resolution/waive per type)
 * 3. Assignments (assign/reassign)
 * 4. Timeline (interleaved history + comment)
 *
 * Tailwind CSS v4 + shared UI components + Dialog for confirmations.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Badge,
  Skeleton,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../shared/ui/index.js';
import { useCaseDetail } from '../../hooks/use-cases.js';
import {
  useTransitionStage,
  useControlCase,
  useRecordEvent,
} from '../../hooks/use-case-actions.js';
import { useTimeline } from '../../hooks/use-timeline.js';
import { useGates, useResolveGate, useWaiveGate } from '../../hooks/use-gates.js';
import { useAssignments, useAssignResponsible } from '../../hooks/use-assignments.js';
import { CaseStatusBadge } from '../../components/CaseStatusBadge.js';
import { GateCard } from '../../components/GateCard.js';
import { TimelineFeed } from '../../components/TimelineFeed.js';
import type {
  CaseDetail,
  AvailableTransition,
  Assignment,
} from '../../types/case-execution.types.js';
import { COPY, isReadonly } from '../../types/case-execution.types.js';

interface CasePanelPageProps {
  caseId: string;
  userScopes?: readonly string[];
}

type TabId = 'overview' | 'gates' | 'assignments' | 'timeline';

export function CasePanelPage({ caseId, userScopes = [] }: CasePanelPageProps) {
  const { data: caseData, isLoading, error } = useCaseDetail(caseId);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  if (isLoading) return <PanelSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!caseData) return <p className="p-6 text-gray-500">Caso não encontrado.</p>;

  const readonly = isReadonly(caseData.status);

  return (
    <div className="flex flex-col gap-0">
      <CaseHeader caseData={caseData} />
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
      <div className="p-6">
        {activeTab === 'overview' && (
          <OverviewTab
            caseData={caseData}
            readonly={readonly}
            caseId={caseId}
            userScopes={userScopes}
          />
        )}
        {activeTab === 'gates' && <GatesTab caseId={caseId} readonly={readonly} />}
        {activeTab === 'assignments' && (
          <AssignmentsTab caseId={caseId} readonly={readonly} userScopes={userScopes} />
        )}
        {activeTab === 'timeline' && <TimelineTab caseId={caseId} readonly={readonly} />}
      </div>
    </div>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────

function CaseHeader({ caseData }: { caseData: CaseDetail }) {
  return (
    <header className="px-6 pt-6 pb-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold font-mono">{caseData.codigo}</h1>
          <CaseStatusBadge status={caseData.status} />
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Aberto em: {new Date(caseData.opened_at).toLocaleDateString('pt-BR')}</span>
          {caseData.object_type && <span>Objeto: {caseData.object_type}</span>}
        </div>
      </div>
      {caseData.status === 'ON_HOLD' && (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm text-yellow-800">
          Caso em espera — transições e gates bloqueados.
        </div>
      )}
      {caseData.status === 'CANCELLED' && caseData.cancellation_reason && (
        <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-600">
          Cancelado: {caseData.cancellation_reason}
        </div>
      )}
    </header>
  );
}

// ── Tab Bar ──────────────────────────────────────────────────────────────────

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'gates', label: 'Gates' },
  { id: 'assignments', label: 'Responsáveis' },
  { id: 'timeline', label: 'Histórico' },
];

function TabBar({ activeTab, onChange }: { activeTab: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="flex border-b px-6">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`
            px-4 py-2 text-sm font-medium border-b-2 transition-colors
            ${
              activeTab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }
          `}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  caseData,
  readonly,
  caseId,
  userScopes,
}: {
  caseData: CaseDetail;
  readonly: boolean;
  caseId: string;
  userScopes: readonly string[];
}) {
  const transition = useTransitionStage(caseId);
  const control = useControlCase(caseId);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const pendingGates = caseData.current_stage_gates.filter((g) => g.status === 'PENDING');
  const allGatesCleared = pendingGates.length === 0;
  const transitions = caseData.available_transitions ?? [];

  const handleTransition = useCallback(
    async (t: AvailableTransition) => {
      await transition.mutateAsync({ target_stage_id: t.target_stage_id });
      toast.success(COPY.transition_success(t.target_stage_name));
    },
    [transition],
  );

  const handleHold = useCallback(async () => {
    await control.mutateAsync({ action: 'hold' });
    toast.success(COPY.case_hold);
  }, [control]);

  const handleResume = useCallback(async () => {
    await control.mutateAsync({ action: 'resume' });
    toast.success(COPY.case_resumed);
  }, [control]);

  const handleCancel = useCallback(async () => {
    await control.mutateAsync({ action: 'cancel', reason: cancelReason });
    setCancelOpen(false);
    setCancelReason('');
    toast.success(COPY.case_cancelled);
  }, [control, cancelReason]);

  return (
    <div className="flex flex-col gap-6">
      {/* Gates summary */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Gates do Estágio Atual</h3>
        {pendingGates.length > 0 ? (
          <p className="text-sm text-yellow-700">
            {pendingGates.length} gate(s) pendente(s) — transição bloqueada.
          </p>
        ) : (
          <p className="text-sm text-green-700">Todos os gates resolvidos.</p>
        )}
      </section>

      {/* Transitions */}
      {!readonly && (
        <TooltipProvider>
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Transições Disponíveis</h3>
            {transitions.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma transição disponível.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {transitions.map((t) => {
                  const blocked = !allGatesCleared;
                  return (
                    <Tooltip key={t.transition_id}>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            size="sm"
                            disabled={blocked || transition.isPending}
                            onClick={() => handleTransition(t)}
                          >
                            {t.target_stage_name}
                            {t.evidence_required && ' *'}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {blocked && (
                        <TooltipContent>
                          {pendingGates.map((g) => g.gate_name ?? g.gate_id).join(', ')} pendente(s)
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            )}
          </section>
        </TooltipProvider>
      )}

      {/* Case controls */}
      {!readonly && (
        <section className="flex gap-2 border-t pt-4">
          {caseData.status === 'OPEN' && (
            <>
              <Button variant="outline" size="sm" onClick={handleHold} disabled={control.isPending}>
                Suspender
              </Button>
              {userScopes.includes('process:case:cancel') && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setCancelOpen(true)}
                  disabled={control.isPending}
                >
                  Cancelar
                </Button>
              )}
            </>
          )}
          {caseData.status === 'ON_HOLD' && (
            <>
              <Button size="sm" onClick={handleResume} disabled={control.isPending}>
                Retomar
              </Button>
              {userScopes.includes('process:case:cancel') && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setCancelOpen(true)}
                  disabled={control.isPending}
                >
                  Cancelar
                </Button>
              )}
            </>
          )}
        </section>
      )}

      {/* Errors */}
      {(transition.error || control.error) && (
        <p className="text-sm text-red-600">{(transition.error ?? control.error)?.message}</p>
      )}

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Caso</DialogTitle>
            <DialogDescription>{COPY.confirm_cancel}</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="cancel-reason">Motivo</Label>
            <textarea
              id="cancel-reason"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Informe o motivo do cancelamento..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={control.isPending || !cancelReason}
            >
              {control.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Gates Tab ────────────────────────────────────────────────────────────────

function GatesTab({ caseId, readonly }: { caseId: string; readonly: boolean }) {
  const { data: gates, isLoading } = useGates(caseId);
  const resolve = useResolveGate(caseId);
  const waive = useWaiveGate(caseId);

  const handleResolve = useCallback(
    (gateInstanceId: string, body: Record<string, unknown>) => {
      resolve.mutate(
        { gateInstanceId, body },
        {
          onSuccess: () => {
            const decision = body.decision as string | undefined;
            const name = gates?.find((g) => g.id === gateInstanceId)?.gate_name ?? '';
            if (decision === 'APPROVED') toast.success(COPY.gate_approved(name));
            else if (decision === 'REJECTED') toast.warning(COPY.gate_rejected(name));
            else toast.success(`Gate '${name}' resolvido.`);
          },
        },
      );
    },
    [resolve, gates],
  );

  const handleWaive = useCallback(
    (gateInstanceId: string, motivo: string) => {
      waive.mutate(
        { gateInstanceId, motivo },
        {
          onSuccess: () => {
            const name = gates?.find((g) => g.id === gateInstanceId)?.gate_name ?? '';
            toast.success(COPY.gate_waived(name));
          },
        },
      );
    },
    [waive, gates],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!gates || gates.length === 0) {
    return <p className="text-sm text-gray-400 py-4">{COPY.empty_gates}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {gates.map((gate) => (
        <GateCard
          key={gate.id}
          gate={gate}
          readonly={readonly}
          onResolve={handleResolve}
          onWaive={handleWaive}
          resolving={resolve.isPending}
          waiving={waive.isPending}
        />
      ))}
      {(resolve.error || waive.error) && (
        <p className="text-sm text-red-600">{(resolve.error ?? waive.error)?.message}</p>
      )}
    </div>
  );
}

// ── Assignments Tab ──────────────────────────────────────────────────────────

function AssignmentsTab({
  caseId,
  readonly,
  userScopes,
}: {
  caseId: string;
  readonly: boolean;
  userScopes: readonly string[];
}) {
  const { data: assignments, isLoading } = useAssignments(caseId);
  const assign = useAssignResponsible(caseId);
  const canAssign = userScopes.includes('process:case:assign');

  const [showForm, setShowForm] = useState(false);
  const [roleId, setRoleId] = useState('');
  const [userId, setUserId] = useState('');

  const handleAssign = useCallback(async () => {
    await assign.mutateAsync({ process_role_id: roleId, user_id: userId });
    setShowForm(false);
    setRoleId('');
    setUserId('');
    toast.success(COPY.assignment_created(userId, roleId));
  }, [assign, roleId, userId]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!assignments || assignments.length === 0 ? (
        <p className="text-sm text-gray-400 py-4">{COPY.empty_assignments}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {assignments.map((a) => (
            <AssignmentRow key={a.id} assignment={a} />
          ))}
        </div>
      )}

      {!readonly && canAssign && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : 'Nova Atribuição'}
          </Button>
          {showForm && (
            <div className="flex items-end gap-3 border rounded-lg p-4">
              <div className="flex-1">
                <Label htmlFor="assign-role">Papel</Label>
                <Input
                  id="assign-role"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  placeholder="ID do papel"
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="assign-user">Usuário</Label>
                <Input
                  id="assign-user"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="ID do usuário"
                  className="mt-1"
                />
              </div>
              <Button
                size="sm"
                onClick={handleAssign}
                disabled={assign.isPending || !roleId || !userId}
              >
                {assign.isPending ? 'Atribuindo...' : 'Atribuir'}
              </Button>
            </div>
          )}
          {assign.error && <p className="text-sm text-red-600">{assign.error.message}</p>}
        </>
      )}
    </div>
  );
}

function AssignmentRow({ assignment }: { assignment: Assignment }) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
          {assignment.process_role_name ?? assignment.process_role_id}
        </span>
        <span className="text-sm text-gray-500">{assignment.user_name ?? assignment.user_id}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>{new Date(assignment.assigned_at).toLocaleDateString('pt-BR')}</span>
        {assignment.valid_until && (
          <span>até {new Date(assignment.valid_until).toLocaleDateString('pt-BR')}</span>
        )}
        <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
          {assignment.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>
    </div>
  );
}

// ── Timeline Tab ─────────────────────────────────────────────────────────────

function TimelineTab({ caseId, readonly }: { caseId: string; readonly: boolean }) {
  const { data: entries, isLoading } = useTimeline(caseId);
  const recordEvent = useRecordEvent(caseId);
  const [comment, setComment] = useState('');

  const handleComment = useCallback(async () => {
    if (!comment.trim()) return;
    await recordEvent.mutateAsync({
      event_type: 'COMMENT',
      descricao: comment.trim(),
    });
    setComment('');
  }, [recordEvent, comment]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const canComment = !readonly;

  return (
    <div className="flex flex-col gap-4">
      {canComment && (
        <div className="flex gap-2">
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Adicionar comentário..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleComment();
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleComment}
            disabled={recordEvent.isPending || !comment.trim()}
          >
            {recordEvent.isPending ? 'Enviando...' : 'Comentar'}
          </Button>
        </div>
      )}
      <TimelineFeed entries={entries ?? []} />
      {recordEvent.error && <p className="text-sm text-red-600">{recordEvent.error.message}</p>}
    </div>
  );
}

// ── Shared ───────────────────────────────────────────────────────────────────

function PanelSkeleton() {
  return (
    <div className="p-6 flex flex-col gap-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function ErrorState({ error }: { error: Error & { correlationId?: string } }) {
  return (
    <div className="p-6">
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <h3 className="font-medium text-red-800">{COPY.error_load_case}</h3>
        <p className="mt-1 text-sm text-red-700">{error.message}</p>
        {error.correlationId && (
          <p className="mt-2 text-xs text-red-500">Correlation ID: {error.correlationId}</p>
        )}
      </div>
    </div>
  );
}
