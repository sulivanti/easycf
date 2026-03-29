import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { RulesListPage } from '@modules/movement-approval/pages/rules/RulesListPage';

export const Route = createRoute({
  path: '/approvals/rules',
  getParentRoute: () => authRoute,
  component: RulesListPage,
});
