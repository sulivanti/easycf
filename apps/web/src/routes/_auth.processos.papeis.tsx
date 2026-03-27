import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { ProcessRolesPage } from '@modules/process-modeling/pages/ProcessRolesPage';

export const Route = createRoute({
  path: '/processos/papeis',
  getParentRoute: () => authRoute,
  component: ProcessRolesPage,
});
