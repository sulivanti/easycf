/**
 * @contract UX-005 §2 (UX-PROC-001), UX-005-C01, UX-005-M03, FR-011, FR-012, FR-013
 * @contract spec-cycle-editor-empty-canvas-first-stage
 * @contract spec-fix-cycle-editor-empty-canvas-feedback
 *
 * Flow Editor Page — visual canvas for process cycle blueprints.
 * Route: /processos/ciclos/:id/editor
 *
 * States: loading, loaded, empty (3 variants), error, readonly (PUBLISHED/DEPRECATED).
 * Uses React Flow for canvas rendering.
 * Double-click on canvas creates a new stage (auto-creating default macro-stage if needed).
 *
 * Tailwind CSS v4 + shared UI components + Dialog for confirmations.
 */

import { useState, useCallback, useMemo, useEffect, startTransition } from 'react';
import { toast } from 'sonner';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  Button,
  Spinner,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ConfirmationModal,
} from '../../../shared/ui/index.js';
import { useFlow } from '../hooks/use-flow.js';
import { usePublishCycle, useForkCycle, useDeprecateCycle } from '../hooks/use-cycle-actions.js';
import { useCreateStageFromCanvas } from '../hooks/use-create-stage-from-canvas.js';
import { StageNode } from '../components/StageNode.js';
import { StageConfigPanel } from '../components/StageConfigPanel.js';
import type { FlowResponseDTO, FlowStageItem } from '../types/process-modeling.types.js';
import {
  COPY,
  isCycleEditable,
  canShowPublish,
  canShowFork,
  canShowDeprecate,
} from '../types/process-modeling.types.js';

const nodeTypes = { stageNode: StageNode };

// Swimlane alternating backgrounds (spec 70 — D3)
// Even indices: #F0F7FF (blue tint), Odd indices: #FFF8F0 (orange tint)
const SWIMLANE_HEX = ['#F0F7FF', '#FFF8F0'];

interface FlowEditorPageProps {
  cycleId: string;
  userScopes: readonly string[];
}

/**
 * Wrapper that provides ReactFlowProvider context.
 * Required for useReactFlow() inside useCreateStageFromCanvas.
 */
export function FlowEditorPage(props: FlowEditorPageProps) {
  return (
    <ReactFlowProvider>
      <FlowEditorPageInner {...props} />
    </ReactFlowProvider>
  );
}

