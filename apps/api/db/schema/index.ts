/**
 * @contract DATA-000
 *
 * Central re-export of all Drizzle schemas and relations.
 * Used by drizzle-kit (drizzle.config.ts → schema: "./db/schema/index.ts")
 * and by the application layer for DB client initialization.
 */

// Tables
export {
  users,
  contentUsers,
  userSessions,
  tenants,
  roles,
  rolePermissions,
  tenantUsers,
  domainEvents,
} from './foundation.js';

// Relations (required for db.query.* relational queries)
export {
  usersRelations,
  contentUsersRelations,
  userSessionsRelations,
  tenantsRelations,
  rolesRelations,
  rolePermissionsRelations,
  tenantUsersRelations,
  domainEventsRelations,
} from './foundation.relations.js';

// MOD-003 — Organizational Structure
export { orgUnits, orgUnitTenantLinks } from './org-units.js';
export { orgUnitsRelations, orgUnitTenantLinksRelations } from './org-units.relations.js';

// MOD-003 F05 — Departments
export { departments } from './departments.js';
export { departmentsRelations } from './departments.relations.js';

// MOD-004 — Identity Advanced
export { userOrgScopes, accessShares, accessDelegations } from './identity-advanced.js';
export {
  userOrgScopesRelations,
  accessSharesRelations,
  accessDelegationsRelations,
} from './identity-advanced.relations.js';

// MOD-005 — Process Modeling (Blueprint)
export {
  processCycles,
  processMacroStages,
  processStages,
  processGates,
  processRoles,
  stageRoleLinks,
  stageTransitions,
} from './process-modeling.js';
export {
  processCyclesRelations,
  processMacroStagesRelations,
  processStagesRelations,
  processGatesRelations,
  processRolesRelations,
  stageRoleLinksRelations,
  stageTransitionsRelations,
} from './process-modeling.relations.js';

// MOD-006 — Case Execution
export {
  caseInstances,
  stageHistory,
  gateInstances,
  caseAssignments,
  caseEvents,
} from './case-execution.js';
export {
  caseInstancesRelations,
  stageHistoryRelations,
  gateInstancesRelations,
  caseAssignmentsRelations,
  caseEventsRelations,
} from './case-execution.relations.js';

// MOD-007 — Contextual Params (Parametrização Contextual)
export {
  contextFramerTypes,
  contextFramers,
  targetObjects,
  targetFields,
  incidenceRules,
  behaviorRoutines,
  routineItems,
  routineIncidenceLinks,
  routineVersionHistory,
} from './contextual-params.js';
export {
  contextFramerTypesRelations,
  contextFramersRelations,
  targetObjectsRelations,
  targetFieldsRelations,
  incidenceRulesRelations,
  behaviorRoutinesRelations,
  routineItemsRelations,
  routineIncidenceLinksRelations,
  routineVersionHistoryRelations,
} from './contextual-params.relations.js';

// MOD-008 — Integration Protheus
export {
  integrationServices,
  integrationRoutines,
  integrationFieldMappings,
  integrationParams,
  integrationCallLogs,
  integrationReprocessRequests,
} from './integration-protheus.js';
export {
  integrationServicesRelations,
  integrationRoutinesRelations,
  integrationFieldMappingsRelations,
  integrationParamsRelations,
  integrationCallLogsRelations,
  integrationReprocessRequestsRelations,
} from './integration-protheus.relations.js';

// MOD-009 — Movement Approval
export {
  movementControlRules,
  approvalRules,
  controlledMovements,
  approvalInstances,
  movementExecutions,
  movementHistory,
  movementOverrideLog,
} from './movement-approval.js';
export {
  movementControlRulesRelations,
  approvalRulesRelations,
  controlledMovementsRelations,
  approvalInstancesRelations,
  movementExecutionsRelations,
  movementHistoryRelations,
  movementOverrideLogRelations,
} from './movement-approval.relations.js';

// MOD-010 — MCP Automation (Automação Governada)
export {
  mcpActionTypes,
  mcpAgents,
  mcpActions,
  mcpAgentActionLinks,
  mcpExecutions,
} from './mcp-automation.js';
export {
  mcpActionTypesRelations,
  mcpAgentsRelations,
  mcpActionsRelations,
  mcpAgentActionLinksRelations,
  mcpExecutionsRelations,
} from './mcp-automation.relations.js';
