import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { ExecutionsPage } from '@modules/mcp-automation/pages/executions/ExecutionsPage';

export const Route = createRoute({
  path: '/mcp/executions',
  getParentRoute: () => authRoute,
  component: ExecutionsPage,
});
