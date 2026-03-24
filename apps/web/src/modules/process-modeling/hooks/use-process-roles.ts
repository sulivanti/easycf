/**
 * @contract FR-008, UX-005 §3.3
 * React Query hook for the global process roles catalog.
 * queryKey: ['process-modeling', 'roles']
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProcessRoles, createProcessRole } from '../api/process-modeling.api.js';
import type { CreateProcessRoleRequest } from '../types/process-modeling.types.js';

export const PROCESS_ROLES_KEY = ['process-modeling', 'roles'] as const;

/** @contract FR-008 — GET /admin/process-roles */
export function useProcessRoles() {
  return useQuery({
    queryKey: [...PROCESS_ROLES_KEY],
    queryFn: ({ signal }) => fetchProcessRoles(signal),
    select: (data) => data.data,
  });
}

/** @contract FR-008 — POST /admin/process-roles */
export function useCreateProcessRole() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProcessRoleRequest) => createProcessRole(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROCESS_ROLES_KEY });
    },
  });
}
