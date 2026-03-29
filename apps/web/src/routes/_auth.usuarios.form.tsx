import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { UserFormPage } from '@modules/users/pages/UserFormPage';

export const Route = createRoute({
  path: '/usuarios/form',
  getParentRoute: () => authRoute,
  component: UserFormWrapper,
});

function UserFormWrapper() {
  const navigate = useNavigate();

  return (
    <UserFormPage
      onNavigateToList={() => navigate({ to: '/usuarios' })}
    />
  );
}