function FlowEditorPageInner({ cycleId, userScopes }: FlowEditorPageProps) {
  const { data: flow, isLoading, error, refetch } = useFlow(cycleId);
  const publishMutation = usePublishCycle();
  const { mutateAsync: forkAsync, regenerateKey, isPending: forking } = useForkCycle();
  const deprecateMutation = useDeprecateCycle();

  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  // Confirmation dialogs
  const [publishOpen, setPublishOpen] = useState(false);
  const [deprecateOpen, setDeprecateOpen] = useState(false);

  const readonly = flow ? !isCycleEditable(flow.cycle.status) : true;

  // Double-click to create stage (spec-cycle-editor-empty-canvas-first-stage, UX-005-C01)
  const {
    handleCanvasDoubleClick,
    isPending: creatingStage,
    lastCreatedStageId,
    error: stageCreateError,
    canCreate,
    blockReason,
  } = useCreateStageFromCanvas({ cycleId, flow, readonly, userScopes });

  // Auto-open config panel when a new stage is created
  useEffect(() => {
    if (lastCreatedStageId) {
      setSelectedStageId(lastCreatedStageId);
    }
  }, [lastCreatedStageId]);

  // Show toast on stage creation error (UX-005-C01)
  useEffect(() => {
    if (stageCreateError) {
      toast.error(stageCreateError);
    }
  }, [stageCreateError]);

  // Build React Flow nodes and edges from flow data
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!flow) return { nodes: [], edges: [] };
    return buildFlowElements(flow, readonly, setSelectedStageId);
  }, [flow, readonly]);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Sync when flow data changes
  useEffect(() => {
    startTransition(() => {
      setNodes(initialNodes);
      setEdges(initialEdges);
    });
  }, [initialNodes, initialEdges]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  // Selected stage data
  const selectedStage = useMemo<FlowStageItem | null>(() => {
    if (!selectedStageId || !flow) return null;
    for (const ms of flow.macro_stages) {
      for (const s of ms.stages) {
        if (s.id === selectedStageId) return s;
      }
    }
    return null;
  }, [selectedStageId, flow]);

  const totalNodes = flow ? flow.macro_stages.reduce((acc, ms) => acc + ms.stages.length, 0) : 0;

  // Handlers
  const handlePublish = useCallback(async () => {
    await publishMutation.mutateAsync(cycleId);
    setPublishOpen(false);
    refetch();
  }, [cycleId, publishMutation, refetch]);

  const handleFork = useCallback(async () => {
    const result = await forkAsync(cycleId);
    regenerateKey();
    window.location.href = `/processos/ciclos/${result.id}/editor`;
  }, [cycleId, forkAsync, regenerateKey]);

  const handleDeprecate = useCallback(async () => {
    await deprecateMutation.mutateAsync(cycleId);
    setDeprecateOpen(false);
    refetch();
  }, [cycleId, deprecateMutation, refetch]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div
          role="alert"
          className="rounded-md border border-a1-border bg-status-error-bg p-3 text-sm text-danger-600"
        >
          Erro ao carregar o ciclo. {error.message}
        </div>
      </div>
    );
  }

  if (!flow) return null;

  const isEmpty =
    flow.macro_stages.length === 0 || flow.macro_stages.every((ms) => ms.stages.length === 0);

  return (
    <div className="-m-6 flex h-[calc(100vh-52px)] flex-col">
      {/* TopToolbar — spec 70 D1: h:56, bg white, border-bottom #E8E8E6 */}
      <div
        className="flex shrink-0 items-center justify-between bg-white px-6"
        style={{ height: 56, borderBottom: '1px solid #E8E8E6' }}
      >
        <div className="flex items-center gap-3">
          <span className="font-display text-[18px] font-bold" style={{ color: '#111111' }}>
            {flow.cycle.nome}
          </span>
          {/* StatusBadge — 3 variants with exact spec 70 colors */}
          <span
            className="rounded-full px-2.5 py-0.5 font-display text-[10px] font-bold uppercase"
            style={
              flow.cycle.status === 'PUBLISHED'
                ? { color: '#1E7A42', backgroundColor: '#E8F8EF', border: '1px solid #B5E8C9' }
                : flow.cycle.status === 'DEPRECATED'
                  ? { color: '#888888', backgroundColor: '#F5F5F3', border: '1px solid #E8E8E6' }
                  : { color: '#B8860B', backgroundColor: '#FFF3E0', border: '1px solid #FFE0B2' }
            }
          >
            {flow.cycle.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* BtnSave — secondary: r:8, border #E8E8E6, h:36 */}
          {isCycleEditable(flow.cycle.status) && (
            <button
              type="button"
              className="flex items-center justify-center rounded-lg text-[13px] font-semibold"
              style={{
                height: 36,
                padding: '0 16px',
                border: '1px solid #E8E8E6',
                color: '#555555',
                backgroundColor: '#FFFFFF',
              }}
            >
              Salvar
            </button>
          )}
          {/* BtnPublish — primary: r:8, fill #2E86C1, h:36 */}
          {canShowPublish(userScopes, flow.cycle.status) && (
            <button
              type="button"
              className="flex items-center justify-center rounded-lg text-[13px] font-bold text-white"
              style={{
                height: 36,
                padding: '0 16px',
                backgroundColor: '#2E86C1',
                border: 'none',
              }}
              onClick={() => setPublishOpen(true)}
            >
              Publicar
            </button>
          )}
          {/* BtnOverflow — secondary: r:8, border #E8E8E6, w:36 h:36 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-center rounded-lg text-[16px] font-semibold"
                style={{
                  width: 36,
                  height: 36,
                  border: '1px solid #E8E8E6',
                  color: '#555555',
                  backgroundColor: '#FFFFFF',
                }}
              >
                ...
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Histórico</DropdownMenuItem>
              {canShowFork(userScopes, flow.cycle.status) && (
                <DropdownMenuItem onClick={handleFork} disabled={forking}>
                  {forking ? 'Criando...' : 'Nova versão (Fork)'}
                </DropdownMenuItem>
              )}
              {canShowDeprecate(userScopes, flow.cycle.status) && (
                <DropdownMenuItem onClick={() => setDeprecateOpen(true)}>
                  Deprecar ciclo
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ReadonlyBanner — spec 70 D6: h:44, bg #E3F2FD, centered, Fork button inline */}
      {flow.cycle.status === 'PUBLISHED' && (
        <div
          className="flex shrink-0 items-center justify-center gap-3"
          style={{ height: 44, backgroundColor: '#E3F2FD' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E86C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span className="text-[13px] font-medium" style={{ color: '#2E86C1' }}>
            Este ciclo está publicado. Crie um Fork para editar.
          </span>
          {canShowFork(userScopes, flow.cycle.status) && (
            <button
              type="button"
              className="text-[12px] font-bold"
              style={{
                height: 28,
                padding: '0 12px',
                borderRadius: 6,
                border: '1px solid #2E86C1',
                color: '#2E86C1',
                backgroundColor: 'transparent',
              }}
              onClick={handleFork}
              disabled={forking}
            >
              Fork
            </button>
          )}
        </div>
      )}
      {flow.cycle.status === 'DEPRECATED' && (
        <div
          className="flex shrink-0 items-center justify-center gap-3"
          style={{ height: 44, backgroundColor: '#F5F5F3' }}
        >
          <span className="text-[13px] font-medium" style={{ color: '#888888' }}>
            {COPY.deprecated_banner}
          </span>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative">
        {isEmpty ? (
          /* EmptyCanvasState — spec 70 D6: centered, 400x200, border 2px dashed #CCC, rounded-xl */
          <div
            className="flex h-full items-center justify-center"
            onDoubleClick={canCreate ? handleCanvasDoubleClick : undefined}
          >
            <div
              className={`flex flex-col items-center justify-center gap-4 rounded-xl ${canCreate ? 'cursor-pointer' : 'cursor-default'}`}
              style={{
                width: 400,
                height: 200,
                border: '2px dashed #CCCCCC',
              }}
            >
              {creatingStage ? (
                <Spinner />
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#CCCCCC"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <line x1="10" y1="6.5" x2="14" y2="6.5" />
                    <line x1="6.5" y1="10" x2="6.5" y2="14" />
                  </svg>
                  <span className="text-[16px] font-semibold" style={{ color: '#888888' }}>
                    {canCreate ? COPY.empty_canvas : (blockReason ?? COPY.empty_canvas)}
                  </span>
                </>
              )}
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onDoubleClick={handleCanvasDoubleClick}
            nodeTypes={nodeTypes}
            nodesDraggable={!readonly}
            nodesConnectable={!readonly}
            elementsSelectable
            fitView
          >
            <Background />
            {/* ZoomControls — spec 70 D5: absolute bottom-4 left-4, 36x36 buttons */}
            <Controls
              showInteractive={false}
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
              className="[&>button]:!w-9 [&>button]:!h-9 [&>button]:!rounded-lg [&>button]:!bg-white [&>button]:!border [&>button]:!border-[#E8E8E6]"
            />
            {/* MiniMap — spec 70 D5: absolute bottom-4 right-4, 120x80 */}
            {totalNodes > 15 && (
              <MiniMap
                style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  width: 120,
                  height: 80,
                  borderRadius: 8,
                  border: '1px solid #E8E8E6',
                  backgroundColor: '#FAFAFA',
                  overflow: 'hidden',
                }}
                maskColor="rgba(46,134,193,0.1)"
              />
            )}
          </ReactFlow>
        )}

        {/* Ghost node — visual feedback during stage creation */}
        {creatingStage && !isEmpty && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="rounded-lg border-2 border-dashed border-primary-400 bg-primary-50/50 px-4 py-3 animate-pulse">
              <Spinner />
            </div>
          </div>
        )}

        {/* Stage config panel */}
        {selectedStage && (
          <StageConfigPanel
            stage={selectedStage}
            allStages={flow.macro_stages.flatMap((ms) => ms.stages)}
            readonly={readonly}
            onClose={() => setSelectedStageId(null)}
          />
        )}
      </div>

      {/* Publish confirmation dialog */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publicar ciclo</DialogTitle>
            <DialogDescription>{COPY.confirm_publish}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePublish} disabled={publishMutation.isPending}>
              {publishMutation.isPending ? 'Publicando...' : 'Publicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deprecate confirmation dialog */}
      <ConfirmationModal
        open={deprecateOpen}
        onOpenChange={setDeprecateOpen}
        title="Deprecar ciclo"
        description={COPY.confirm_deprecate}
        variant="destructive"
        confirmLabel="Deprecar"
        onConfirm={handleDeprecate}
        isLoading={deprecateMutation.isPending}
      />
    </div>
  );
}

// ── Helper: Convert FlowResponseDTO → React Flow nodes/edges ──

function buildFlowElements(
  flow: FlowResponseDTO,
  readonly: boolean,
  onConfigOpen: (stageId: string) => void,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  flow.macro_stages.forEach((ms, msIndex) => {
    // Spec 70 D3: Even=#F0F7FF (blue), Odd=#FFF8F0 (orange)
    const swimlaneColor = SWIMLANE_HEX[msIndex % 2];

    ms.stages.forEach((stage) => {
      nodes.push({
        id: stage.id,
        type: 'stageNode',
        position: {
          x: stage.canvas_x ?? msIndex * 300,
          y: stage.canvas_y ?? stage.ordem * 120,
        },
        data: {
          stage,
          readonly,
          onConfigOpen,
          swimlaneColor,
        },
        style: { background: swimlaneColor },
      });

      // Spec 70 D4: TransitionEdge stroke #888888, gate_required #F39C12
      stage.transitions_out.forEach((t) => {
        edges.push({
          id: t.id,
          source: stage.id,
          target: t.to_stage_id,
          label: t.nome,
          labelStyle: { fontSize: 11, fontWeight: 400, fill: '#888888' },
          style: {
            stroke: t.gate_required ? '#F39C12' : '#888888',
            strokeWidth: 1.5,
          },
          animated: t.gate_required,
        });
      });
    });
  });

  return { nodes, edges };
}
