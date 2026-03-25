import { createRoute, redirect } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';

export const Route = createRoute({
  path: '/',
  getParentRoute: () => rootRoute,
  beforeLoad: () => {
    throw redirect({ to: '/login' });
  },
});
