/**
 * @contract FR-023, FR-000-M04, REQ-001, REQ-003, REQ-004, REQ-005, GUD-002
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
 * Also listens for `visibilitychange` to handle tab-return scenarios:
 *  - Token expired while tab was hidden → forceLogout immediately
 *  - Token expiring soon → immediate refresh (no wait for next interval)
 *
 * Mount this hook once in AppShell.
 */

import { useEffect, useRef, useCallback } from 'react';
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

function forceLogoutFromClient(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.href = '/login';
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

  const doRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    try {
      const result = await authApi.refresh();
      persistTokensFromRefresh(result);
    } catch {
      // FR-000-M04 REQ-005: if token already expired, forceLogout instead of silencing
      const expiresAt = getTokenExpiresAt();
      if (expiresAt !== null && Date.now() > expiresAt) {
        forceLogoutFromClient();
        return;
      }
      // Otherwise let the 401 interceptor handle it reactively
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Periodic check (existing behavior)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isActiveRef.current) return;
      if (isRefreshingRef.current) return;

      const expiresAt = getTokenExpiresAt();
      if (expiresAt === null) return;

      const remainingMs = expiresAt - Date.now();
      if (remainingMs > refreshWindowSeconds * 1000) return;

      await doRefresh();
    }, checkIntervalMs);

    return () => clearInterval(interval);
  }, [checkIntervalMs, refreshWindowSeconds, doRefresh]);

  // FR-000-M04 REQ-003: Revalidate on tab return (visibilitychange)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') return;
      if (isRefreshingRef.current) return;

      const expiresAt = getTokenExpiresAt();
      if (expiresAt === null) return;

      const remainingMs = expiresAt - Date.now();
      if (remainingMs <= 0) {
        // Token already expired while tab was hidden → forceLogout
        forceLogoutFromClient();
        return;
      }
      if (remainingMs <= refreshWindowSeconds * 1000) {
        // Token expiring soon → immediate refresh (don't wait for next interval)
        void doRefresh();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshWindowSeconds, doRefresh]);
}
