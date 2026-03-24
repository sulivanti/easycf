/**
 * @contract UX-PARAM-001, FR-001, FR-002, FR-003, FR-004, DOC-UX-010
 * Page: Configurador de Enquadradores e Regras de Incidencia
 * Route: /parametrizacao/enquadradores
 *
 * States: loading (skeleton), empty, error, loaded.
 * 3 panels: Enquadradores, Objetos-Alvo, Regras de Incidencia (matrix).
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Badge,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui';
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
  useLinkRoutine,
  useUnlinkRoutine,
} from '../hooks/use-incidence-rules.js';
import { useEvaluateEngine } from '../hooks/use-evaluate.js';
import type {
  FramerListItemDTO,
  FramerStatus,
  CreateFramerRequest,
  UpdateFramerRequest,
  CreateIncidenceRuleRequest,
  FramerListFilters,
  IncidenceRuleListFilters,
} from '../types/contextual-params.types.js';
import {
  canWriteFramers,
  canDeleteFramers,
  canDeactivateFramer,
  canEvaluateEngine,
} from '../types/permissions.js';
import { COPY, framerStatusClass, isExpiringSoon } from '../types/view-model.js';
import { FramerDrawer } from '../components/FramerDrawer.js';
import { IncidenceMatrix } from '../components/IncidenceMatrix.js';

type Panel = 'framers' | 'objects' | 'incidence';

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

  const createFramerMut = useCreateFramer();
  const updateFramerMut = useUpdateFramer();
  const deleteFramerMut = useDeleteFramer();
  const createRuleMut = useCreateIncidenceRule();
  const linkRoutineMut = useLinkRoutine();
  const unlinkRoutineMut = useUnlinkRoutine();
  const evaluateMut = useEvaluateEngine();

  const [activePanel, setActivePanel] = useState<Panel>('framers');
  const [drawer, setDrawer] = useState<DrawerState>({ open: false, mode: 'create' });
  const [statusFilter, setStatusFilter] = useState<FramerStatus | ''>('');
  const [deactivateTarget, setDeactivateTarget] = useState<FramerListItemDTO | null>(null);

  const canWrite = canWriteFramers(userScopes);
  const canDelete = canDeleteFramers(userScopes);

  const framers = framersQuery.data?.data ?? [];
  const framerTypes = framerTypesQuery.data?.data ?? [];
  const targetObjects = targetObjectsQuery.data?.data ?? [];
  const rules = rulesQuery.data?.data ?? [];

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
    async (data: CreateIncidenceRuleRequest) => {
      try {
        await createRuleMut.mutateAsync(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : COPY.error_unique_incidence);
      }
    },
    [createRuleMut],
  );

  const handleLinkRoutine = useCallback(
    async (ruleId: string, routineId: string) => {
      try {
        await linkRoutineMut.mutateAsync({ ruleId, routineId });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : COPY.error_generic);
      }
    },
    [linkRoutineMut],
  );

  const handleUnlinkRoutine = useCallback(
    async (ruleId: string, routineId: string) => {
      try {
        await unlinkRoutineMut.mutateAsync({ ruleId, routineId });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : COPY.error_generic);
      }
    },
    [unlinkRoutineMut],
  );

  const handlePreviewEvaluate = useCallback(
    async (objectType: string, framerId: string) => {
      try {
        await evaluateMut.mutateAsync({
          object_type: objectType,
          context: [{ framer_id: framerId }],
          dry_run: true,
        });
      } catch {
        toast.error(COPY.error_simulate);
      }
    },
    [evaluateMut],
  );

  // -- Loading --
  const isLoading =
    framersQuery.isLoading ||
    framerTypesQuery.isLoading ||
    targetObjectsQuery.isLoading ||
    rulesQuery.isLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-3" aria-busy="true" aria-label="Carregando enquadradores">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 rounded" />
        ))}
      </div>
    );
  }

  // -- Error --
  const firstError =
    framersQuery.error || framerTypesQuery.error || targetObjectsQuery.error || rulesQuery.error;
  if (firstError) {
    return (
      <div className="p-6" role="alert">
        <p className="text-destructive font-medium mb-2">{COPY.error_load_framers}</p>
        {'correlationId' in (firstError as unknown as Record<string, unknown>) && (
          <p className="text-xs text-muted-foreground mb-3">
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
          }}
        >
          {COPY.btn_retry}
        </Button>
      </div>
    );
  }

  const PANELS: { key: Panel; label: string }[] = [
    { key: 'framers', label: 'Enquadradores' },
    { key: 'objects', label: 'Objetos-Alvo' },
    { key: 'incidence', label: 'Regras de Incidencia' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Parametrizacao Contextual</h1>
        {canWrite && (
          <Button onClick={() => setDrawer({ open: true, mode: 'create' })}>
            Novo enquadrador
          </Button>
        )}
      </div>

      {/* Panel tabs */}
      <div className="flex gap-1 mb-6 border-b border-border" role="tablist">
        {PANELS.map((panel) => (
          <button
            key={panel.key}
            role="tab"
            type="button"
            aria-selected={activePanel === panel.key}
            onClick={() => setActivePanel(panel.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors -mb-px ${
              activePanel === panel.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {panel.label}
          </button>
        ))}
      </div>

      {/* Panel: Enquadradores */}
      {activePanel === 'framers' && (
        <div>
          <div className="mb-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                const val = e.target.value as FramerStatus | '';
                setStatusFilter(val);
                setFramerFilters(val ? { status: val } : {});
              }}
              aria-label="Filtrar por status"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos os status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {framers.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">{COPY.empty_framers}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valido ate</TableHead>
                  {(canWrite || canDelete) && <TableHead>Acoes</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {framers.map((f) => {
                  const typeName = framerTypes.find((t) => t.id === f.framer_type_id)?.nome ?? '—';
                  const expiring = isExpiringSoon(f.valid_until);

                  return (
                    <TableRow key={f.id}>
                      <TableCell className="font-mono">{f.codigo}</TableCell>
                      <TableCell>{f.nome}</TableCell>
                      <TableCell>{typeName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge className={`text-xs ${framerStatusClass(f.status)}`}>
                            {f.status}
                          </Badge>
                          {expiring && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge className="text-xs bg-amber-500 text-white">
                                    Expirando
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>{COPY.tooltip_expirando}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {f.valid_until ? new Date(f.valid_until).toLocaleDateString() : '—'}
                      </TableCell>
                      {(canWrite || canDelete) && (
                        <TableCell>
                          <div className="flex gap-1">
                            {canWrite && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setDrawer({ open: true, mode: 'edit', framerId: f.id, framer: f })
                                }
                              >
                                Editar
                              </Button>
                            )}
                            {canDeactivateFramer(userScopes, f.status) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => setDeactivateTarget(f)}
                              >
                                Inativar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Panel: Objetos-Alvo */}
      {activePanel === 'objects' && (
        <div>
          {targetObjects.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              Nenhum objeto-alvo cadastrado.
            </p>
          ) : (
            <div className="space-y-2">
              {targetObjects.map((obj) => (
                <div
                  key={obj.id}
                  className="border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{obj.nome}</span>
                    <span className="text-xs text-muted-foreground">{obj.modulo_ecf ?? '—'}</span>
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">{obj.codigo}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Panel: Regras de Incidencia (Matrix) */}
      {activePanel === 'incidence' && (
        <IncidenceMatrix
          framers={framers.filter((f) => f.status === 'ACTIVE')}
          targetObjects={targetObjects}
          rules={rules}
          canWrite={canWrite}
          canEvaluate={canEvaluateEngine(userScopes)}
          onCreateRule={handleCreateRule}
          onLinkRoutine={handleLinkRoutine}
          onUnlinkRoutine={handleUnlinkRoutine}
          onPreview={handlePreviewEvaluate}
          previewResult={evaluateMut.data ?? null}
          previewLoading={evaluateMut.isPending}
        />
      )}

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
      <Dialog open={!!deactivateTarget} onOpenChange={(open) => !open && setDeactivateTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inativar Enquadrador</DialogTitle>
            <DialogDescription>{COPY.confirm_deactivate}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivateConfirm}
              disabled={deleteFramerMut.isPending}
            >
              {deleteFramerMut.isPending ? 'Inativando...' : 'Inativar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
