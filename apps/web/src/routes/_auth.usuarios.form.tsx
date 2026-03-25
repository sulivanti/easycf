import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { UserFormPage } from '@modules/foundation/pages/users/UserFormPage';

export const Route = createRoute({
  path: '/usuarios/form',
  getParentRoute: () => authRoute,
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: search.id as string | undefined,
  }),
  component: UserFormWrapper,
});

function UserFormWrapper() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <UserFormPage
      userId={id}
      onSuccess={() => navigate({ to: '/usuarios' })}
      onCancel={() => navigate({ to: '/usuarios' })}
    />
  );
}
