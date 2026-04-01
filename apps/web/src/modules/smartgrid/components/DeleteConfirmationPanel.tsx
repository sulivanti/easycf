/**
 * @contract UX-SGR-003, BR-009, UX-011-M01 §D4
 * Split-view overlay: blocked records (red) vs ready records (green).
 * Card width 720px, rounded-xl. Buttons: "Cancelar" / "Excluir {N} registros".
 */

import { Button } from '@shared/ui/button';
import type { DeleteValidationResult } from '../types/smartgrid.types';
import { COPY } from '../types/smartgrid.types';
import { isDeleteConfirmEnabled } from '../hooks/use-grid-rules';

interface DeleteConfirmationPanelProps {
  readonly results: readonly DeleteValidationResult[];
  readonly deleting: boolean;
  readonly onConfirmDelete: () => void;
  readonly onCancel: () => void;
}

/** @contract UX-SGR-003, UX-011-M01 §D4 — split-view confirmation panel */
export function DeleteConfirmationPanel({
  results,
  deleting,
  onConfirmDelete,
  onCancel,
}: DeleteConfirmationPanelProps) {
  const allowed = results.filter((r) => r.allowed);
  const blocked = results.filter((r) => !r.allowed);
  const confirmEnabled = isDeleteConfirmEnabled(results) && !deleting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[720px] overflow-hidden rounded-xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        {/* Header */}
        <div className="border-b border-[#E8E8E6] px-6 py-5">
          <h3 className="m-0 text-lg font-bold text-[#111111]">Confirmação de Exclusão</h3>
        </div>

        {/* Split view */}
        <div className="flex min-h-[300px]">
          {/* Blocked panel (red) */}
          <div className="flex-1 border-r border-[#F0F0EE] bg-[#FFEBEE] p-5">
            <h4 className="mb-3 text-sm font-bold text-[#E74C3C]">
              Não podem ser excluídos ({blocked.length})
            </h4>
            {blocked.length === 0 && (
              <p className="text-xs text-[#888888]">Nenhum registro bloqueado.</p>
            )}
            {blocked.map((r) => (
              <div
                key={r.record_id}
                className="mb-2 rounded-lg border border-[#F5C6CB] bg-white p-3"
              >
                <p className="m-0 text-[13px] font-semibold text-[#111111]">
                  {r.display_label}
                </p>
                {r.blocking_reason && (
                  <p className="m-0 mt-1 text-xs text-[#E74C3C]">{r.blocking_reason}</p>
                )}
              </div>
            ))}
          </div>

          {/* Ready panel (green) */}
          <div className="flex-1 bg-[#E8F8EF] p-5">
            <h4 className="mb-3 text-sm font-bold text-[#27AE60]">
              Prontos para exclusão ({allowed.length})
            </h4>
            {allowed.length === 0 && (
              <p role="alert" className="text-xs font-semibold text-[#E74C3C]">
                {COPY.allBlocked}
              </p>
            )}
            {allowed.map((r) => (
              <div
                key={r.record_id}
                className="mb-2 rounded-lg border border-[#B5E8C9] bg-white p-3"
              >
                <p className="m-0 text-[13px] font-semibold text-[#111111]">
                  {r.display_label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[#E8E8E6] px-6 py-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={deleting}
            className="h-10 rounded-lg border-[#E8E8E6] px-5 text-[13px] font-semibold text-[#555555]"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirmDelete}
            disabled={!confirmEnabled}
            className="h-10 rounded-lg bg-[#E74C3C] px-5 text-[13px] font-bold text-white hover:bg-[#D44333] disabled:cursor-not-allowed disabled:bg-[#E8E8E6] disabled:text-[#CCCCCC]"
          >
            {deleting ? 'Excluindo…' : `Excluir ${allowed.length} registros`}
          </Button>
        </div>
      </div>
    </div>
  );
}
