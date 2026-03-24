/**
 * @contract DATA-010, EX-OAS-001, SEC-010
 *
 * MCP Automation presentation layer — central re-export.
 */

export { agentsRoutes } from './routes/agents.route.js';
export { actionsRoutes } from './routes/actions.route.js';
export { executionsRoutes } from './routes/executions.route.js';
export { gatewayRoutes } from './routes/gateway.route.js';
export { mcpErrorHandler } from './error-handler.js';
