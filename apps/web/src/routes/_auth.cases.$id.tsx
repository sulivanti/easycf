import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { useAuthMe } from '@modules/backoffice-admin/hooks/use-auth-me';
import { CasePanelPage } from '@modules/case-execution/pages/case-panel/CasePanelPage';

export const Route = createRoute({
  path: '/cases/$id',
  getParentRoute: () => authRoute,
  component: CasePanelWrapper,
});

function CasePanelWrapper() {
  const { id } = Route.useParams();
  const { data: user } = useAuthMe();
  if (!user) return null;

  return <CasePanelPage caseId={id} userScopes={user.scopes} />;
}
