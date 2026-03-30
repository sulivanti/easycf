/**
 * @contract FR-013, FR-023, DOC-UX-010, DOC-ARC-003
 * Base HTTP client with X-Correlation-ID propagation, bearer auth,
 * Idempotency-Key support, RFC 9457 ProblemDetails error parsing,
 * and 401 interceptor with automatic refresh + retry (FR-023).
 */

import type { ProblemDetails } from '../types/common.types.js';

const API_BASE = '/api/v1';
const AUTH_STORAGE_KEY = 'auth_tokens';

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

// ---------------------------------------------------------------------------
// 401 Refresh mutex (FR-023 REQ-006)
// ---------------------------------------------------------------------------

let refreshPromise: Promise<void> | null = null;

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
  if (refreshPromise) {
    await refreshPromise;
    return true;
  }

  let resolve: () => void;
  refreshPromise = new Promise<void>((r) => { resolve = r; });

  const ok = await attemptRefresh();
  refreshPromise = null;
  resolve!();
  return ok;
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

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

  // 401 interceptor: try refresh once, then retry (FR-023 REQ-005)
  if (response.status === 401 && !options.skipAuth && path !== '/auth/refresh') {
    const refreshed = await waitForRefresh();
    if (refreshed) {
      // Retry with new token
      const retryHeaders: Record<string, string> = { ...headers };
      const newToken = getAccessToken();
      if (newToken) retryHeaders['Authorization'] = `Bearer ${newToken}`;

      const retryResponse = await fetch(`${API_BASE}${path}`, {
        method,
        headers: retryHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: 'include',
        signal: options.signal,
      });

      if (!retryResponse.ok) {
        const problem = await parseErrorResponse(retryResponse);
        throw new ApiError(retryResponse.status, problem);
      }
      if (retryResponse.status === 204) return undefined as T;
      return retryResponse.json() as Promise<T>;
    }

    // Refresh failed → force logout
    forceLogoutFromClient();
    const problem = await parseErrorResponse(response);
    throw new ApiError(401, problem);
  }

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
