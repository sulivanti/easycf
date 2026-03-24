/**
 * @contract FR-001, FR-002
 * React Query hook for role options (select dropdowns).
 * queryKey: ['users', 'roles'] — staleTime long (semi-static data).
 */

import { useQuery } from '@tanstack/react-query';
import { fetchRoles } from '../api/users.api.js';

export const ROLES_KEY = ['users', 'roles'] as const;

export function useRoleOptions() {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: fetchRoles,
    staleTime: 5 * 60_000,
  });
}
