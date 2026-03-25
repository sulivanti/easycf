import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { OrgFormPage } from '@modules/org-units/pages/OrgFormPage';

export const Route = createRoute({
  path: '/org-units/form',
  getParentRoute: () => authRoute,
  validateSearch: (
    search: Record<string, unknown>,
  ): { mode?: 'create' | 'edit'; editId?: string; parentId?: string } => ({
    mode: (search.mode as 'create' | 'edit') ?? undefined,
    editId: search.editId as string | undefined,
    parentId: search.parentId as string | undefined,
  }),
  component: OrgFormWrapper,
});

function OrgFormWrapper() {
  const { mode = 'create', editId, parentId } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <OrgFormPage
      mode={mode}
      editId={editId}
      parentId={parentId}
      onSuccess={() => navigate({ to: '/org-units' })}
      onCancel={() => navigate({ to: '/org-units' })}
    />
  );
}
