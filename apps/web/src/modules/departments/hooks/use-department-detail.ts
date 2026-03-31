/**
 * @contract FR-007
 * React Query hook for single department detail.
 * queryKey: ['departments', 'detail', id]
 */

import { useQuery } from '@tanstack/react-query';
import { fetchDepartmentDetail } from '../api/departments.api.js';

export const DEPARTMENT_DETAIL_KEY = ['departments', 'detail'] as const;

export function useDepartmentDetail(id: string | null) {
  return useQuery({
    queryKey: [...DEPARTMENT_DETAIL_KEY, id],
    queryFn: ({ signal }) => fetchDepartmentDetail(id!, signal),
    enabled: !!id,
  });
}
