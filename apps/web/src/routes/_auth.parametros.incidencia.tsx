import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { IncidenceRulesPage } from '@modules/contextual-params/pages/IncidenceRulesPage';

export const Route = createRoute({
  path: '/parametros/incidencia',
  getParentRoute: () => authRoute,
  component: IncidenceRulesPage,
});
