import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { useAuthMe } from '@modules/backoffice-admin/hooks/use-auth-me';
import { CaseListPage } from '@modules/case-execution/pages/case-list/CaseListPage';

export const Route = createRoute({
  path: '/cases',
  getParentRoute: () => authRoute,
  component: CasesWrapper,
});

function CasesWrapper() {
  const { data: user } = useAuthMe();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <CaseListPage
      userScopes={user.scopes}
      onSelectCase={(caseId) => navigate({ to: '/cases/$id', params: { id: caseId } })}
    />
  );
}
