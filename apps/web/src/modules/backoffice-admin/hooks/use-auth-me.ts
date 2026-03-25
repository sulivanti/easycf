/**
 * @contract FR-004, FR-005, BR-008, INT-005, UX-SHELL-001, UX-DASH-001
 *
 * React Query hook para GET /auth/me.
 * - Cache 30s (staleTime) — compartilhado entre Shell e Dashboard via query key ['auth', 'me']
 * - Fonte única de dados do usuário autenticado (BR-008)
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest, ApiError, generateCorrelationId } from '../api/api-client';
import { emitRequested, emitSucceeded, emitFailed, type ScreenId } from '../api/telemetry';
import type { AuthMeResponse } from '../types/backoffice-admin.types';

export const AUTH_ME_QUERY_KEY = ['auth', 'me'] as const;

interface FetchAuthMeOpts {
  screenId: ScreenId;
  actionId: string;
}

async function fetchAuthMe(opts: FetchAuthMeOpts): Promise<AuthMeResponse> {
  const correlationId = generateCorrelationId();
  const telemetryOpts = {
    screenId: opts.screenId,
    actionId: opts.actionId,
    operationId: 'auth_me',
    correlationId,
  };
  const startTime = emitRequested(telemetryOpts);

  try {
    const { data } = await apiRequest<AuthMeResponse>({
      method: 'GET',
      path: '/auth/me',
      correlationId,
      timeout: 3_000,
    });
    emitSucceeded({ ...telemetryOpts, startTime, httpStatus: 200, tenantId: data.tenant.id });
    return data;
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
}

/**
 * @param screenId — UX-SHELL-001 para Shell, UX-DASH-001 para Dashboard
 * @param enabled — desabilita a query se false
 */
export function useAuthMe(screenId: ScreenId = 'UX-SHELL-001', enabled = true) {
  const actionId = screenId === 'UX-DASH-001' ? 'load_dashboard_profile' : 'load_current_user';

  return useQuery<AuthMeResponse, ApiError>({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: () => fetchAuthMe({ screenId, actionId }),
    staleTime: 30_000,
    enabled,
    retry: (_failureCount, error) => {
      if (error.status === 401) return false;
      return _failureCount < 1;
    },
  });
}

export function useInvalidateAuthMe() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
}
