/**
 * @contract FR-001.2, UX-001.2
 * React Query hooks for access share management.
 * queryKey: ['identity-advanced', 'shares', filters]
 * queryKey: ['identity-advanced', 'my-shared-accesses']
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAccessShares,
  createAccessShare,
  revokeAccessShare,
  fetchMySharedAccesses,
} from '../api/identity-advanced.api.js';
import type {
  AccessShareFilters,
  CreateAccessShareRequest,
} from '../types/identity-advanced.types.js';

export const SHARES_KEY = ['identity-advanced', 'shares'] as const;
export const MY_SHARED_KEY = ['identity-advanced', 'my-shared-accesses'] as const;

/** @contract FR-001.2 — GET /admin/access-shares with cursor pagination */
export function useAccessShares(filters: AccessShareFilters) {
  return useQuery({
    queryKey: [...SHARES_KEY, filters],
    queryFn: ({ signal }) => fetchAccessShares(filters, signal),
  });
}

/** @contract FR-001.2 — GET /my/shared-accesses */
export function useMySharedAccesses() {
  return useQuery({
    queryKey: [...MY_SHARED_KEY],
    queryFn: ({ signal }) => fetchMySharedAccesses(signal),
  });
}

/** @contract FR-001.2 — POST /admin/access-shares with Idempotency-Key */
export function useCreateAccessShare() {
  const qc = useQueryClient();
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const mutation = useMutation({
    mutationFn: (data: CreateAccessShareRequest) => createAccessShare(data, idempotencyKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHARES_KEY });
      qc.invalidateQueries({ queryKey: MY_SHARED_KEY });
    },
  });

  const regenerateKey = useCallback(() => setIdempotencyKey(crypto.randomUUID()), []);

  return { ...mutation, regenerateKey };
}

/** @contract FR-001.2 — DELETE /admin/access-shares/:id */
export function useRevokeAccessShare() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revokeAccessShare(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SHARES_KEY });
      qc.invalidateQueries({ queryKey: MY_SHARED_KEY });
    },
  });
}
