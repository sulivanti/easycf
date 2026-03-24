/**
 * @contract FR-001.1, UX-001.1
 * React Query hooks for org scope management.
 * queryKey: ['identity-advanced', 'org-scopes', userId]
 * queryKey: ['identity-advanced', 'my-org-scopes']
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchOrgScopes,
  createOrgScope,
  deleteOrgScope,
  fetchMyOrgScopes,
} from '../api/identity-advanced.api.js';
import type { CreateOrgScopeRequest } from '../types/identity-advanced.types.js';

export const ORG_SCOPES_KEY = ['identity-advanced', 'org-scopes'] as const;
export const MY_ORG_SCOPES_KEY = ['identity-advanced', 'my-org-scopes'] as const;

/** @contract FR-001.1 — GET /admin/users/:id/org-scopes */
export function useOrgScopes(userId: string) {
  return useQuery({
    queryKey: [...ORG_SCOPES_KEY, userId],
    queryFn: ({ signal }) => fetchOrgScopes(userId, signal),
    enabled: !!userId,
  });
}

/** @contract FR-001.1 — GET /my/org-scopes */
export function useMyOrgScopes() {
  return useQuery({
    queryKey: [...MY_ORG_SCOPES_KEY],
    queryFn: ({ signal }) => fetchMyOrgScopes(signal),
  });
}

/** @contract FR-001.1 — POST /admin/users/:id/org-scopes with Idempotency-Key */
export function useCreateOrgScope(userId: string) {
  const qc = useQueryClient();
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const mutation = useMutation({
    mutationFn: (data: CreateOrgScopeRequest) => createOrgScope(userId, data, idempotencyKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...ORG_SCOPES_KEY, userId] });
    },
  });

  const regenerateKey = useCallback(() => setIdempotencyKey(crypto.randomUUID()), []);

  return { ...mutation, regenerateKey };
}

/** @contract FR-001.1 — DELETE /admin/users/:id/org-scopes/:scopeId */
export function useDeleteOrgScope(userId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (scopeId: string) => deleteOrgScope(userId, scopeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...ORG_SCOPES_KEY, userId] });
    },
  });
}
