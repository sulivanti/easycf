import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { useAuthMe } from '@modules/backoffice-admin/hooks/use-auth-me';
import { IntegrationMonitorPage } from '@modules/integration-protheus/pages/IntegrationMonitorPage';

export const Route = createRoute({
  path: '/integration/monitor',
  getParentRoute: () => authRoute,
  component: IntegrationMonitorWrapper,
});

function IntegrationMonitorWrapper() {
  const { data: user } = useAuthMe();
  if (!user) return null;

  return <IntegrationMonitorPage userScopes={user.scopes} />;
}
