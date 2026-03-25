import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { useAuthMe } from '@modules/backoffice-admin/hooks/use-auth-me';
import { ApprovalInboxPage } from '@modules/movement-approval/pages/inbox/ApprovalInboxPage';

export const Route = createRoute({
  path: '/approvals/inbox',
  getParentRoute: () => authRoute,
  component: ApprovalInboxWrapper,
});

function ApprovalInboxWrapper() {
  const { data: user } = useAuthMe();
  if (!user) return null;

  return <ApprovalInboxPage currentUserId={user.id} />;
}
