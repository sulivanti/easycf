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
import { Badge } from '../../../shared/ui/index.js';
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
      className={`
        rounded-lg border px-3 py-2 min-w-[140px] shadow-sm
        ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}
        ${readonly ? 'bg-gray-50 cursor-default' : 'bg-white cursor-grab'}
      `}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Stage name */}
      <div className="font-semibold text-sm mb-1">{stage.nome}</div>

      {/* Badges row */}
      <div className="flex gap-1 flex-wrap">
        {stage.is_initial && (
          <Badge variant="default" className="text-[10px] px-1.5 py-0">
            ⚑ Inicial
          </Badge>
        )}
        {stage.is_terminal && (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 border-amber-300 text-amber-700 bg-amber-50"
          >
            ⊠ Terminal
          </Badge>
        )}
        {stage.gates.length > 0 && (
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 bg-purple-100 text-purple-700"
          >
            {stage.gates.length} gate{stage.gates.length > 1 ? 's' : ''}
          </Badge>
        )}
        {stage.roles.length > 0 && (
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700"
          >
            {stage.roles.length} papel{stage.roles.length > 1 ? 'éis' : ''}
          </Badge>
        )}
      </div>
    </div>
  );
}

export const StageNode = memo(StageNodeComponent);
