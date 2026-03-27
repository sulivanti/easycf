import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { FramerTypesPage } from '@modules/contextual-params/pages/FramerTypesPage';

export const Route = createRoute({
  path: '/parametros/tipos-framer',
  getParentRoute: () => authRoute,
  component: FramerTypesPage,
});
