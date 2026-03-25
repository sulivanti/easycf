import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { useAuthMe } from '@modules/backoffice-admin/hooks/use-auth-me';
import { RoutinesEditorPage } from '@modules/contextual-params/pages/RoutinesEditorPage';

export const Route = createRoute({
  path: '/routines',
  getParentRoute: () => authRoute,
  component: RoutinesWrapper,
});

function RoutinesWrapper() {
  const { data: user } = useAuthMe();
  if (!user) return null;

  return <RoutinesEditorPage userScopes={user.scopes} />;
}
