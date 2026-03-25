import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { useAuthMe } from '@modules/backoffice-admin/hooks/use-auth-me';
import { SharesDelegationsPanelPage } from '@modules/identity-advanced/pages/SharesDelegationsPanelPage';

export const Route = createRoute({
  path: '/identity/delegations',
  getParentRoute: () => authRoute,
  component: DelegationsWrapper,
});

function DelegationsWrapper() {
  const { data: user } = useAuthMe();
  if (!user) return null;

  return (
    <SharesDelegationsPanelPage
      userScopes={user.scopes}
      currentUserId={user.id}
      availableScopes={user.scopes}
    />
  );
}
