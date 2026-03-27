import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { useAuthMe } from '@modules/backoffice-admin/hooks/use-auth-me';
import { UserInvitePage } from '@modules/users/pages/UserInvitePage';

export const Route = createRoute({
  path: '/usuarios/$userId/convite',
  getParentRoute: () => authRoute,
  component: UserInviteWrapper,
});

function UserInviteWrapper() {
  const { userId } = Route.useParams();
  const { data: user } = useAuthMe();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <UserInvitePage
      userId={userId}
      userScopes={user.scopes}
      onNavigateBack={() => navigate({ to: '/usuarios' })}
    />
  );
}
