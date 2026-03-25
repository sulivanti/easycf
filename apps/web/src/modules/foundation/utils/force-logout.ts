/**
 * @contract FR-000-C06
 *
 * Emergency logout — clears tokens and query cache, then hard-redirects to /login.
 * Used by 401 interceptors to break redirect loops (no router dependency).
 */

import type { QueryClient } from '@tanstack/react-query';

export function forceLogout(queryClient: QueryClient): void {
  localStorage.removeItem('auth_tokens');
  queryClient.clear();
  window.location.href = '/login';
}
