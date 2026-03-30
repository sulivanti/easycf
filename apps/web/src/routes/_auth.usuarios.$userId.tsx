import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { UserEditPage } from '@modules/users/pages/UserEditPage';
import { useAuthMe } from '@modules/backoffice-admin/hooks/use-auth-me';

export const Route = createRoute({
  path: '/usuarios/$userId',
  getParentRoute: () => authRoute,
  component: UserEditWrapper,
});

function UserEditWrapper() {
  const navigate = useNavigate();
  const { userId } = Route.useParams();
  const { data: me } = useAuthMe();
  const userScopes = me?.scopes ?? [];

  return (
    <UserEditPage
      userId={userId}
      userScopes={userScopes}
      onNavigateToList={() => navigate({ to: '/usuarios' })}
    />
  );
}
