/**
 * @contract UX-SGR-003, F04
 * Page: Grade de Exclusão em Massa.
 * Route: /{modulo}/{rotina}/exclusao-em-massa
 *
 * Flow: SelectionList → (Verify) → DeleteConfirmationPanel → (Confirm) → DeleteResultFeedback
 */

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';
import type { DeleteValidationResult, DeleteBatchResult } from '../types/smartgrid.types';
import { COPY } from '../types/smartgrid.types';
import { PageHeader } from '@shared/ui/page-header';
import { Button } from '@shared/ui/button';
import { Spinner } from '@shared/ui/spinner';
import { useValidateForDelete, useDeleteBatch } from '../hooks/use-delete';
import { DeleteConfirmationPanel } from '../components/DeleteConfirmationPanel';
import { DeleteResultFeedback } from '../components/DeleteResultFeedback';

type ScreenPhase = 'selection' | 'verified' | 'completed';

interface DeleteRecord {
  readonly id: string;
  readonly displayLabel: string;
  readonly currentState: Record<string, unknown>;
}

interface BulkDeletePageProps {
  readonly framerId: string;
  readonly objectType: string;
  readonly records: readonly DeleteRecord[];
  readonly targetEndpoint: string;
  readonly onNavigateBack: () => void;
}

/** @contract UX-SGR-003 */
export function BulkDeletePage({
  framerId,
  objectType,
  records,
  targetEndpoint,
  onNavigateBack,
}: BulkDeletePageProps) {
  const validateMutation = useValidateForDelete();
  const deleteMutation = useDeleteBatch();

  const [phase, setPhase] = useState<ScreenPhase>('selection');
  const [validationResults, setValidationResults] = useState<DeleteValidationResult[]>([]);
  const [deleteResult, setDeleteResult] = useState<DeleteBatchResult | null>(null);

  // ---------------------------------------------------------------------------
  // Verify all records for delete eligibility
  // ---------------------------------------------------------------------------

  /** @contract FR-007, BR-009 */
  const handleVerify = useCallback(async () => {
    try {
      const results = await validateMutation.mutateAsync({
        framerId,
        objectType,
        records: records.map((r) => ({
          id: r.id,
          displayLabel: r.displayLabel,
          currentState: r.currentState,
        })),
      });
      setValidationResults(results);
      setPhase('verified');
    } catch {
      toast.error(COPY.validateDeleteError);
    }
  }, [validateMutation, framerId, objectType, records]);

  // ---------------------------------------------------------------------------
  // Confirm deletion (only allowed records)
  // ---------------------------------------------------------------------------

  /** @contract BR-009 — soft-delete only allowed records */
  const handleConfirmDelete = useCallback(async () => {
    const allowedIds = validationResults.filter((r) => r.allowed).map((r) => r.record_id);
    if (allowedIds.length === 0) return;

    try {
      const result = await deleteMutation.mutateAsync({
        targetEndpoint,
        recordIds: allowedIds,
      });
      setDeleteResult(result);
      setPhase('completed');

      if (result.failed === 0) {
        toast.success(COPY.deleteSuccess(result.succeeded));
      } else {
        toast.warning(COPY.deletePartial(result.succeeded, result.failed));
      }
    } catch {
      toast.error(COPY.deleteError);
    }
  }, [validationResults, deleteMutation, targetEndpoint]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="bg-[#F5F5F3] min-h-full p-6">
      {/* --- PageHeader: título + botão Verificar --- */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Exclusão em Massa"
          description={`${records.length} registros selecionados`}
        />
        {phase === 'selection' && (
          <Button
            onClick={handleVerify}
            disabled={validateMutation.isPending || records.length === 0}
            className="h-10 rounded-lg bg-[#2E86C1] px-5 text-[13px] font-bold text-white hover:bg-[#2577AC]"
          >
            {validateMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4" /> Verificando…
              </span>
            ) : (
              'Verificar'
            )}
          </Button>
        )}
      </div>

      {/* --- Grid de registros (fase selection) --- */}
      {phase === 'selection' && (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#E8E8E6] bg-white">
          {/* Header */}
          <div className="flex h-11 items-center border-b border-[#F0F0EE] bg-[#FAFAFA] px-4">
            <span className="w-[60px] text-[10px] font-bold uppercase tracking-wider text-[#888888]">
              STATUS
            </span>
            <span className="w-[120px] text-[10px] font-bold uppercase tracking-wider text-[#888888]">
              CÓDIGO
            </span>
            <span className="min-w-0 flex-1 text-[10px] font-bold uppercase tracking-wider text-[#888888]">
              DESCRIÇÃO
            </span>
            <span className="w-[200px] text-[10px] font-bold uppercase tracking-wider text-[#888888]">
              RESULTADO
            </span>
          </div>

          {/* Rows */}
          {records.map((rec) => {
            const validation = validationResults.find((v) => v.record_id === rec.id);
            return (
              <div
                key={rec.id}
                className="flex h-12 items-center border-b border-[#F0F0EE] px-4"
              >
                {/* STATUS */}
                <span className="flex w-[60px] justify-center">
                  {validation ? (
                    validation.allowed ? (
                      <CheckCircle className="h-3.5 w-3.5 text-[#27AE60]" aria-label="Pode ser excluído" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-[#E74C3C]" aria-label="Bloqueado" />
                    )
                  ) : (
                    <span className="h-3.5 w-3.5" />
                  )}
                </span>

                {/* CÓDIGO */}
                <span className="w-[120px] text-[13px] font-medium text-[#111111]">
                  {rec.id}
                </span>

                {/* DESCRIÇÃO */}
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#111111]">
                  {rec.displayLabel}
                </span>

                {/* RESULTADO */}
                <span className="w-[200px] text-[12px] font-medium">
                  {validation ? (
                    validation.allowed ? (
                      <span className="text-[#1E7A42]">Pode ser excluído</span>
                    ) : (
                      <span className="text-[#E74C3C]">
                        Bloqueado: {validation.blocking_reason ?? '—'}
                      </span>
                    )
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* --- Painel de confirmação (fase verified) --- */}
      {phase === 'verified' && (
        <DeleteConfirmationPanel
          results={validationResults}
          deleting={deleteMutation.isPending}
          onConfirmDelete={handleConfirmDelete}
          onCancel={onNavigateBack}
        />
      )}

      {/* --- Feedback final (fase completed) --- */}
      {phase === 'completed' && deleteResult && (
        <DeleteResultFeedback result={deleteResult} onClose={onNavigateBack} />
      )}
    </div>
  );
}
