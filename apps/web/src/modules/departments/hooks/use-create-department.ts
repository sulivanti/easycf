/**
 * @contract FR-007, ADR-004
 * React Query mutation for department creation with Idempotency-Key.
 * Invalidates list on success.
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDepartment } from '../api/departments.api.js';
import { DEPARTMENTS_LIST_KEY } from './use-departments-list.js';
import type { CreateDepartmentRequest } from '../types/departments.types.js';

export function useCreateDepartment() {
  const qc = useQueryClient();
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const mutation = useMutation({
    mutationFn: (data: CreateDepartmentRequest) => createDepartment(data, idempotencyKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DEPARTMENTS_LIST_KEY });
    },
  });

  const regenerateKey = useCallback(() => setIdempotencyKey(crypto.randomUUID()), []);

  return { ...mutation, idempotencyKey, regenerateKey };
}
