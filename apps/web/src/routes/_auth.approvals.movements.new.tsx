import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { MovementCreatePage } from '@modules/movement-approval/pages/movements/MovementCreatePage';

export const Route = createRoute({
  path: '/approvals/movements/new',
  getParentRoute: () => authRoute,
  component: MovementCreatePage,
});
