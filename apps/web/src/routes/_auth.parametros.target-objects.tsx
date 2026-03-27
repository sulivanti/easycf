import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { TargetObjectsPage } from '@modules/contextual-params/pages/TargetObjectsPage';

export const Route = createRoute({
  path: '/parametros/target-objects',
  getParentRoute: () => authRoute,
  component: TargetObjectsPage,
});
