/**
 * Tests for auth hooks — focuses on useLogout flow.
 * Prevents: Incident #5 (redirect loop from uncleared session state).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

const mockLogoutApi = vi.fn().mockResolvedValue(undefined);
vi.mock('../api/auth.api.js', () => ({
  authApi: {
    login: vi.fn(),
    logout: () => mockLogoutApi(),
    refresh: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    mfaSetup: vi.fn(),
    mfaVerify: vi.fn(),
    mfaDisable: vi.fn(),
    listSessions: vi.fn(),
    revokeSession: vi.fn(),
    revokeAllSessions: vi.fn(),
  },
}));

import { useLogout, useLogin } from './use-auth.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  return { Wrapper, queryClient };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('useLogout (Incident #5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('clears localStorage auth_tokens on logout', async () => {
    // Pre-populate localStorage to simulate active session
    localStorage.setItem(
      'auth_tokens',
      JSON.stringify({ access_token: 'at-xxx', refresh_token: 'rt-xxx', expires_in: 900 }),
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.logout();
    });

    // Incident #5: localStorage MUST be cleared
    expect(localStorage.getItem('auth_tokens')).toBeNull();
  });

  it('clears React Query cache on logout', async () => {
    const { Wrapper, queryClient } = createWrapper();

    // Pre-populate a query to verify it gets cleared
    queryClient.setQueryData(['auth', 'profile'], { id: 'usr-001', email: 'test@ecf.dev' });
    expect(queryClient.getQueryData(['auth', 'profile'])).toBeDefined();

    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.logout();
    });

    // queryClient.clear() should remove all cached data
    expect(queryClient.getQueryData(['auth', 'profile'])).toBeUndefined();
  });

  it('navigates to /login on logout', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.logout();
    });

    // Incident #5: Must navigate away from authenticated routes
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
  });

  it('clears state even if API logout call fails', async () => {
    // Simulate API failure (network error, server down)
    mockLogoutApi.mockRejectedValueOnce(new Error('Network error'));

    localStorage.setItem(
      'auth_tokens',
      JSON.stringify({ access_token: 'at-xxx', refresh_token: 'rt-xxx' }),
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

    // Should not throw — onSettled fires regardless of success/error
    await act(async () => {
      try {
        await result.current.logout();
      } catch {
        // mutation.mutateAsync rejects, but onSettled still fires
      }
    });

    // Even on API failure, local state must be cleaned (Incident #5)
    expect(localStorage.getItem('auth_tokens')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
  });
});

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('persists tokens to localStorage on successful login', async () => {
    const { authApi } = await import('../api/auth.api.js');
    vi.mocked(authApi.login).mockResolvedValueOnce({
      access_token: 'at-new',
      refresh_token: 'rt-new',
      token_type: 'Bearer',
      expires_in: 900,
      user: { id: 'usr-001', email: 'test@ecf.dev', full_name: 'Test', status: 'ACTIVE' },
    });

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.login({ email: 'test@ecf.dev', password: 'pass' });
    });

    const stored = JSON.parse(localStorage.getItem('auth_tokens')!);
    expect(stored.access_token).toBe('at-new');
    expect(stored.refresh_token).toBe('rt-new');
  });
});
