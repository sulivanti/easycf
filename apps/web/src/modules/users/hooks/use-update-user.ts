/**
 * @contract FR-002-EDIT, UX-USR-002
 * React Query mutation for updating user data (edit form).
 * Invalidates users list and user detail on success.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser } from '../api/users.api.js';
import { USERS_LIST_KEY } from './use-users-list.js';
import { USER_DETAIL_KEY } from './use-user-detail.js';

export function useUpdateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: { fullName?: string; roleId?: string; status?: string };
    }) => updateUser(userId, data),
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: USERS_LIST_KEY });
      qc.invalidateQueries({ queryKey: [...USER_DETAIL_KEY, variables.userId] });
    },
  });
}
