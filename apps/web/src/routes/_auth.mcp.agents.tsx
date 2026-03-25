import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { AgentsPage } from '@modules/mcp-automation/pages/agents/AgentsPage';

export const Route = createRoute({
  path: '/mcp/agents',
  getParentRoute: () => authRoute,
  component: AgentsPage,
});
