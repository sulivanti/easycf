/**
 * @contract FR-001, FR-003, FR-004, UX-001
 * React Query mutations for org-unit write actions:
 * update, delete, restore, link tenant, unlink tenant.
 * All invalidate tree + list on success.
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateOrgUnit,
  deleteOrgUnit,
  restoreOrgUnit,
  linkTenant,
  unlinkTenant,
} from '../api/org-units.api.js';
import { ORG_TREE_KEY } from './use-org-tree.js';
import { ORG_UNITS_LIST_KEY } from './use-org-units-list.js';
import { ORG_UNIT_DETAIL_KEY } from './use-org-unit-detail.js';
import type { UpdateOrgUnitRequest, LinkTenantRequest } from '../types/org-units.types.js';

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ORG_TREE_KEY });
    qc.invalidateQueries({ queryKey: ORG_UNITS_LIST_KEY });
    qc.invalidateQueries({ queryKey: ORG_UNIT_DETAIL_KEY });
  };
}

/** @contract FR-001 — PATCH /org-units/:id */
export function useUpdateOrgUnit() {
  const invalidate = useInvalidateAll();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrgUnitRequest }) =>
      updateOrgUnit(id, data),
    onSuccess: invalidate,
  });
}

/** @contract FR-001 — DELETE /org-units/:id */
export function useDeleteOrgUnit() {
  const invalidate = useInvalidateAll();

  return useMutation({
    mutationFn: (id: string) => deleteOrgUnit(id),
    onSuccess: invalidate,
  });
}

/** @contract FR-004 — PATCH /org-units/:id/restore */
export function useRestoreOrgUnit() {
  const invalidate = useInvalidateAll();

  return useMutation({
    mutationFn: (id: string) => restoreOrgUnit(id),
    onSuccess: invalidate,
  });
}

/** @contract FR-003 — POST /org-units/:id/tenants with Idempotency-Key */
export function useLinkTenant() {
  const invalidate = useInvalidateAll();
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const mutation = useMutation({
    mutationFn: ({ orgUnitId, data }: { orgUnitId: string; data: LinkTenantRequest }) =>
      linkTenant(orgUnitId, data, idempotencyKey),
    onSuccess: invalidate,
  });

  const regenerateKey = useCallback(() => setIdempotencyKey(crypto.randomUUID()), []);

  return { ...mutation, regenerateKey };
}

/** @contract FR-003 — DELETE /org-units/:id/tenants/:tenantId */
export function useUnlinkTenant() {
  const invalidate = useInvalidateAll();

  return useMutation({
    mutationFn: ({ orgUnitId, tenantId }: { orgUnitId: string; tenantId: string }) =>
      unlinkTenant(orgUnitId, tenantId),
    onSuccess: invalidate,
  });
}
