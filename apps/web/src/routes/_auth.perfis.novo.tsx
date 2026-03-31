import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { RoleFormPage } from '@modules/foundation/pages/roles/RoleFormPage';

export const Route = createRoute({
  path: '/perfis/novo',
  getParentRoute: () => authRoute,
  component: () => <RoleFormPage />,
});
