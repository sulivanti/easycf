import { Route as rootRoute } from './routes/__root';
import { Route as indexRoute } from './routes/index';
import { Route as authRoute } from './routes/_auth';
import { Route as authDashboardRoute } from './routes/_auth.dashboard';
import { Route as loginRoute } from './routes/login';

// Foundation / Admin
import { Route as authProfileRoute } from './routes/_auth.profile';
import { Route as authSessoesRoute } from './routes/_auth.sessoes';
import { Route as authUsuariosRoute } from './routes/_auth.usuarios';
import { Route as authUsuariosFormRoute } from './routes/_auth.usuarios.form';
import { Route as authPerfisRoute } from './routes/_auth.perfis';
import { Route as authFiliaisRoute } from './routes/_auth.filiais';

// Org Units (MOD-003)
import { Route as authOrgUnitsRoute } from './routes/_auth.org-units';
import { Route as authOrgUnitsFormRoute } from './routes/_auth.org-units.form';

// Identity Advanced (MOD-004)
import { Route as authIdentityOrgScopeRoute } from './routes/_auth.identity.org-scope';
import { Route as authIdentityDelegationsRoute } from './routes/_auth.identity.delegations';

// Process Modeling (MOD-005)
import { Route as authProcessosCiclosRoute } from './routes/_auth.processos.ciclos';
import { Route as authProcessosCiclosEditorRoute } from './routes/_auth.processos.ciclos.$id.editor';

// Case Execution (MOD-006)
import { Route as authCasesRoute } from './routes/_auth.cases';
import { Route as authCaseDetailRoute } from './routes/_auth.cases.$id';

// Contextual Params (MOD-007)
import { Route as authFramersRoute } from './routes/_auth.framers';
import { Route as authRoutinesRoute } from './routes/_auth.routines';

// Integration Protheus (MOD-008)
import { Route as authIntegrationMonitorRoute } from './routes/_auth.integration.monitor';
import { Route as authIntegrationRoutinesRoute } from './routes/_auth.integration.routines';

// Movement Approval (MOD-009)
import { Route as authApprovalsInboxRoute } from './routes/_auth.approvals.inbox';
import { Route as authApprovalsConfigRoute } from './routes/_auth.approvals.config';

// MCP Automation (MOD-010)
import { Route as authMcpAgentsRoute } from './routes/_auth.mcp.agents';
import { Route as authMcpExecutionsRoute } from './routes/_auth.mcp.executions';

// System
import { Route as authAuditoriaRoute } from './routes/_auth.auditoria';

const authRouteChildren = authRoute.addChildren([
  authDashboardRoute,
  authProfileRoute,
  authSessoesRoute,
  authUsuariosRoute,
  authUsuariosFormRoute,
  authPerfisRoute,
  authFiliaisRoute,
  authOrgUnitsRoute,
  authOrgUnitsFormRoute,
  authIdentityOrgScopeRoute,
  authIdentityDelegationsRoute,
  authProcessosCiclosRoute,
  authProcessosCiclosEditorRoute,
  authCasesRoute,
  authCaseDetailRoute,
  authFramersRoute,
  authRoutinesRoute,
  authIntegrationMonitorRoute,
  authIntegrationRoutinesRoute,
  authApprovalsInboxRoute,
  authApprovalsConfigRoute,
  authMcpAgentsRoute,
  authMcpExecutionsRoute,
  authAuditoriaRoute,
]);

export const routeTree = rootRoute.addChildren([indexRoute, authRouteChildren, loginRoute]);
