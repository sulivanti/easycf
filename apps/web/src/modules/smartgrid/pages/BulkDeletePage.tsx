/**
 * @contract UX-SGR-003, F04
 * Page: Grade de Exclusão em Massa.
 * Route: /{modulo}/{rotina}/exclusao-em-massa
 *
 * Flow: SelectionList → (Verify) → DeleteConfirmationPanel → (Confirm) → DeleteResultFeedback
 */

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { DeleteValidationResult, DeleteBatchResult } from '../types/smartgrid.types';
import { COPY } from '../types/smartgrid.types';
import { useValidateForDelete, useDeleteBatch } from '../hooks/use-delete';
import { SelectionList } from '../components/SelectionList';
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
    <div>
      <div className="border-b border-border px-4 py-3">
        <h2 className="m-0 text-xl font-semibold">Exclusão em massa</h2>
        <span className="text-sm text-muted-foreground">
          {records.length} registros selecionados
        </span>
      </div>

      {phase === 'selection' && (
        <SelectionList
          records={records.map((r) => ({ id: r.id, displayLabel: r.displayLabel }))}
          verifying={validateMutation.isPending}
          onVerify={handleVerify}
        />
      )}

      {phase === 'verified' && (
        <DeleteConfirmationPanel
          results={validationResults}
          deleting={deleteMutation.isPending}
          onConfirmDelete={handleConfirmDelete}
          onCancel={onNavigateBack}
        />
      )}

      {phase === 'completed' && deleteResult && (
        <DeleteResultFeedback result={deleteResult} onClose={onNavigateBack} />
      )}
    </div>
  );
}
