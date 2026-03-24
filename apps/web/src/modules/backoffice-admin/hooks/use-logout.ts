/**
 * @contract FR-004, INT-002, BR-003
 *
 * Mutation para POST /auth/logout.
 * - Após resposta (sucesso OU erro de rede) → redirect /login via router
 * - Limpa estado local independente do resultado
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { apiRequest, ApiError, generateCorrelationId } from '../api/api-client';
import { emitRequested, emitSucceeded, emitFailed } from '../api/telemetry';
import { AUTH_ME_QUERY_KEY } from './use-auth-me';
import type { AuthMeResponse } from '../types/backoffice-admin.types';

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<{ data: { message: string }; correlationId: string }, ApiError, void>({
    mutationFn: async () => {
      const correlationId = generateCorrelationId();
      const cachedUser = queryClient.getQueryData<AuthMeResponse>(AUTH_ME_QUERY_KEY);
      const telemetryOpts = {
        screenId: 'UX-SHELL-001' as const,
        actionId: 'submit_logout',
        operationId: 'auth_logout',
        correlationId,
        tenantId: cachedUser?.tenant.id,
      };
      const startTime = emitRequested(telemetryOpts);

      try {
        const result = await apiRequest<{ message: string }>({
          method: 'POST',
          path: '/auth/logout',
          correlationId,
        });
        emitSucceeded({ ...telemetryOpts, startTime, httpStatus: 200 });
        return result;
      } catch (error) {
        if (error instanceof ApiError) {
          emitFailed({
            ...telemetryOpts,
            startTime,
            httpStatus: error.status,
            problemType: error.problem.type,
          });
        }
        throw error;
      }
    },
    onSettled: () => {
      queryClient.clear();
      navigate({ to: '/login' });
    },
  });
}
