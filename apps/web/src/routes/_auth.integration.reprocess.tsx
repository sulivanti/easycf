import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { ReprocessQueuePage } from '@modules/integration-protheus/pages/ReprocessQueuePage';

export const Route = createRoute({
  path: '/integration/reprocess',
  getParentRoute: () => authRoute,
  component: ReprocessQueuePage,
});
