import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { RuleEditPage } from '@modules/movement-approval/pages/rules/RuleEditPage';

export const Route = createRoute({
  path: '/approvals/rules/$id',
  getParentRoute: () => authRoute,
  component: RuleEditWrapper,
});

function RuleEditWrapper() {
  const { id } = Route.useParams();
  return <RuleEditPage ruleId={id} />;
}
