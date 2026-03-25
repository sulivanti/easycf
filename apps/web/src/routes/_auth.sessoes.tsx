import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { SessionsPage } from '@modules/foundation/pages/sessions/SessionsPage';

export const Route = createRoute({
  path: '/sessoes',
  getParentRoute: () => authRoute,
  component: SessionsPage,
});
