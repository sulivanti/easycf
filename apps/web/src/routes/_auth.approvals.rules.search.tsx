import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { RulesSearchPage } from '@modules/movement-approval/pages/rules/RulesSearchPage';

export const Route = createRoute({
  path: '/approvals/rules/search',
  getParentRoute: () => authRoute,
  component: RulesSearchPage,
});
