/**
 * @contract UX-005 §2.7, UX-005-C01, spec-fix-cycle-editor-empty-canvas-feedback
 *
 * Hook for creating stages via double-click on the React Flow canvas.
 * Handles auto-creation of a default macro-stage when none exist.
 *
 * Guards: readonly, missing write scope, pending mutation.
 * Exposes canCreate/blockReason/error for UI feedback on blocked actions.
 */

import { useState, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactFlow } from 'reactflow';
import { createMacroStage, createStage } from '../api/process-modeling.api.js';
import { FLOW_KEY } from './use-flow.js';
import { canWriteCycle, COPY } from '../types/process-modeling.types.js';
import type { FlowResponseDTO } from '../types/process-modeling.types.js';

interface UseCreateStageFromCanvasOptions {
  cycleId: string;
  flow: FlowResponseDTO | undefined;
  readonly: boolean;
  userScopes: readonly string[];
}

interface UseCreateStageFromCanvasResult {
  handleCanvasDoubleClick: (event: React.MouseEvent) => void;
  isPending: boolean;
  lastCreatedStageId: string | null;
  error: string | null;
  canCreate: boolean;
  blockReason: string | null;
}

/** Default macro-stage created when cycle has none */
const DEFAULT_MACRO_STAGE = {
  codigo: 'ETAPA-GERAL',
  nome: 'Etapa Geral',
  ordem: 1,
} as const;

function computeNextStageCode(totalStages: number): string {
  return `EST-${String(totalStages + 1).padStart(3, '0')}`;
}

function countTotalStages(flow: FlowResponseDTO): number {
  return flow.macro_stages.reduce((acc, ms) => acc + ms.stages.length, 0);
}

function getFirstMacroStageId(flow: FlowResponseDTO): string | null {
  if (flow.macro_stages.length === 0) return null;
  const sorted = [...flow.macro_stages].sort((a, b) => a.ordem - b.ordem);
  return sorted[0].id;
}

export function useCreateStageFromCanvas({
  cycleId,
  flow,
  readonly,
  userScopes,
}: UseCreateStageFromCanvasOptions): UseCreateStageFromCanvasResult {
  const qc = useQueryClient();
  const reactFlowInstance = useReactFlow();
  const [lastCreatedStageId, setLastCreatedStageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { canCreate, blockReason } = useMemo(() => {
    if (readonly) {
      return { canCreate: false, blockReason: COPY.empty_canvas_readonly };
    }
    if (!canWriteCycle(userScopes)) {
      return { canCreate: false, blockReason: COPY.empty_canvas_no_permission };
    }
    if (!flow) {
      return { canCreate: false, blockReason: null };
    }
    return { canCreate: true, blockReason: null };
  }, [readonly, userScopes, flow]);

  const mutation = useMutation({
    mutationFn: async (screenPosition: { x: number; y: number }) => {
      if (!flow) throw new Error('Flow not loaded');

      const position = reactFlowInstance.screenToFlowPosition(screenPosition);
      const totalStages = countTotalStages(flow);

      // Resolve macro-stage ID: create default if none exist
      let macroStageId = getFirstMacroStageId(flow);

      if (!macroStageId) {
        const created = await createMacroStage(cycleId, { ...DEFAULT_MACRO_STAGE });
        macroStageId = created.id;
      }

      // Create stage at click position
      const stage = await createStage(macroStageId, {
        codigo: computeNextStageCode(totalStages),
        nome: 'Novo estágio',
        ordem: totalStages + 1,
        is_initial: totalStages === 0,
        canvas_x: Math.round(position.x),
        canvas_y: Math.round(position.y),
      });

      return stage;
    },
    onSuccess: async (stage) => {
      setError(null);
      await qc.invalidateQueries({ queryKey: [...FLOW_KEY, cycleId] });
      setLastCreatedStageId(stage.id);
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : COPY.error_create_stage);
    },
  });

  const handleCanvasDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      // Guards with logging for debugging
      if (readonly) {
        console.warn('[useCreateStageFromCanvas] Blocked: cycle is readonly');
        return;
      }
      if (!canWriteCycle(userScopes)) {
        console.warn('[useCreateStageFromCanvas] Blocked: missing scope process:cycle:write');
        return;
      }
      if (mutation.isPending) {
        console.warn('[useCreateStageFromCanvas] Blocked: mutation already pending');
        return;
      }
      if (!flow) {
        console.warn('[useCreateStageFromCanvas] Blocked: flow data not loaded');
        return;
      }

      // Prevent trigger when double-clicking on a node (event target check)
      const target = event.target as HTMLElement;
      if (target.closest('.react-flow__node')) return;

      mutation.mutate({ x: event.clientX, y: event.clientY });
    },
    [readonly, userScopes, mutation, flow],
  );

  return {
    handleCanvasDoubleClick,
    isPending: mutation.isPending,
    lastCreatedStageId,
    error,
    canCreate,
    blockReason,
  };
}
