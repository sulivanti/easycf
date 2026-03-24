/**
 * @contract FR-003, INT-004, BR-003
 *
 * Mutation para POST /auth/reset-password.
 * - Token vem do query param ?token= da URL
 * - 200 → Toast sucesso + retorno ao painel login
 * - 400/422 → Toast "Link inválido ou expirado."
 */

import { useMutation } from '@tanstack/react-query';
import { apiRequest, ApiError, generateCorrelationId } from '../api/api-client';
import { emitRequested, emitSucceeded, emitFailed } from '../api/telemetry';
import type { ResetPasswordRequest } from '../types/backoffice-admin.types';

export function useResetPassword() {
  return useMutation<
    { data: { message: string }; correlationId: string },
    ApiError,
    ResetPasswordRequest
  >({
    mutationFn: async (payload) => {
      const correlationId = generateCorrelationId();
      const telemetryOpts = {
        screenId: 'UX-AUTH-001' as const,
        actionId: 'submit_reset_password',
        operationId: 'auth_reset_password',
        correlationId,
      };
      const startTime = emitRequested(telemetryOpts);

      try {
        const result = await apiRequest<{ message: string }>({
          method: 'POST',
          path: '/auth/reset-password',
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
  });
}
