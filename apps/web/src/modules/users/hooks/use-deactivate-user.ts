/**
 * @contract FR-001, UX-USR-001
 * React Query mutation for user deactivation (soft delete).
 * Invalidates users list on success.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deactivateUser } from '../api/users.api.js';
import { USERS_LIST_KEY } from './use-users-list.js';

export function useDeactivateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deactivateUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_LIST_KEY });
    },
  });
}
