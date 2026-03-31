import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { RoleFormPage } from '@modules/foundation/pages/roles/RoleFormPage';

export const Route = createRoute({
  path: '/perfis/$roleId',
  getParentRoute: () => authRoute,
  component: function RoleEditPage() {
    const { roleId } = Route.useParams();
    return <RoleFormPage roleId={roleId} />;
  },
});
