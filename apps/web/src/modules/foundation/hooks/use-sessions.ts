/**
 * @contract FR-002, UX-003
 * Sessions hooks — list, revoke individual, revoke all (kill-switch).
 * Uses @tanstack/react-query for server state (PKG-COD-001 §3.5).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api.js';
import type { SessionItem } from '../types/auth.types.js';

export const sessionKeys = {
  list: ['auth', 'sessions'] as const,
};

export function useSessions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: sessionKeys.list,
    queryFn: async () => {
      const res = await authApi.listSessions();
      return res.data;
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => authApi.revokeSession(sessionId),
    onSuccess: (_data, sessionId) => {
      queryClient.setQueryData<SessionItem[]>(sessionKeys.list, (prev) =>
        prev ? prev.filter((s) => s.id !== sessionId) : [],
      );
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: () => authApi.revokeAllSessions(),
    onSuccess: () => {
      queryClient.setQueryData<SessionItem[]>(sessionKeys.list, []);
    },
  });

  return {
    sessions: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refresh: () => queryClient.invalidateQueries({ queryKey: sessionKeys.list }),
    revokeSession: revokeMutation.mutateAsync,
    revokeAll: revokeAllMutation.mutateAsync,
    revoking: revokeMutation.isPending || revokeAllMutation.isPending,
  };
}
