/**
 * @contract FR-006, BR-004, INT-001, INT-002, INT-003, INT-004, INT-005, INT-006
 *
 * HTTP client centralizado para o módulo Backoffice Admin.
 * - Injeta X-Correlation-ID (UUID v4) em toda requisição
 * - Intercepta 401 → redirect /login via router
 * - Retorna respostas tipadas + correlationId para toasts
 */

import type { ProblemDetail } from '../types/backoffice-admin.types';

const API_BASE = '/api/v1';
const REQUEST_TIMEOUT_MS = 5_000;

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

    if (response.status === 401) {
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
