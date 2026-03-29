import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { RuleCreatePage } from '@modules/movement-approval/pages/rules/RuleCreatePage';

export const Route = createRoute({
  path: '/approvals/rules/new',
  getParentRoute: () => authRoute,
  component: RuleCreatePage,
});
