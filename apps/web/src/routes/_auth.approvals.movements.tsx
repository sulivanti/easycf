import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { MovementsPage } from '@modules/movement-approval/pages/movements/MovementsPage';

export const Route = createRoute({
  path: '/approvals/movements',
  getParentRoute: () => authRoute,
  component: MovementsPage,
});
