import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { TenantsPage } from '@modules/foundation/pages/tenants/TenantsPage';

export const Route = createRoute({
  path: '/filiais',
  getParentRoute: () => authRoute,
  component: TenantsPage,
});
