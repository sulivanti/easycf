/**
 * @contract FR-013, DOC-UX-010, DOC-ARC-003
 * Base HTTP client with X-Correlation-ID propagation, bearer auth,
 * Idempotency-Key support, and RFC 9457 ProblemDetails error parsing.
 */

import type { ProblemDetails } from '../types/common.types.js';

const API_BASE = '/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetails,
  ) {
    super(problem.detail || problem.title || `HTTP ${status}`);
    this.name = 'ApiError';
  }

  get correlationId(): string | undefined {
    return this.problem.extensions?.correlationId;
  }
}

function generateCorrelationId(): string {
  return crypto.randomUUID();
}

function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem('auth_tokens');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { access_token?: string };
    return parsed.access_token ?? null;
  } catch {
    return null;
  }
}

export interface RequestOptions {
  idempotencyKey?: string;
  skipAuth?: boolean;
  signal?: AbortSignal;
}

async function parseErrorResponse(response: Response): Promise<ProblemDetails> {
  try {
    const body = await response.json();
    if (body && typeof body === 'object' && 'status' in body) {
      return body as ProblemDetails;
    }
    return {
      type: 'about:blank',
      title: response.statusText,
      status: response.status,
      detail: typeof body?.message === 'string' ? body.message : response.statusText,
    };
  } catch {
    return {
      type: 'about:blank',
      title: response.statusText,
      status: response.status,
      detail: response.statusText,
    };
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'X-Correlation-ID': generateCorrelationId(),
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (!options.skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
    signal: options.signal,
  });

  if (!response.ok) {
    const problem = await parseErrorResponse(response);
    throw new ApiError(response.status, problem);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const httpClient = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>('GET', path, undefined, options);
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('POST', path, body, options);
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('PATCH', path, body, options);
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('PUT', path, body, options);
  },

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>('DELETE', path, undefined, options);
  },
};
