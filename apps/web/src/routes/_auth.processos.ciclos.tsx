import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { useAuthMe } from '@modules/backoffice-admin/hooks/use-auth-me';
import { CyclesListPage } from '@modules/process-modeling/pages/CyclesListPage';

export const Route = createRoute({
  path: '/processos/ciclos',
  getParentRoute: () => authRoute,
  component: CyclesWrapper,
});

function CyclesWrapper() {
  const { data: user } = useAuthMe();
  if (!user) return null;

  return <CyclesListPage userScopes={user.scopes} />;
}
