import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { useAuthMe } from '@modules/backoffice-admin/hooks/use-auth-me';
import { OrgScopeManagementPage } from '@modules/identity-advanced/pages/OrgScopeManagementPage';

export const Route = createRoute({
  path: '/identity/org-scope',
  getParentRoute: () => authRoute,
  component: OrgScopeWrapper,
});

function OrgScopeWrapper() {
  const { data: user } = useAuthMe();
  if (!user) return null;

  return <OrgScopeManagementPage userId={user.id} userName={user.name} userScopes={user.scopes} />;
}
