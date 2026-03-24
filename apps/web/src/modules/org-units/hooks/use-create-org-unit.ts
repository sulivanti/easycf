/**
 * @contract FR-001, BR-012, UX-002
 * React Query mutation for org-unit creation with Idempotency-Key.
 * Invalidates tree + list on success.
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrgUnit } from '../api/org-units.api.js';
import { ORG_TREE_KEY } from './use-org-tree.js';
import { ORG_UNITS_LIST_KEY } from './use-org-units-list.js';
import type { CreateOrgUnitRequest } from '../types/org-units.types.js';

export function useCreateOrgUnit() {
  const qc = useQueryClient();
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const mutation = useMutation({
    mutationFn: (data: CreateOrgUnitRequest) => createOrgUnit(data, idempotencyKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORG_TREE_KEY });
      qc.invalidateQueries({ queryKey: ORG_UNITS_LIST_KEY });
    },
  });

  const regenerateKey = useCallback(() => setIdempotencyKey(crypto.randomUUID()), []);

  return { ...mutation, idempotencyKey, regenerateKey };
}
