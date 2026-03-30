/**
 * @contract FR-001-M01, UX-001-C03
 * React Query mutation for user status updates (block/unblock/reactivate).
 * Invalidates users list on success.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserStatus } from '../api/users.api.js';
import { USERS_LIST_KEY } from './use-users-list.js';

export function useUpdateStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: 'ACTIVE' | 'BLOCKED' | 'INACTIVE';
    }) => updateUserStatus(userId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_LIST_KEY });
    },
  });
}
