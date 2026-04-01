/**
 * @contract UX-007-M01, UX-PARAM-001, FR-001, FR-002, FR-003, FR-004, DOC-UX-010
 * Page: Configurador de Enquadradores e Regras de Incidencia
 * Route: /parametrizacao/enquadradores
 *
 * Layout: 3-panel simultaneo (FramersList 280px | TargetObjects flex:1 | IncidenceMatrix flex:1).
 * States: loading (skeleton), empty, error, loaded.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  ConfirmationModal,
  PageHeader,
  Spinner,
} from '@shared/ui';
import { Select } from '@shared/ui/select';
import { StatusBadge } from '@shared/ui/status-badge';
import { EmptyState } from '@shared/ui/empty-state';
import { FilterBar } from '@shared/ui/filter-bar';
import {
  useFramersList,
  useFramerTypes,
  useCreateFramer,
  useUpdateFramer,
  useDeleteFramer,
} from '../hooks/use-framers.js';
import { useTargetObjects } from '../hooks/use-target-objects.js';
import {
  useIncidenceRules,
  useCreateIncidenceRule,
  useUpdateIncidenceRule,
  useLinkRoutine,
  useUnlinkRoutine,
} from '../hooks/use-incidence-rules.js';
import { useRoutinesList } from '../hooks/use-routines.js';
import { useEvaluateEngine } from '../hooks/use-evaluate.js';
import type {
  FramerListItemDTO,
  FramerStatus,
  CreateFramerRequest,
  UpdateFramerRequest,
  IncidenceType,
  FramerListFilters,
  IncidenceRuleListFilters,
} from '../types/contextual-params.types.js';
import {
  canWriteFramers,
  canDeleteFramers,
  canDeactivateFramer,
  canEvaluateEngine,
} from '../types/permissions.js';
import { COPY, isExpiringSoon } from '../types/view-model.js';
import { FramerDrawer } from '../components/FramerDrawer.js';
import { IncidenceMatrix } from '../components/IncidenceMatrix.js';
import { DryRunPreview } from '../components/DryRunPreview.js';

interface DrawerState {
  open: boolean;
  mode: 'create' | 'edit';
  framerId?: string;
  framer?: FramerListItemDTO;
}

export interface FramersConfigPageProps {
  userScopes: readonly string[];
}

export function FramersConfigPage({ userScopes }: FramersConfigPageProps) {
  const [framerFilters, setFramerFilters] = useState<FramerListFilters>({});
  const [ruleFilters] = useState<IncidenceRuleListFilters>({});

  const framersQuery = useFramersList(framerFilters);
  const framerTypesQuery = useFramerTypes();
  const targetObjectsQuery = useTargetObjects();
  const rulesQuery = useIncidenceRules(ruleFilters);
  const routinesQuery = useRoutinesList({ status: 'PUBLISHED' });

  const createFramerMut = useCreateFramer();
  const updateFramerMut = useUpdateFramer();
  const deleteFramerMut = useDeleteFramer();
  const createRuleMut = useCreateIncidenceRule();
  const updateRuleMut = useUpdateIncidenceRule();
  const linkRoutineMut = useLinkRoutine();
  const unlinkRoutineMut = useUnlinkRoutine();
  const evaluateMut = useEvaluateEngine();

  const [drawer, setDrawer] = useState<DrawerState>({ open: false, mode: 'create' });
  const [statusFilter, setStatusFilter] = useState<FramerStatus | ''>('');
  const [deactivateTarget, setDeactivateTarget] = useState<FramerListItemDTO | null>(null);
  const [showDryRun, setShowDryRun] = useState(false);

  const canWrite = canWriteFramers(userScopes);
  const _canDelete = canDeleteFramers(userScopes);

  const framers = framersQuery.data?.data ?? [];
  const framerTypes = framerTypesQuery.data?.data ?? [];
  const targetObjects = targetObjectsQuery.data?.data ?? [];
  const rules = rulesQuery.data?.data ?? [];
  const routines = routinesQuery.data?.data ?? [];

  // -- Handlers --

  const handleSaveFramer = useCallback(
    async (data: CreateFramerRequest | UpdateFramerRequest) => {
      try {
        if (drawer.mode === 'edit' && drawer.framerId) {
          await updateFramerMut.mutateAsync({
            id: drawer.framerId,
            data: data as UpdateFramerRequest,
          });
          toast.success(COPY.success_update_framer);
        } else {
          await createFramerMut.mutateAsync(data as CreateFramerRequest);
          toast.success(COPY.success_create_framer);
        }
        setDrawer({ open: false, mode: 'create' });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : COPY.error_generic);
      }
    },
    [drawer, createFramerMut, updateFramerMut],
  );

  const handleDeactivateConfirm = useCallback(async () => {
    if (!deactivateTarget) return;
    try {
      await deleteFramerMut.mutateAsync(deactivateTarget.id);
      toast.success(COPY.success_deactivate_framer);
      setDeactivateTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : COPY.error_generic);
    }
  }, [deactivateTarget, deleteFramerMut]);

  const handleCreateRule = useCallback(
    async (framerId: string, routineId: string, incidenceType: IncidenceType) => {
      try {
        await createRuleMut.mutateAsync({
          framer_id: framerId,
          target_object_id: routineId,
          incidence_type: incidenceType,
          valid_from: new Date().toISOString(),
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : COPY.error_unique_incidence);
      }
    },
    [createRuleMut],
  );

  const handleUpdateRuleType = useCallback(
    async (ruleId: string, incidenceType: IncidenceType) => {
      try {
        await updateRuleMut.mutateAsync({ id: ruleId, data: { incidence_type: incidenceType } });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : COPY.error_generic);
      }
    },
    [updateRuleMut],
  );

  const handleRemoveRule = useCallback(
    async (ruleId: string) => {
      try {
        await updateRuleMut.mutateAsync({ id: ruleId, data: { status: 'INACTIVE' } });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : COPY.error_generic);
      }
    },
    [updateRuleMut],
  );

  const _handleLinkRoutine = useCallback(
    async (ruleId: string, routineId: string) => {
      try {
        await linkRoutineMut.mutateAsync({ ruleId, routineId });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : COPY.error_generic);
      }
    },
    [linkRoutineMut],
  );

  const _handleUnlinkRoutine = useCallback(
    async (ruleId: string, routineId: string) => {
      try {
        await unlinkRoutineMut.mutateAsync({ ruleId, routineId });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : COPY.error_generic);
      }
    },
    [unlinkRoutineMut],
  );

  const handleDryRun = useCallback(async () => {
    const activeFramers = framers.filter((f) => f.status === 'ACTIVE');
    if (activeFramers.length === 0) {
      toast.error('Nenhum enquadrador ativo para simular.');
      return;
    }
    try {
      await evaluateMut.mutateAsync({
        object_type: targetObjects[0]?.codigo ?? '',
        context: activeFramers.map((f) => ({ framer_id: f.id })),
        dry_run: true,
      });
      setShowDryRun(true);
    } catch {
      toast.error(COPY.error_simulate);
    }
  }, [framers, targetObjects, evaluateMut]);

  // -- Loading --
  const isLoading =
    framersQuery.isLoading ||
    framerTypesQuery.isLoading ||
    targetObjectsQuery.isLoading ||
    rulesQuery.isLoading ||
    routinesQuery.isLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-3" aria-busy="true" aria-label="Carregando enquadradores">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 rounded bg-a1-border" />
        ))}
      </div>
    );
  }

  // -- Error --
  const firstError =
    framersQuery.error ||
    framerTypesQuery.error ||
    targetObjectsQuery.error ||
    rulesQuery.error ||
    routinesQuery.error;
  if (firstError) {
    return (
      <div className="p-6" role="alert">
        <p className="text-danger-600 font-medium mb-2">{COPY.error_load_framers}</p>
        {'correlationId' in (firstError as unknown as Record<string, unknown>) && (
          <p className="text-xs text-a1-text-auxiliary mb-3">
            Correlation ID: {(firstError as unknown as Record<string, string>).correlationId}
          </p>
        )}
        <Button
          variant="outline"
          onClick={() => {
            framersQuery.refetch();
            framerTypesQuery.refetch();
            targetObjectsQuery.refetch();
            rulesQuery.refetch();
            routinesQuery.refetch();
          }}
        >
          {COPY.btn_retry}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <PageHeader
        title="Parametrizacao Contextual"
        actions={
          <div className="flex items-center gap-2">
            {canEvaluateEngine(userScopes) && (
              <Button variant="outline" onClick={handleDryRun} disabled={evaluateMut.isPending}>
                {evaluateMut.isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" /> Simulando...
                  </>
                ) : (
                  'Simular Dry-Run'
                )}
              </Button>
            )}
            {canWrite && (
              <Button onClick={() => setDrawer({ open: true, mode: 'create' })}>
                Novo enquadrador
              </Button>
            )}
          </div>
        }
      />

      {/* 3-panel simultaneous layout */}
      <div className="flex gap-4 mt-6">
        {/* Left panel: Framers list (280px) */}
        <div className="w-[280px] flex-shrink-0">
          <h3 className="text-sm font-semibold mb-3 text-a1-text-secondary">Enquadradores</h3>

          <FilterBar className="mb-3">
            <Select
              value={statusFilter}
              onChange={(e) => {
                const val = e.target.value as FramerStatus | '';
                setStatusFilter(val);
                setFramerFilters(val ? { status: val } : {});
              }}
              aria-label="Filtrar por status"
              placeholder="Todos os status"
              options={[
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
              ]}
            />
          </FilterBar>

          {framers.length === 0 ? (
            <EmptyState title={COPY.empty_framers} />
          ) : (
            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-240px)]">
              {framers.map((f) => {
                const typeName = framerTypes.find((t) => t.id === f.framer_type_id)?.nome ?? '';
                const expiring = isExpiringSoon(f.valid_until);

                return (
                  <div
                    key={f.id}
                    className="border border-a1-border rounded-lg p-2.5 hover:bg-a1-bg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold">{f.codigo}</span>
                      <div className="flex items-center gap-1">
                        <StatusBadge status={f.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {f.status}
                        </StatusBadge>
                        {expiring && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <StatusBadge status="warning">Exp</StatusBadge>
                              </TooltipTrigger>
                              <TooltipContent>{COPY.tooltip_expirando}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-a1-text-auxiliary mt-0.5">{f.nome}</div>
                    {typeName && (
                      <div className="text-xs text-a1-text-auxiliary mt-0.5">{typeName}</div>
                    )}
                    <div className="flex gap-1 mt-1.5">
                      {canWrite && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs px-2"
                          onClick={() =>
                            setDrawer({
                              open: true,
                              mode: 'edit',
                              framerId: f.id,
                              framer: f,
                            })
                          }
                        >
                          Editar
                        </Button>
                      )}
                      {canDeactivateFramer(userScopes, f.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs px-2 text-danger-600"
                          onClick={() => setDeactivateTarget(f)}
                        >
                          Inativar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Center panel: Target Objects (flex:1) */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold mb-3 text-a1-text-secondary">Objetos-Alvo</h3>

          {targetObjects.length === 0 ? (
            <EmptyState title="Nenhum objeto-alvo cadastrado." />
          ) : (
            <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-240px)]">
              {targetObjects.map((obj) => (
                <div
                  key={obj.id}
                  className="border border-a1-border rounded-lg p-2.5 hover:bg-a1-bg transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{obj.nome}</span>
                    <span className="text-xs text-a1-text-auxiliary">{obj.modulo_ecf ?? ''}</span>
                  </div>
                  <div className="text-xs text-a1-text-auxiliary font-mono">{obj.codigo}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel: Incidence Matrix (flex:1) */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold mb-3 text-a1-text-secondary">
            Matriz de Incidencia
          </h3>

          <IncidenceMatrix
            framers={framers.filter((f) => f.status === 'ACTIVE')}
            routines={routines}
            rules={rules}
            canWrite={canWrite}
            onCreateRule={handleCreateRule}
            onUpdateRuleType={handleUpdateRuleType}
            onRemoveRule={handleRemoveRule}
          />
        </div>
      </div>

      {/* Framer Drawer */}
      <FramerDrawer
        open={drawer.open}
        onOpenChange={(open) => {
          if (!open) setDrawer({ open: false, mode: 'create' });
        }}
        mode={drawer.mode}
        framer={drawer.framer}
        framerTypes={framerTypes}
        loading={createFramerMut.isPending || updateFramerMut.isPending}
        onSave={handleSaveFramer}
      />

      {/* Deactivate Confirmation Dialog */}
      <ConfirmationModal
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title="Inativar Enquadrador"
        description={COPY.confirm_deactivate}
        variant="destructive"
        confirmLabel="Inativar"
        onConfirm={handleDeactivateConfirm}
        isLoading={deleteFramerMut.isPending}
      />

      {/* Dry-Run Modal */}
      <DryRunPreview
        open={showDryRun && !!evaluateMut.data}
        onOpenChange={setShowDryRun}
        result={evaluateMut.data ?? null}
      />
    </div>
  );
}
