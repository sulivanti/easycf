import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { McpActionTypesPage } from '@modules/mcp-automation/pages/McpActionTypesPage';

export const Route = createRoute({
  path: '/mcp/action-types',
  getParentRoute: () => authRoute,
  component: McpActionTypesPage,
});
