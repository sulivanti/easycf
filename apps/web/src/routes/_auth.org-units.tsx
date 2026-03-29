import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { useAuthMe } from '@modules/backoffice-admin/hooks/use-auth-me';
import { OrgTreePage } from '@modules/org-units/pages/OrgTreePage';

export const Route = createRoute({
  path: '/org-units',
  getParentRoute: () => authRoute,
  component: OrgUnitsWrapper,
});

function OrgUnitsWrapper() {
  const { data: user } = useAuthMe();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <OrgTreePage
      userScopes={user.scopes}
      onNavigateHistory={(id: string) =>
        navigate({ to: '/org-units/form', search: { mode: 'edit' as const, editId: id } })
      }
    />
  );
}
