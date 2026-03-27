import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { MovementDetailPage } from '@modules/movement-approval/pages/movements/MovementDetailPage';

export const Route = createRoute({
  path: '/approvals/movements/$id',
  getParentRoute: () => authRoute,
  component: MovementDetailWrapper,
});

function MovementDetailWrapper() {
  const { id } = Route.useParams();
  return <MovementDetailPage movementId={id} />;
}
