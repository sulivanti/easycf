import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { IntegrationServicesPage } from '@modules/integration-protheus/pages/IntegrationServicesPage';

export const Route = createRoute({
  path: '/integration/services',
  getParentRoute: () => authRoute,
  component: IntegrationServicesPage,
});
