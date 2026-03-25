import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { ComingSoonPage } from '@shared/ui/ComingSoonPage';

export const Route = createRoute({
  path: '/auditoria',
  getParentRoute: () => authRoute,
  component: ComingSoonPage,
});
