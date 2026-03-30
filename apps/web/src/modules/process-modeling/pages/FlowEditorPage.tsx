/**
 * @contract UX-005 §2 (UX-PROC-001), FR-011, FR-012, FR-013
 * @contract spec-cycle-editor-empty-canvas-first-stage
 *
 * Flow Editor Page — visual canvas for process cycle blueprints.
 * Route: /processos/ciclos/:id/editor
 *
 * States: loading, loaded, empty, error, readonly (PUBLISHED/DEPRECATED).
 * Uses React Flow for canvas rendering.
 * Double-click on canvas creates a new stage (auto-creating default macro-stage if needed).
 *
 * Tailwind CSS v4 + shared UI components + Dialog for confirmations.
 */

import { useState, useCallback, useMemo, useEffect, startTransition } from 'react';
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

// Swimlane colors (up to 8 macro-stages)
const _SWIMLANE_COLORS = [
  'bg-blue-50',
  'bg-green-50',
  'bg-yellow-50',
  'bg-pink-50',
  'bg-purple-50',
  'bg-orange-50',
  'bg-emerald-50',
  'bg-fuchsia-50',
];

const SWIMLANE_HEX = [
  '#eff6ff',
  '#f0fdf4',
  '#fefce8',
  '#fdf2f8',
  '#f5f3ff',
  '#fff7ed',
  '#ecfdf5',
  '#faf5ff',
];

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

  // Double-click to create stage (spec-cycle-editor-empty-canvas-first-stage)
  const {
    handleCanvasDoubleClick,
    isPending: creatingStage,
    lastCreatedStageId,
  } = useCreateStageFromCanvas({ cycleId, flow, readonly, userScopes });

  // Auto-open config panel when a new stage is created
  useEffect(() => {
    if (lastCreatedStageId) {
      setSelectedStageId(lastCreatedStageId);
    }
  }, [lastCreatedStageId]);

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
      {/* Header bar — A1 */}
      <div className="flex shrink-0 items-center justify-between border-b border-a1-border bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="font-display text-[15px] font-bold text-a1-text-primary">
            {flow.cycle.nome}
          </span>
          <span className="font-display text-[11px] text-a1-text-hint">v{flow.cycle.version}</span>
          <span
            className={`rounded-full px-2.5 py-0.5 font-display text-[10px] font-bold ${
              flow.cycle.status === 'PUBLISHED'
                ? 'bg-success-500/10 text-success-600'
                : flow.cycle.status === 'DEPRECATED'
                  ? 'bg-danger-500/10 text-danger-600'
                  : 'bg-primary-600/10 text-primary-600'
            }`}
          >
            {flow.cycle.status}
          </span>
        </div>
        <div className="flex gap-2">
          {canShowPublish(userScopes, flow.cycle.status) && (
            <Button size="sm" onClick={() => setPublishOpen(true)}>
              Publicar
            </Button>
          )}
          {canShowFork(userScopes, flow.cycle.status) && (
            <Button size="sm" variant="outline" onClick={handleFork} disabled={forking}>
              {forking ? 'Criando...' : 'Nova versão'}
            </Button>
          )}
          {canShowDeprecate(userScopes, flow.cycle.status) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  ···
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDeprecateOpen(true)}>
                  Deprecar ciclo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Readonly / Deprecated banners */}
      {flow.cycle.status === 'PUBLISHED' && (
        <div className="px-4 py-1.5 bg-amber-50 text-amber-800 text-xs">{COPY.readonly_banner}</div>
      )}
      {flow.cycle.status === 'DEPRECATED' && (
        <div className="px-4 py-1.5 bg-status-error-bg text-danger-600 text-xs">
          {COPY.deprecated_banner}
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative">
        {isEmpty ? (
          <div
            className="flex flex-col items-center justify-center gap-3 h-full text-a1-text-auxiliary cursor-pointer"
            onDoubleClick={handleCanvasDoubleClick}
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
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-40"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <line x1="10" y1="6.5" x2="14" y2="6.5" />
                  <line x1="6.5" y1="10" x2="6.5" y2="14" />
                </svg>
                <span className="text-sm">{COPY.empty_canvas}</span>
              </>
            )}
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
            <Controls />
            {totalNodes > 15 && <MiniMap />}
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
    const swimlaneColor = SWIMLANE_HEX[msIndex % SWIMLANE_HEX.length];

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
        },
        style: { background: swimlaneColor },
      });

      stage.transitions_out.forEach((t) => {
        edges.push({
          id: t.id,
          source: stage.id,
          target: t.to_stage_id,
          label: t.nome,
          style: {
            stroke: t.gate_required ? '#f97316' : '#9ca3af',
            strokeWidth: t.gate_required ? 2 : 1,
          },
          animated: t.gate_required,
        });
      });
    });
  });

  return { nodes, edges };
}
