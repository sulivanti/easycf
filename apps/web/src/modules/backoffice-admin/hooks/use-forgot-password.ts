/**
 * @contract FR-002, INT-003, BR-002, SEC-001
 *
 * Mutation para POST /auth/forgot-password.
 * - Resposta SEMPRE exibe mensagem genérica positiva (anti-enumeração — BR-002)
 */

import { useMutation } from '@tanstack/react-query';
import { apiRequest, ApiError, generateCorrelationId } from '../api/api-client';
import { emitRequested, emitSucceeded, emitFailed } from '../api/telemetry';
import type { ForgotPasswordRequest } from '../types/backoffice-admin.types';

export function useForgotPassword() {
  return useMutation<
    { data: { message: string }; correlationId: string },
    ApiError,
    ForgotPasswordRequest
  >({
    mutationFn: async (payload) => {
      const correlationId = generateCorrelationId();
      const telemetryOpts = {
        screenId: 'UX-AUTH-001' as const,
        actionId: 'submit_forgot_password',
        operationId: 'auth_forgot_password',
        correlationId,
      };
      const startTime = emitRequested(telemetryOpts);

      try {
        const result = await apiRequest<{ message: string }>({
          method: 'POST',
          path: '/auth/forgot-password',
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
