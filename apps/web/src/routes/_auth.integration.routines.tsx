import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { useAuthMe } from '@modules/backoffice-admin/hooks/use-auth-me';
import { RoutineEditorPage } from '@modules/integration-protheus/pages/RoutineEditorPage';

export const Route = createRoute({
  path: '/integration/routines',
  getParentRoute: () => authRoute,
  component: IntegrationRoutinesWrapper,
});

function IntegrationRoutinesWrapper() {
  const { data: user } = useAuthMe();
  if (!user) return null;

  return <RoutineEditorPage userScopes={user.scopes} />;
}
