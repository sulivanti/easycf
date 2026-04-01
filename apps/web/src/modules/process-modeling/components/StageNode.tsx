/**
 * @contract UX-005 §2.5 (StageNode), FR-012
 *
 * Custom React Flow node for a process stage.
 * Displays: name, badges (gates count, roles count, initial flag, terminal flag).
 * Handles: selection, double-click to open config panel.
 */

import { memo } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import type { FlowStageItem } from '../types/process-modeling.types.js';

export interface StageNodeData {
  stage: FlowStageItem;
  readonly: boolean;
  onConfigOpen?: (stageId: string) => void;
}

function StageNodeComponent({ data, selected }: NodeProps<StageNodeData>) {
  const { stage, readonly, onConfigOpen } = data;

  const handleDoubleClick = () => {
    if (onConfigOpen) onConfigOpen(stage.id);
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={[
        'w-[180px] min-h-[72px] rounded-xl shadow-sm',
        selected
          ? 'border-2 border-[#1A5F8B]'
          : 'border border-[#2E86C1]',
        readonly
          ? 'bg-white/70 opacity-70 cursor-default'
          : 'bg-white cursor-grab',
      ].join(' ')}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Stage name */}
      <div className="px-3 pt-3 pb-1 text-[13px] font-semibold text-[#111111] leading-tight truncate">
        {stage.nome}
      </div>

      {/* Badges row */}
      <div className="flex gap-1 flex-wrap px-3 pb-2">
        {stage.is_initial && (
          <span className="text-[9px] font-bold text-[#888888] bg-[#F5F5F3] rounded px-1.5 py-0.5 leading-none">
            ⚑ Inicial
          </span>
        )}
        {stage.is_terminal && (
          <span className="text-[9px] font-bold text-[#888888] bg-[#F5F5F3] rounded px-1.5 py-0.5 leading-none">
            ⊠ Terminal
          </span>
        )}
        {stage.gates.length > 0 && (
          <span className="text-[9px] font-bold text-[#888888] bg-[#F5F5F3] rounded px-1.5 py-0.5 leading-none">
            {stage.gates.length} gate{stage.gates.length > 1 ? 's' : ''}
          </span>
        )}
        {stage.roles.length > 0 && (
          <span className="text-[9px] font-bold text-[#888888] bg-[#F5F5F3] rounded px-1.5 py-0.5 leading-none">
            {stage.roles.length} {stage.roles.length > 1 ? 'papéis' : 'papel'}
          </span>
        )}
      </div>
    </div>
  );
}

export const StageNode = memo(StageNodeComponent);
