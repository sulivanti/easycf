import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { UsersListPage } from '@modules/foundation/pages/users/UsersListPage';

export const Route = createRoute({
  path: '/usuarios',
  getParentRoute: () => authRoute,
  component: UsuariosWrapper,
});

function UsuariosWrapper() {
  const navigate = useNavigate();

  return (
    <UsersListPage
      onCreateClick={() => navigate({ to: '/usuarios/form', search: {} })}
      onEditClick={(id) => navigate({ to: '/usuarios/form', search: { id } })}
    />
  );
}
