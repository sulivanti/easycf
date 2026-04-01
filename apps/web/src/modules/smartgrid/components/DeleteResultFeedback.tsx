/**
 * @contract UX-SGR-003, UX-011-M01 §D5
 * Final feedback card after bulk delete: success section (green) + failure section (red).
 * Card width 480px, centered overlay.
 */

import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@shared/ui/button';
import type { DeleteBatchResult } from '../types/smartgrid.types';

interface DeleteResultFeedbackProps {
  readonly result: DeleteBatchResult;
  readonly onClose: () => void;
}

/** @contract UX-SGR-003, UX-011-M01 §D5 — delete-result-feedback component */
export function DeleteResultFeedback({ result, onClose }: DeleteResultFeedbackProps) {
  const succeeded = result.results.filter((r) => r.success);
  const failed = result.results.filter((r) => !r.success);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[480px] rounded-xl bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <h3 className="m-0 mb-4 text-lg font-bold text-[#111111]">Resultado da Exclusão</h3>

        {/* Success section */}
        {succeeded.length > 0 && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-[#E8F8EF] p-3">
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#1E7A42]" />
            <span className="text-sm font-semibold text-[#1E7A42]">
              {succeeded.length} registro{succeeded.length !== 1 ? 's' : ''} excluído{succeeded.length !== 1 ? 's' : ''} com sucesso
            </span>
          </div>
        )}

        {/* Failure section */}
        {failed.length > 0 && (
          <div className="rounded-lg bg-[#FFEBEE] p-3">
            <div className="mb-2 flex items-center gap-2">
              <XCircle className="h-5 w-5 flex-shrink-0 text-[#E74C3C]" />
              <span className="text-sm font-semibold text-[#E74C3C]">
                {failed.length} registro{failed.length !== 1 ? 's' : ''} não excluído{failed.length !== 1 ? 's' : ''}
              </span>
            </div>
            {failed.map((r) => (
              <p key={r.record_id} className="m-0 ml-[22px] text-xs text-[#888888]">
                {r.record_id}{r.error ? ` — ${r.error}` : ''}
              </p>
            ))}
          </div>
        )}

        {/* Close button */}
        <div className="mt-5 flex justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-lg border-[#E8E8E6] px-5 text-[13px] font-semibold text-[#555555]"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
