/**
 * @contract FR-023, SEC-005, REQ-002, REQ-008
 *
 * Detects user activity via DOM events and persists the last activity
 * timestamp in sessionStorage. Exposes `lastActivity` and `isActive`
 * for the keep-alive orchestrator.
 *
 * - Events: click, keydown, scroll, touchstart, mousemove
 * - Mousemove throttled to 1 update per `throttleMs` (default 30s)
 * - Passive listeners for scroll/touch (GUD-001)
 * - Survives page reload via sessionStorage (REQ-008)
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const DEFAULT_EVENTS = ['click', 'keydown', 'scroll', 'touchstart', 'mousemove'];
const DEFAULT_THROTTLE_MS = 30_000;
const DEFAULT_STORAGE_KEY = 'ecf_last_activity';
const DEFAULT_IDLE_TIMEOUT_MS =
  Number(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (import.meta as any).env?.VITE_SESSION_IDLE_TIMEOUT_MS,
  ) || 1_800_000; // 30 min

export interface UseActivityTrackerOptions {
  events?: string[];
  throttleMs?: number;
  storageKey?: string;
  idleTimeoutMs?: number;
}

export interface UseActivityTrackerReturn {
  lastActivity: number;
  isActive: boolean;
}

function readStoredTimestamp(key: string): number {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const val = Number(raw);
      if (Number.isFinite(val) && val > 0) return val;
    }
  } catch {
    // sessionStorage unavailable (SSR, iframe sandbox, etc.)
  }
  return Date.now();
}

export function useActivityTracker(options?: UseActivityTrackerOptions): UseActivityTrackerReturn {
  const events = options?.events ?? DEFAULT_EVENTS;
  const throttleMs = options?.throttleMs ?? DEFAULT_THROTTLE_MS;
  const storageKey = options?.storageKey ?? DEFAULT_STORAGE_KEY;
  const idleTimeoutMs = options?.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS;

  const [lastActivity, setLastActivity] = useState(() => readStoredTimestamp(storageKey));
  const lastUpdateRef = useRef(lastActivity);

  const recordActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current < throttleMs) return;
    lastUpdateRef.current = now;
    setLastActivity(now);
    try {
      sessionStorage.setItem(storageKey, String(now));
    } catch {
      // quota exceeded or unavailable — non-critical
    }
  }, [throttleMs, storageKey]);

  useEffect(() => {
    const passiveEvents = new Set(['scroll', 'touchstart', 'mousemove']);

    for (const event of events) {
      const opts = passiveEvents.has(event) ? { passive: true } : undefined;
      document.addEventListener(event, recordActivity, opts);
    }

    return () => {
      for (const event of events) {
        document.removeEventListener(event, recordActivity);
      }
    };
  }, [events, recordActivity]);

  const isActive = Date.now() - lastActivity < idleTimeoutMs;

  return { lastActivity, isActive };
}
