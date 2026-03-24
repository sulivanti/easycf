/**
 * @contract FR-001, INT-001, BR-001, BR-003, SEC-001
 *
 * Mutation para POST /auth/login.
 * - 200 → redirect /dashboard
 * - 200 + mfa_required → Toast fallback (PENDENTE-004 Opção B)
 * - 401 → Toast genérico (BR-001)
 * - 403 → Toast conta bloqueada
 * - 429 → Toast rate limit + retry_after
 */

import { useMutation } from '@tanstack/react-query';
import { apiRequest, ApiError, generateCorrelationId } from '../api/api-client';
import { emitRequested, emitSucceeded, emitFailed } from '../api/telemetry';
import type { LoginRequest, LoginResponse } from '../types/backoffice-admin.types';

export function useLogin() {
  return useMutation<{ data: LoginResponse; correlationId: string }, ApiError, LoginRequest>({
    mutationFn: async (payload) => {
      const correlationId = generateCorrelationId();
      const telemetryOpts = {
        screenId: 'UX-AUTH-001' as const,
        actionId: 'submit_login',
        operationId: 'auth_login',
        correlationId,
      };
      const startTime = emitRequested(telemetryOpts);

      try {
        const result = await apiRequest<LoginResponse>({
          method: 'POST',
          path: '/auth/login',
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
