/**
 * @contract FR-001-M01, UX-001-C03
 * React Query mutation for admin password reset.
 * Does not invalidate cache (no status change).
 */

import { useMutation } from '@tanstack/react-query';
import { resetUserPassword } from '../api/users.api.js';

export function useResetPassword() {
  return useMutation({
    mutationFn: (userId: string) => resetUserPassword(userId),
  });
}
