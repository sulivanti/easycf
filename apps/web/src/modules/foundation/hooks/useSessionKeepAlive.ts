/**
 * @contract FR-023, REQ-001, REQ-003, REQ-004, GUD-002
 *
 * Orchestrates proactive token refresh based on user activity.
 *
 * Every `checkIntervalMs` (default 30s), checks:
 *  1. Is the user active (within idle timeout)?
 *  2. Is the access token expiring within `refreshWindowSeconds`?
 *
 * If both → calls POST /auth/refresh proactively.
 * If user is idle → does nothing (session expires naturally).
 *
 * Mount this hook once in AppShell.
 */

import { useEffect, useRef } from 'react';
import { useActivityTracker } from './useActivityTracker.js';
import { authApi } from '../api/auth.api.js';

const AUTH_STORAGE_KEY = 'auth_tokens';

function getTokenExpiresAt(): number | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { expires_in?: number; _stored_at?: number };
    if (!parsed.expires_in) return null;
    const storedAt = parsed._stored_at ?? 0;
    if (storedAt === 0) return null;
    return storedAt + parsed.expires_in * 1000;
  } catch {
    return null;
  }
}

function persistTokensFromRefresh(data: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}): void {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      _stored_at: Date.now(),
    }),
  );
}

export interface UseSessionKeepAliveOptions {
  idleTimeoutMs?: number;
  refreshWindowSeconds?: number;
  checkIntervalMs?: number;
}

export function useSessionKeepAlive(options?: UseSessionKeepAliveOptions): void {
  const refreshWindowSeconds = options?.refreshWindowSeconds ?? 120;
  const checkIntervalMs = options?.checkIntervalMs ?? 30_000;

  const { isActive } = useActivityTracker({
    idleTimeoutMs: options?.idleTimeoutMs,
  });

  const isRefreshingRef = useRef(false);
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isActiveRef.current) return;
      if (isRefreshingRef.current) return;

      const expiresAt = getTokenExpiresAt();
      if (expiresAt === null) return;

      const remainingMs = expiresAt - Date.now();
      if (remainingMs > refreshWindowSeconds * 1000) return;

      // Token expiring soon + user active → proactive refresh
      isRefreshingRef.current = true;
      try {
        const result = await authApi.refresh();
        persistTokensFromRefresh(result);
      } catch {
        // Refresh failed — let the 401 interceptor handle it reactively
      } finally {
        isRefreshingRef.current = false;
      }
    }, checkIntervalMs);

    return () => clearInterval(interval);
  }, [checkIntervalMs, refreshWindowSeconds]);
}
