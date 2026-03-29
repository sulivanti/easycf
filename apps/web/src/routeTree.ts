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
import { Route as authUsuariosConviteRoute } from './routes/_auth.usuarios.$userId.convite';
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
import { Route as authProcessosPapeisRoute } from './routes/_auth.processos.papeis';

// Case Execution (MOD-006)
import { Route as authCasesRoute } from './routes/_auth.cases';
import { Route as authCaseDetailRoute } from './routes/_auth.cases.$id';

// Contextual Params (MOD-007)
import { Route as authFramersRoute } from './routes/_auth.framers';
import { Route as authRoutinesRoute } from './routes/_auth.routines';
import { Route as authParamTiposFramerRoute } from './routes/_auth.parametros.tipos-framer';
import { Route as authParamTargetObjectsRoute } from './routes/_auth.parametros.target-objects';
import { Route as authParamIncidenciaRoute } from './routes/_auth.parametros.incidencia';

// Integration Protheus (MOD-008)
import { Route as authIntegrationMonitorRoute } from './routes/_auth.integration.monitor';
import { Route as authIntegrationRoutinesRoute } from './routes/_auth.integration.routines';
import { Route as authIntegrationServicesRoute } from './routes/_auth.integration.services';
import { Route as authIntegrationReprocessRoute } from './routes/_auth.integration.reprocess';

// Movement Approval (MOD-009)
import { Route as authApprovalsInboxRoute } from './routes/_auth.approvals.inbox';
import { Route as authApprovalsConfigRoute } from './routes/_auth.approvals.config';
import { Route as authApprovalsMovementsRoute } from './routes/_auth.approvals.movements';
import { Route as authApprovalsMovementsNewRoute } from './routes/_auth.approvals.movements.new';
import { Route as authApprovalsMovementDetailRoute } from './routes/_auth.approvals.movements.$id';
import { Route as authApprovalsRulesRoute } from './routes/_auth.approvals.rules';
import { Route as authApprovalsRulesSearchRoute } from './routes/_auth.approvals.rules.search';
import { Route as authApprovalsRulesNewRoute } from './routes/_auth.approvals.rules.new';
import { Route as authApprovalsRulesEditRoute } from './routes/_auth.approvals.rules.$id';
import { Route as authApprovalsHistoryRoute } from './routes/_auth.approvals.history';

// MCP Automation (MOD-010)
import { Route as authMcpAgentsRoute } from './routes/_auth.mcp.agents';
import { Route as authMcpExecutionsRoute } from './routes/_auth.mcp.executions';
import { Route as authMcpActionsRoute } from './routes/_auth.mcp.actions';
import { Route as authMcpActionTypesRoute } from './routes/_auth.mcp.action-types';

// SmartGrid (MOD-011)
import { Route as authDadosRoute } from './routes/_auth.dados.$modulo.$rotina';
import { Route as authDadosRecordRoute } from './routes/_auth.dados.$modulo.$rotina.$id';
import { Route as authDadosBulkInsertRoute } from './routes/_auth.dados.$modulo.$rotina.inclusao-em-massa';
import { Route as authDadosBulkDeleteRoute } from './routes/_auth.dados.$modulo.$rotina.exclusao-em-massa';

// System
import { Route as authAuditoriaRoute } from './routes/_auth.auditoria';

const authRouteChildren = authRoute.addChildren([
  authDashboardRoute,
  authProfileRoute,
  authSessoesRoute,
  authUsuariosRoute,
  authUsuariosFormRoute,
  authUsuariosConviteRoute,
  authPerfisRoute,
  authFiliaisRoute,
  authOrgUnitsRoute,
  authOrgUnitsFormRoute,
  authIdentityOrgScopeRoute,
  authIdentityDelegationsRoute,
  authProcessosCiclosRoute,
  authProcessosCiclosEditorRoute,
  authProcessosPapeisRoute,
  authCasesRoute,
  authCaseDetailRoute,
  authFramersRoute,
  authRoutinesRoute,
  authParamTiposFramerRoute,
  authParamTargetObjectsRoute,
  authParamIncidenciaRoute,
  authIntegrationMonitorRoute,
  authIntegrationRoutinesRoute,
  authIntegrationServicesRoute,
  authIntegrationReprocessRoute,
  authApprovalsInboxRoute,
  authApprovalsConfigRoute,
  authApprovalsMovementsRoute,
  authApprovalsMovementsNewRoute,
  authApprovalsMovementDetailRoute,
  authApprovalsRulesRoute,
  authApprovalsRulesSearchRoute,
  authApprovalsRulesNewRoute,
  authApprovalsRulesEditRoute,
  authApprovalsHistoryRoute,
  authMcpAgentsRoute,
  authMcpExecutionsRoute,
  authMcpActionsRoute,
  authMcpActionTypesRoute,
  authDadosRoute,
  authDadosRecordRoute,
  authDadosBulkInsertRoute,
  authDadosBulkDeleteRoute,
  authAuditoriaRoute,
]);

export const routeTree = rootRoute.addChildren([indexRoute, authRouteChildren, loginRoute]);
