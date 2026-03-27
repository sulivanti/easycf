import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { McpActionsPage } from '@modules/mcp-automation/pages/McpActionsPage';

export const Route = createRoute({
  path: '/mcp/actions',
  getParentRoute: () => authRoute,
  component: McpActionsPage,
});
