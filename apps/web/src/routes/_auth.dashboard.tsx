import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { DashboardPage } from '@modules/backoffice-admin/pages/DashboardPage';

export const Route = createRoute({
  path: '/dashboard',
  getParentRoute: () => authRoute,
  component: DashboardPage,
});
