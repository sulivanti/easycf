import type { QueryClient } from '@tanstack/react-query';

export interface AuthContext {
  user: { id: string; email: string } | null;
}

export interface RouterContext {
  queryClient: QueryClient;
  auth: AuthContext;
}
