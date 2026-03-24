/**
 * @contract FR-002, FR-003, FR-004
 * React Query mutations for cycle lifecycle actions: publish, fork, deprecate.
 * Invalidates both cycles list and flow graph on success.
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publishCycle, forkCycle, deprecateCycle } from '../api/process-modeling.api.js';
import { CYCLES_KEY } from './use-cycles.js';
import { FLOW_KEY } from './use-flow.js';

/** @contract FR-002 — POST /admin/cycles/:id/publish */
export function usePublishCycle() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publishCycle(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: CYCLES_KEY });
      qc.invalidateQueries({ queryKey: [...FLOW_KEY, id] });
    },
  });
}

/** @contract FR-003 — POST /admin/cycles/:id/fork with Idempotency-Key */
export function useForkCycle() {
  const qc = useQueryClient();
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const mutation = useMutation({
    mutationFn: (id: string) => forkCycle(id, idempotencyKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CYCLES_KEY });
    },
  });

  const regenerateKey = useCallback(() => setIdempotencyKey(crypto.randomUUID()), []);

  return { ...mutation, regenerateKey };
}

/** @contract FR-004 — PATCH /admin/cycles/:id (status→DEPRECATED) */
export function useDeprecateCycle() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deprecateCycle(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: CYCLES_KEY });
      qc.invalidateQueries({ queryKey: [...FLOW_KEY, id] });
    },
  });
}
