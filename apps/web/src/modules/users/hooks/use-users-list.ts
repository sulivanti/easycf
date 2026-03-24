/**
 * @contract FR-001, UX-USR-001
 * React Query hook for paginated user list with filters.
 * queryKey: ['users', 'list', filters]
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUsers } from '../api/users.api.js';
import type { UserFilters } from '../types/users.types.js';

export const USERS_LIST_KEY = ['users', 'list'] as const;

export function useUsersList(filters: UserFilters) {
  return useQuery({
    queryKey: [...USERS_LIST_KEY, filters],
    queryFn: ({ signal }) => fetchUsers(filters, signal),
  });
}

export function useInvalidateUsersList() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: USERS_LIST_KEY });
}
