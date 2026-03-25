import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { RulesConfigPage } from '@modules/movement-approval/pages/config/RulesConfigPage';

export const Route = createRoute({
  path: '/approvals/config',
  getParentRoute: () => authRoute,
  component: RulesConfigPage,
});
