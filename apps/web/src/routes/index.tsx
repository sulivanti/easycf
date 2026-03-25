import { createRoute, redirect } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';

export const Route = createRoute({
  path: '/',
  getParentRoute: () => rootRoute,
  beforeLoad: ({ context }) => {
    throw redirect({ to: context.auth?.user ? '/dashboard' : '/login' });
  },
});
