/**
 * @contract FR-006, FR-023, BR-004, INT-001, INT-002, INT-003, INT-004, INT-005, INT-006
 *
 * HTTP client centralizado para o módulo Backoffice Admin.
 * - Injeta X-Correlation-ID (UUID v4) em toda requisição
 * - Intercepta 401 → refresh + retry automático (FR-023)
 * - Retorna respostas tipadas + correlationId para toasts
 */

import type { ProblemDetail } from '../types/backoffice-admin.types';

const API_BASE = '/api/v1';
const REQUEST_TIMEOUT_MS = 5_000;
const AUTH_STORAGE_KEY = 'auth_tokens';

// ---------------------------------------------------------------------------
// Correlation ID
// ---------------------------------------------------------------------------

export function generateCorrelationId(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// ApiError (RFC 9457)
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetail,
    public readonly correlationId: string,
  ) {
    super(problem.detail ?? problem.title);
    this.name = 'ApiError';
  }
}

// ---------------------------------------------------------------------------
// Fetch wrapper
// ---------------------------------------------------------------------------

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown;
  correlationId?: string;
  timeout?: number;
}

// ---------------------------------------------------------------------------
// 401 Refresh mutex (FR-023 REQ-006)
// ---------------------------------------------------------------------------

let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-Correlation-ID': generateCorrelationId() },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        _stored_at: Date.now(),
      }),
    );
    return true;
  } catch {
    return false;
  }
}

function forceLogoutFromClient(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.href = '/login';
}

async function waitForRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = attemptRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Fetch wrapper
// ---------------------------------------------------------------------------

export async function apiRequest<T>(
  options: RequestOptions,
): Promise<{ data: T; correlationId: string }> {
  const correlationId = options.correlationId ?? generateCorrelationId();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout ?? REQUEST_TIMEOUT_MS);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Correlation-ID': correlationId,
  };

  try {
    const response = await fetch(`${API_BASE}${options.path}`, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: 'include',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 401 interceptor: try refresh once, then retry (FR-023 REQ-005)
    if (response.status === 401 && options.path !== '/auth/refresh') {
      const refreshed = await waitForRefresh();
      if (refreshed) {
        // Retry the original request
        const retryController = new AbortController();
        const retryTimeoutId = setTimeout(
          () => retryController.abort(),
          options.timeout ?? REQUEST_TIMEOUT_MS,
        );

        try {
          const retryResponse = await fetch(`${API_BASE}${options.path}`, {
            method: options.method,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            credentials: 'include',
            signal: retryController.signal,
          });

          clearTimeout(retryTimeoutId);

          if (!retryResponse.ok) {
            const problem = (await retryResponse.json().catch(() => ({
              type: '/problems/unknown',
              title: retryResponse.statusText,
              status: retryResponse.status,
            }))) as ProblemDetail;
            throw new ApiError(retryResponse.status, problem, correlationId);
          }

          const data = (await retryResponse.json()) as T;
          return { data, correlationId };
        } catch (retryError) {
          clearTimeout(retryTimeoutId);
          if (retryError instanceof ApiError) throw retryError;
          throw retryError;
        }
      }

      // Refresh failed → force logout
      forceLogoutFromClient();
      const problem: ProblemDetail = {
        type: '/problems/unauthorized',
        title: 'Unauthorized',
        status: 401,
      };
      throw new ApiError(401, problem, correlationId);
    }

    if (!response.ok) {
      const problem = (await response.json().catch(() => ({
        type: '/problems/unknown',
        title: response.statusText,
        status: response.status,
      }))) as ProblemDetail;
      throw new ApiError(response.status, problem, correlationId);
    }

    const data = (await response.json()) as T;
    return { data, correlationId };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) throw error;

    const problem: ProblemDetail = {
      type: '/problems/network-error',
      title: 'Network Error',
      status: 0,
      detail:
        error instanceof DOMException && error.name === 'AbortError'
          ? 'A requisição excedeu o tempo limite.'
          : 'Erro de conexão com o servidor.',
    };
    throw new ApiError(0, problem, correlationId);
  }
}
