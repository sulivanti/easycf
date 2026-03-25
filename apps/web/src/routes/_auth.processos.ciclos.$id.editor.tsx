import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { useAuthMe } from '@modules/backoffice-admin/hooks/use-auth-me';
import { FlowEditorPage } from '@modules/process-modeling/pages/FlowEditorPage';

export const Route = createRoute({
  path: '/processos/ciclos/$id/editor',
  getParentRoute: () => authRoute,
  component: FlowEditorWrapper,
});

function FlowEditorWrapper() {
  const { id } = Route.useParams();
  const { data: user } = useAuthMe();
  if (!user) return null;

  return <FlowEditorPage cycleId={id} userScopes={user.scopes} />;
}
