import { createRoute, redirect } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { LoginPage } from '@modules/foundation/pages/login/LoginPage';

export const Route = createRoute({
  path: '/login',
  getParentRoute: () => rootRoute,
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: search.token as string | undefined,
  }),
  beforeLoad: async ({ context }) => {
    if (context.auth?.user) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: LoginPage,
});
