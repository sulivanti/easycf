/**
 * @contract UX-007-M01 §TriStateCell
 * TriStateCell — Celula tri-estado para a matriz de incidencia.
 * Ciclo de clique: EMPTY -> OBR -> OPC -> AUTO -> EMPTY
 */

import { cn } from '@shared/lib/utils';

export type TriState = 'EMPTY' | 'OBR' | 'OPC' | 'AUTO';

const STYLE_MAP: Record<TriState, { bg: string; border: string; label: string; color: string }> = {
  EMPTY: { bg: 'bg-[#F5F5F3]', border: 'border-[#E8E8E6]', label: '', color: '' },
  OBR: { bg: 'bg-[#EDE7F6]', border: 'border-[#B39DDB]', label: 'OBR', color: 'text-[#4A148C]' },
  OPC: { bg: 'bg-[#E0F2F1]', border: 'border-[#80CBC4]', label: 'OPC', color: 'text-[#004D40]' },
  AUTO: { bg: 'bg-[#FFF8E1]', border: 'border-[#FFD54F]', label: 'AUTO', color: 'text-[#E65100]' },
};

const CYCLE: TriState[] = ['EMPTY', 'OBR', 'OPC', 'AUTO'];

export interface TriStateCellProps {
  state: TriState;
  onClick: () => void;
  disabled?: boolean;
}

export function nextTriState(current: TriState): TriState {
  const idx = CYCLE.indexOf(current);
  return CYCLE[(idx + 1) % CYCLE.length];
}

export function TriStateCell({ state, onClick, disabled = false }: TriStateCellProps) {
  const style = STYLE_MAP[state];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center w-[38px] h-[32px] rounded-[6px] border text-xs font-semibold transition-colors select-none',
        style.bg,
        style.border,
        style.color,
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80',
      )}
      aria-label={state === 'EMPTY' ? 'Sem incidencia' : `Incidencia ${state}`}
    >
      {style.label}
    </button>
  );
}
