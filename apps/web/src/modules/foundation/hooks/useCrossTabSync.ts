/**
 * @contract FR-024, FR-000-M04
 *
 * Listens for `storage` events to detect logout in another tab.
 * When `auth_tokens` is removed externally → redirect to /login.
 *
 * Mount this hook once in AppShell.
 */

import { useEffect } from 'react';

const AUTH_STORAGE_KEY = 'auth_tokens';

export function useCrossTabSync(): void {
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== AUTH_STORAGE_KEY) return;
      if (event.newValue === null) {
        window.location.href = '/login';
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
}
