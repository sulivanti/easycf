import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { useAuthMe } from '@modules/backoffice-admin/hooks/use-auth-me';
import { FramersConfigPage } from '@modules/contextual-params/pages/FramersConfigPage';

export const Route = createRoute({
  path: '/framers',
  getParentRoute: () => authRoute,
  component: FramersWrapper,
});

function FramersWrapper() {
  const { data: user } = useAuthMe();
  if (!user) return null;

  return <FramersConfigPage userScopes={user.scopes} />;
}
