/**
 * @contract FR-003, BR-002, BR-003
 * React Query hooks for motor evaluation (single + batch).
 * queryKey: ['smartgrid', 'evaluate']
 */

import { useMutation } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { evaluateSingle, evaluateBatch, applyEvaluationToRow } from '../api/smartgrid.api';
import { COPY } from '../types/smartgrid.types';
import type { GridRow, BatchEvaluationResult } from '../types/smartgrid.types';

/** @contract FR-003, BR-002 — single object evaluation via useMutation */
export function useEvaluateMotor() {
  return useMutation({
    mutationKey: ['smartgrid', 'evaluate'],
    mutationFn: (params: {
      framerId: string;
      objectType: string;
      data: Record<string, unknown>;
      objectId?: string;
      currentRecordState?: Record<string, unknown>;
    }) =>
      evaluateSingle(params.framerId, params.objectType, params.data, params.currentRecordState),
  });
}

/**
 * Hook for batch evaluation with progressive UI updates.
 * @contract BR-002, BR-003 — full re-validation, 1 call per row, throttled
 */
export function useBatchEvaluate() {
  const [validating, setValidating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const validateAll = useCallback(
    async (
      framerId: string,
      objectType: string,
      rows: readonly GridRow[],
      setRows: React.Dispatch<React.SetStateAction<GridRow[]>>,
    ): Promise<BatchEvaluationResult[]> => {
      setValidating(true);
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const results = await evaluateBatch(
        framerId,
        objectType,
        rows,
        (result) => {
          setRows((prev) =>
            prev.map((r) => {
              if (r._rowId !== result.rowId) return r;
              if (result.response) return applyEvaluationToRow(r, result.response);
              return {
                ...r,
                _status: 'blocked' as const,
                _blockingMessages: [
                  { field: '', message: result.error?.message ?? COPY.validateLineError },
                ],
                _validationMessages: [],
              };
            }),
          );
        },
        5,
        ctrl.signal,
      );

      setValidating(false);
      abortRef.current = null;
      return results;
    },
    [],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { validateAll, validating, abort } as const;
}
