import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { UsersListPage } from '@modules/users/pages/UsersListPage';
import { useAuthMe } from '@modules/backoffice-admin/hooks/use-auth-me';

export const Route = createRoute({
  path: '/usuarios',
  getParentRoute: () => authRoute,
  component: UsuariosWrapper,
});

function UsuariosWrapper() {
  const navigate = useNavigate();
  const { data: me } = useAuthMe();
  const userScopes = me?.scopes ?? [];

  return (
    <UsersListPage
      userScopes={userScopes}
      onNavigateToCreate={() => navigate({ to: '/usuarios/form', search: {} })}
      onNavigateToInvite={(userId) =>
        navigate({ to: '/usuarios/$userId/convite', params: { userId } })
      }
      onNavigateToEdit={(userId) => navigate({ to: '/usuarios/$userId', params: { userId } })}
    />
  );
}
