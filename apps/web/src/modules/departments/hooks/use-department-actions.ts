/**
 * @contract FR-007, UX-002
 * React Query mutations for department write actions:
 * update, delete, restore.
 * All invalidate list on success.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDepartment, deleteDepartment, restoreDepartment } from '../api/departments.api.js';
import { DEPARTMENTS_LIST_KEY } from './use-departments-list.js';
import { DEPARTMENT_DETAIL_KEY } from './use-department-detail.js';
import type { UpdateDepartmentRequest } from '../types/departments.types.js';

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: DEPARTMENTS_LIST_KEY });
    qc.invalidateQueries({ queryKey: DEPARTMENT_DETAIL_KEY });
  };
}

/** @contract FR-007 — PATCH /departments/:id */
export function useUpdateDepartment() {
  const invalidate = useInvalidateAll();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentRequest }) =>
      updateDepartment(id, data),
    onSuccess: invalidate,
  });
}

/** @contract FR-007 — DELETE /departments/:id */
export function useDeleteDepartment() {
  const invalidate = useInvalidateAll();

  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: invalidate,
  });
}

/** @contract FR-007 — PATCH /departments/:id/restore */
export function useRestoreDepartment() {
  const invalidate = useInvalidateAll();

  return useMutation({
    mutationFn: (id: string) => restoreDepartment(id),
    onSuccess: invalidate,
  });
}
