import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { RolesPage } from '@modules/foundation/pages/roles/RolesPage';

export const Route = createRoute({
  path: '/perfis',
  getParentRoute: () => authRoute,
  component: RolesPage,
});
