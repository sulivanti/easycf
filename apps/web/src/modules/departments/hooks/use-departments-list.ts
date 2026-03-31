/**
 * @contract FR-007
 * React Query hook for departments list with cursor pagination.
 * queryKey: ['departments', 'list', filters]
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDepartments } from '../api/departments.api.js';
import type { DepartmentFilters } from '../types/departments.types.js';

export const DEPARTMENTS_LIST_KEY = ['departments', 'list'] as const;

export function useDepartmentsList(filters: DepartmentFilters) {
  return useQuery({
    queryKey: [...DEPARTMENTS_LIST_KEY, filters],
    queryFn: ({ signal }) => fetchDepartments(filters, signal),
  });
}

export function useInvalidateDepartmentsList() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: DEPARTMENTS_LIST_KEY });
}
