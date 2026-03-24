/**
 * @contract FR-001.3, UX-001.2
 * React Query hooks for access delegation management.
 * queryKey: ['identity-advanced', 'delegations']
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchDelegations,
  createDelegation,
  revokeDelegation,
} from '../api/identity-advanced.api.js';
import type { CreateAccessDelegationRequest } from '../types/identity-advanced.types.js';

export const DELEGATIONS_KEY = ['identity-advanced', 'delegations'] as const;

/** @contract FR-001.3 — GET /access-delegations (given + received) */
export function useDelegations() {
  return useQuery({
    queryKey: [...DELEGATIONS_KEY],
    queryFn: ({ signal }) => fetchDelegations(signal),
  });
}

/** @contract FR-001.3 — POST /access-delegations with Idempotency-Key */
export function useCreateDelegation() {
  const qc = useQueryClient();
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const mutation = useMutation({
    mutationFn: (data: CreateAccessDelegationRequest) => createDelegation(data, idempotencyKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DELEGATIONS_KEY });
    },
  });

  const regenerateKey = useCallback(() => setIdempotencyKey(crypto.randomUUID()), []);

  return { ...mutation, regenerateKey };
}

/** @contract FR-001.3 — DELETE /access-delegations/:id */
export function useRevokeDelegation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revokeDelegation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DELEGATIONS_KEY });
    },
  });
}
