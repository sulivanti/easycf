/**
 * @contract FR-007, INT-006, DOC-FND-000
 *
 * Mutation para POST /auth/change-password.
 * - 200 → Toast sucesso + fechar modal + invalidar cache auth_me
 * - 422 (senha atual incorreta) → Toast + foco no campo
 * - 422 (política) → Toast com detail RFC 9457
 * - 401 → interceptor redireciona para /login
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, ApiError, generateCorrelationId } from '../api/api-client';
import { AUTH_ME_QUERY_KEY, useInvalidateAuthMe } from './use-auth-me';
import { emitRequested, emitSucceeded, emitFailed } from '../api/telemetry';
import type { ChangePasswordRequest, AuthMeResponse } from '../types/backoffice-admin.types';

export function useChangePassword() {
  const invalidateAuthMe = useInvalidateAuthMe();
  const queryClient = useQueryClient();

  return useMutation<
    { data: { message: string }; correlationId: string },
    ApiError,
    ChangePasswordRequest
  >({
    mutationFn: async (payload) => {
      const correlationId = generateCorrelationId();
      const cachedUser = queryClient.getQueryData<AuthMeResponse>(AUTH_ME_QUERY_KEY);
      const telemetryOpts = {
        screenId: 'UX-SHELL-001' as const,
        actionId: 'submit_change_password',
        operationId: 'auth_change_password',
        correlationId,
        tenantId: cachedUser?.tenant.id,
      };
      const startTime = emitRequested(telemetryOpts);

      try {
        const result = await apiRequest<{ message: string }>({
          method: 'POST',
          path: '/auth/change-password',
          body: payload,
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
    onSuccess: () => {
      invalidateAuthMe();
    },
  });
}
