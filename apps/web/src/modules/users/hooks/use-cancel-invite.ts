/**
 * @contract FR-001-M01, UX-001-C03
 * React Query mutation for cancelling a pending invite.
 * Invalidates users list on success.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelUserInvite } from '../api/users.api.js';
import { USERS_LIST_KEY } from './use-users-list.js';

export function useCancelInvite() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => cancelUserInvite(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_LIST_KEY });
    },
  });
}
