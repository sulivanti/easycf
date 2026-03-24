/**
 * @contract FR-003, UX-USR-003
 * React Query hook for user detail (invite status screen).
 * queryKey: ['users', 'detail', id]
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUserDetail } from '../api/users.api.js';

export const USER_DETAIL_KEY = ['users', 'detail'] as const;

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: [...USER_DETAIL_KEY, id],
    queryFn: () => fetchUserDetail(id),
    enabled: !!id,
  });
}

export function useInvalidateUserDetail() {
  const qc = useQueryClient();
  return (id: string) => qc.invalidateQueries({ queryKey: [...USER_DETAIL_KEY, id] });
}
