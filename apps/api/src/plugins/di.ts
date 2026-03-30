// @contract DOC-ARC-004 §3, §5, FR-000-C03
//
// Composition Root — instantiates DB, repositories, services, and use cases.
// Populates request.dipiContainer and app.* registries.
//
// Wired: MOD-000, MOD-003, MOD-004, MOD-005, MOD-006, MOD-007, MOD-008, MOD-009, MOD-010

import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// ═══════════════════════════════════════════════════════════════════════════════
// MOD-000 Foundation — Infrastructure
// ═══════════════════════════════════════════════════════════════════════════════

import {
  DrizzleUserRepository,
  DrizzleSessionRepository,
  DrizzleTenantRepository,
  DrizzleRoleRepository,
  DrizzleTenantUserRepository,
  DrizzleDomainEventRepository,
  StubPasswordResetTokenRepository,
  DrizzleUnitOfWork,
} from '../modules/foundation/infrastructure/drizzle-repositories.js';

import {
  BcryptPasswordHashService,
  FastifyJwtTokenService,
  InMemoryCacheService,
  CryptoHashUtilService,
  LogEmailService,
  InMemoryIdempotencyService,
} from '../modules/foundation/infrastructure/services-impl.js';

// MOD-000 Use Cases — Auth
import { LoginUseCase } from '../modules/foundation/application/use-cases/auth/login.use-case.js';
import { LogoutUseCase } from '../modules/foundation/application/use-cases/auth/logout.use-case.js';
import { RefreshTokenUseCase } from '../modules/foundation/application/use-cases/auth/refresh-token.use-case.js';
import { GetProfileUseCase } from '../modules/foundation/application/use-cases/auth/get-profile.use-case.js';
import { UpdateProfileUseCase } from '../modules/foundation/application/use-cases/auth/update-profile.use-case.js';
import { ChangePasswordUseCase } from '../modules/foundation/application/use-cases/auth/change-password.use-case.js';
import { ForgotPasswordUseCase } from '../modules/foundation/application/use-cases/auth/forgot-password.use-case.js';
import { ResetPasswordUseCase } from '../modules/foundation/application/use-cases/auth/reset-password.use-case.js';

// MOD-000 Use Cases — Users, Roles, Tenants
import { CreateUserUseCase } from '../modules/foundation/application/use-cases/users/create-user.use-case.js';
import { DeleteUserUseCase } from '../modules/foundation/application/use-cases/users/delete-user.use-case.js';
import { CreateRoleUseCase } from '../modules/foundation/application/use-cases/roles/create-role.use-case.js';
import { UpdateRoleUseCase } from '../modules/foundation/application/use-cases/roles/update-role.use-case.js';
import { CreateTenantUseCase } from '../modules/foundation/application/use-cases/tenants/create-tenant.use-case.js';
import { AddTenantUserUseCase } from '../modules/foundation/application/use-cases/tenant-users/add-tenant-user.use-case.js';

// ═══════════════════════════════════════════════════════════════════════════════
// MOD-003 Org-Units — Infrastructure + Use Cases
// ═══════════════════════════════════════════════════════════════════════════════

import {
  DrizzleOrgUnitRepository,
  DrizzleOrgUnitTenantLinkRepository,
} from '../modules/org-units/infrastructure/drizzle-repositories.js';

import { CreateOrgUnitUseCase } from '../modules/org-units/application/use-cases/create-org-unit.use-case.js';
import { UpdateOrgUnitUseCase } from '../modules/org-units/application/use-cases/update-org-unit.use-case.js';
import { DeleteOrgUnitUseCase } from '../modules/org-units/application/use-cases/delete-org-unit.use-case.js';
import { RestoreOrgUnitUseCase } from '../modules/org-units/application/use-cases/restore-org-unit.use-case.js';
import { GetOrgUnitUseCase } from '../modules/org-units/application/use-cases/get-org-unit.use-case.js';
import { ListOrgUnitsUseCase } from '../modules/org-units/application/use-cases/list-org-units.use-case.js';
import { GetOrgUnitTreeUseCase } from '../modules/org-units/application/use-cases/get-org-unit-tree.use-case.js';
import { LinkTenantUseCase } from '../modules/org-units/application/use-cases/link-tenant.use-case.js';
import { UnlinkTenantUseCase } from '../modules/org-units/application/use-cases/unlink-tenant.use-case.js';

// ═══════════════════════════════════════════════════════════════════════════════
// MOD-004 Identity-Advanced — Infrastructure + Use Cases
// ═══════════════════════════════════════════════════════════════════════════════

import {
  DrizzleOrgScopeRepository,
  DrizzleAccessShareRepository,
  DrizzleAccessDelegationRepository,
  DrizzleUserLookupAdapter,
  StubRedisCacheAdapter,
} from '../modules/identity-advanced/infrastructure/drizzle-repositories.js';

import { CreateOrgScopeUseCase } from '../modules/identity-advanced/application/use-cases/create-org-scope.js';
import { DeleteOrgScopeUseCase } from '../modules/identity-advanced/application/use-cases/delete-org-scope.js';
import { ListOrgScopesUseCase } from '../modules/identity-advanced/application/use-cases/list-org-scopes.js';
import { CreateAccessShareUseCase } from '../modules/identity-advanced/application/use-cases/create-access-share.js';
import {
  ListAccessSharesUseCase,
  ListMySharedAccessesUseCase,
} from '../modules/identity-advanced/application/use-cases/list-access-shares.js';
import { RevokeAccessShareUseCase } from '../modules/identity-advanced/application/use-cases/revoke-access-share.js';
import { CreateAccessDelegationUseCase } from '../modules/identity-advanced/application/use-cases/create-access-delegation.js';
import { RevokeAccessDelegationUseCase } from '../modules/identity-advanced/application/use-cases/revoke-access-delegation.js';
import { ExpireIdentityGrantsUseCase } from '../modules/identity-advanced/application/use-cases/expire-identity-grants.js';

// ═══════════════════════════════════════════════════════════════════════════════
// MOD-005 Process-Modeling — Infrastructure + Use Cases
// ═══════════════════════════════════════════════════════════════════════════════

import {
  ProcessCycleRepository as DrizzleProcessCycleRepository,
  ProcessMacroStageRepository as DrizzleProcessMacroStageRepository,
  ProcessStageRepository as DrizzleProcessStageRepository,
  ProcessGateRepository as DrizzleProcessGateRepository,
  ProcessRoleRepository as DrizzleProcessRoleRepository,
  StageRoleLinkRepository as DrizzleStageRoleLinkRepository,
  StageTransitionRepository as DrizzleStageTransitionRepository,
  FlowQueryRepository as DrizzleFlowQueryRepository,
} from '../modules/process-modeling/infrastructure/db/repositories/index.js';

import { CreateCycleUseCase } from '../modules/process-modeling/application/use-cases/create-cycle.use-case.js';
import { UpdateCycleUseCase } from '../modules/process-modeling/application/use-cases/update-cycle.use-case.js';
import { DeleteCycleUseCase } from '../modules/process-modeling/application/use-cases/delete-cycle.use-case.js';
import { PublishCycleUseCase } from '../modules/process-modeling/application/use-cases/publish-cycle.use-case.js';
import { ForkCycleUseCase } from '../modules/process-modeling/application/use-cases/fork-cycle.use-case.js';
import { DeprecateCycleUseCase } from '../modules/process-modeling/application/use-cases/deprecate-cycle.use-case.js';
import { GetCycleFlowUseCase } from '../modules/process-modeling/application/use-cases/get-cycle-flow.use-case.js';
import {
  CreateMacroStageUseCase,
  UpdateMacroStageUseCase,
  DeleteMacroStageUseCase,
} from '../modules/process-modeling/application/use-cases/manage-macro-stages.use-case.js';
import {
  CreateStageUseCase,
  UpdateStageUseCase,
  DeleteStageUseCase,
} from '../modules/process-modeling/application/use-cases/manage-stages.use-case.js';
import {
  CreateGateUseCase,
  UpdateGateUseCase,
  DeleteGateUseCase,
} from '../modules/process-modeling/application/use-cases/manage-gates.use-case.js';
import {
  CreateProcessRoleUseCase,
  UpdateProcessRoleUseCase,
  DeleteProcessRoleUseCase,
} from '../modules/process-modeling/application/use-cases/manage-process-roles.use-case.js';
import {
  LinkStageRoleUseCase,
  UnlinkStageRoleUseCase,
} from '../modules/process-modeling/application/use-cases/manage-stage-roles.use-case.js';
import {
  CreateTransitionUseCase,
  DeleteTransitionUseCase,
} from '../modules/process-modeling/application/use-cases/manage-transitions.use-case.js';

// ═══════════════════════════════════════════════════════════════════════════════
// MOD-006 Case-Execution — Infrastructure + Use Cases
// ═══════════════════════════════════════════════════════════════════════════════

import {
  DrizzleCaseInstanceRepository,
  DrizzleStageHistoryRepository,
  DrizzleGateInstanceRepository,
  DrizzleCaseAssignmentRepository,
  DrizzleCaseEventRepository,
  StubDelegationChecker,
} from '../modules/case-execution/infrastructure/drizzle-repositories.js';

import { OpenCaseUseCase } from '../modules/case-execution/application/use-cases/open-case.use-case.js';
import { TransitionStageUseCase } from '../modules/case-execution/application/use-cases/transition-stage.use-case.js';
import { ResolveGateUseCase } from '../modules/case-execution/application/use-cases/resolve-gate.use-case.js';
import { WaiveGateUseCase } from '../modules/case-execution/application/use-cases/waive-gate.use-case.js';
import { AssignResponsibleUseCase } from '../modules/case-execution/application/use-cases/assign-responsible.use-case.js';
import { RecordEventUseCase } from '../modules/case-execution/application/use-cases/record-event.use-case.js';
import { ControlCaseUseCase } from '../modules/case-execution/application/use-cases/control-case.use-case.js';
import { ListCasesUseCase } from '../modules/case-execution/application/use-cases/list-cases.use-case.js';
import { GetCaseDetailsUseCase } from '../modules/case-execution/application/use-cases/get-case-details.use-case.js';
import { GetTimelineUseCase } from '../modules/case-execution/application/use-cases/get-timeline.use-case.js';
import { ListGatesUseCase } from '../modules/case-execution/application/use-cases/list-gates.use-case.js';
import { ListAssignmentsUseCase } from '../modules/case-execution/application/use-cases/list-assignments.use-case.js';
import { ExpireAssignmentsUseCase } from '../modules/case-execution/application/use-cases/expire-assignments.use-case.js';

// ═══════════════════════════════════════════════════════════════════════════════
// MOD-007 Contextual-Params — Infrastructure + Use Cases
// ═══════════════════════════════════════════════════════════════════════════════

import {
  DrizzleFramerTypeRepository,
  DrizzleFramerRepository,
  DrizzleTargetObjectRepository,
  DrizzleTargetFieldRepository,
  DrizzleIncidenceRuleRepository,
  DrizzleRoutineRepository,
  DrizzleRoutineItemRepository,
  DrizzleRoutineIncidenceLinkRepository,
  DrizzleVersionHistoryRepository,
  DrizzleParamDomainEventRepository,
  DrizzleParamUnitOfWork,
  CryptoIdGenerator,
} from '../modules/contextual-params/infrastructure/drizzle-repositories.js';

import { CreateFramerTypeUseCase } from '../modules/contextual-params/application/use-cases/create-framer-type.use-case.js';
import { CreateFramerUseCase } from '../modules/contextual-params/application/use-cases/create-framer.use-case.js';
import { UpdateFramerUseCase } from '../modules/contextual-params/application/use-cases/update-framer.use-case.js';
import { DeleteFramerUseCase } from '../modules/contextual-params/application/use-cases/delete-framer.use-case.js';
import { CreateTargetObjectUseCase } from '../modules/contextual-params/application/use-cases/create-target-object.use-case.js';
import { CreateTargetFieldUseCase } from '../modules/contextual-params/application/use-cases/create-target-field.use-case.js';
import { CreateIncidenceRuleUseCase } from '../modules/contextual-params/application/use-cases/create-incidence-rule.use-case.js';
import { UpdateIncidenceRuleUseCase } from '../modules/contextual-params/application/use-cases/update-incidence-rule.use-case.js';
import { DeleteIncidenceRuleUseCase } from '../modules/contextual-params/application/use-cases/delete-incidence-rule.use-case.js';
import { CreateRoutineUseCase } from '../modules/contextual-params/application/use-cases/create-routine.use-case.js';
import { UpdateRoutineUseCase } from '../modules/contextual-params/application/use-cases/update-routine.use-case.js';
import { PublishRoutineUseCase } from '../modules/contextual-params/application/use-cases/publish-routine.use-case.js';
import { ForkRoutineUseCase } from '../modules/contextual-params/application/use-cases/fork-routine.use-case.js';
import { CreateRoutineItemUseCase } from '../modules/contextual-params/application/use-cases/create-routine-item.use-case.js';
import { UpdateRoutineItemUseCase } from '../modules/contextual-params/application/use-cases/update-routine-item.use-case.js';
import { DeleteRoutineItemUseCase } from '../modules/contextual-params/application/use-cases/delete-routine-item.use-case.js';
import { LinkRoutineUseCase } from '../modules/contextual-params/application/use-cases/link-routine.use-case.js';
import { UnlinkRoutineUseCase } from '../modules/contextual-params/application/use-cases/unlink-routine.use-case.js';
import { EvaluateRulesUseCase } from '../modules/contextual-params/application/use-cases/evaluate-rules.use-case.js';

// ═══════════════════════════════════════════════════════════════════════════════
// MOD-009 Movement-Approval — Infrastructure + Use Cases
// ═══════════════════════════════════════════════════════════════════════════════

import {
  DrizzleControlRuleRepository,
  DrizzleApprovalRuleRepository,
  DrizzleMovementRepository,
  DrizzleApprovalInstanceRepository,
  DrizzleMovementExecutionRepository,
  DrizzleMovementHistoryRepository,
  DrizzleOverrideLogRepository,
  DrizzleMovApprovalUnitOfWork,
  DrizzleMovApprovalEventRepository,
  CryptoIdGenerator as MovApprovalIdGen,
  DrizzleCodigoGenerator,
} from '../modules/movement-approval/infrastructure/drizzle-repositories.js';

import { CreateControlRuleUseCase } from '../modules/movement-approval/application/use-cases/rules/create-control-rule.use-case.js';
import { UpdateControlRuleUseCase } from '../modules/movement-approval/application/use-cases/rules/update-control-rule.use-case.js';
import { ListControlRulesUseCase } from '../modules/movement-approval/application/use-cases/rules/list-control-rules.use-case.js';
import { CreateApprovalRuleUseCase } from '../modules/movement-approval/application/use-cases/rules/create-approval-rule.use-case.js';
import { UpdateApprovalRuleUseCase } from '../modules/movement-approval/application/use-cases/rules/update-approval-rule.use-case.js';
import { EvaluateMovementUseCase } from '../modules/movement-approval/application/use-cases/engine/evaluate-movement.use-case.js';
import { ApproveMovementUseCase } from '../modules/movement-approval/application/use-cases/approvals/approve-movement.use-case.js';
import { RejectMovementUseCase } from '../modules/movement-approval/application/use-cases/approvals/reject-movement.use-case.js';
import { ListMyApprovalsUseCase } from '../modules/movement-approval/application/use-cases/approvals/list-my-approvals.use-case.js';
import { GetMovementUseCase } from '../modules/movement-approval/application/use-cases/movements/get-movement.use-case.js';
import { ListMovementsUseCase } from '../modules/movement-approval/application/use-cases/movements/list-movements.use-case.js';
import { CancelMovementUseCase } from '../modules/movement-approval/application/use-cases/movements/cancel-movement.use-case.js';
import { OverrideMovementUseCase } from '../modules/movement-approval/application/use-cases/movements/override-movement.use-case.js';
import { RetryMovementUseCase } from '../modules/movement-approval/application/use-cases/movements/retry-movement.use-case.js';

// ═══════════════════════════════════════════════════════════════════════════════
// MOD-010 MCP-Automation — Infrastructure + Use Cases
// ═══════════════════════════════════════════════════════════════════════════════

import {
  DrizzleMcpAgentRepository,
  DrizzleMcpActionTypeRepository,
  DrizzleMcpActionRepository,
  DrizzleMcpAgentActionLinkRepository,
  DrizzleMcpExecutionRepository,
  DrizzleMcpUnitOfWork,
  DrizzleMcpEventRepository,
  CryptoMcpIdGenerator,
  StubApiKeyService,
  StubMovementEngineGateway,
  StubRoutineEvaluator,
  StubIntegrationQueue,
  StubActionExecutorRegistry,
} from '../modules/mcp/infrastructure/drizzle-repositories.js';

import { CreateAgentUseCase } from '../modules/mcp/application/use-cases/agents/create-agent.use-case.js';
import { ListAgentsUseCase } from '../modules/mcp/application/use-cases/agents/list-agents.use-case.js';
import { RevokeAgentUseCase } from '../modules/mcp/application/use-cases/agents/revoke-agent.use-case.js';
import { RotateAgentKeyUseCase } from '../modules/mcp/application/use-cases/agents/rotate-agent-key.use-case.js';
import { EnablePhase2UseCase } from '../modules/mcp/application/use-cases/agents/enable-phase2.use-case.js';
import { UpdateAgentUseCase } from '../modules/mcp/application/use-cases/agents/update-agent.use-case.js';
import { CreateActionUseCase } from '../modules/mcp/application/use-cases/actions/create-action.use-case.js';
import { UpdateActionUseCase } from '../modules/mcp/application/use-cases/actions/update-action.use-case.js';
import { GrantAgentActionUseCase } from '../modules/mcp/application/use-cases/links/grant-agent-action.use-case.js';
import { RevokeAgentActionUseCase } from '../modules/mcp/application/use-cases/links/revoke-agent-action.use-case.js';
import {
  ListExecutionsUseCase,
  GetExecutionUseCase,
} from '../modules/mcp/application/use-cases/executions/list-executions.use-case.js';
import { ExecuteMcpUseCase } from '../modules/mcp/application/use-cases/gateway/execute-mcp.use-case.js';

// ═══════════════════════════════════════════════════════════════════════════════
// Dashboard — Read-only Query Repository
// ═══════════════════════════════════════════════════════════════════════════════

import { DashboardQueryRepository } from '../modules/dashboard/infrastructure/dashboard-query.repository.js';

// ═══════════════════════════════════════════════════════════════════════════════
// MOD-008 Integration-Protheus — Infrastructure + Use Cases
// ═══════════════════════════════════════════════════════════════════════════════

import {
  DrizzleIntegrationServiceRepository,
  DrizzleIntegrationRoutineRepository,
  DrizzleFieldMappingRepository,
  DrizzleIntegrationParamRepository,
  DrizzleCallLogRepository,
  DrizzleReprocessRequestRepository,
  StubEncryptionService,
  StubQueuePort,
} from '../modules/integration-protheus/infrastructure/drizzle-repositories.js';

import { CreateServiceUseCase } from '../modules/integration-protheus/application/use-cases/create-service.use-case.js';
import { UpdateServiceUseCase } from '../modules/integration-protheus/application/use-cases/update-service.use-case.js';
import { ListServicesUseCase } from '../modules/integration-protheus/application/use-cases/list-services.use-case.js';
import { ConfigureRoutineUseCase } from '../modules/integration-protheus/application/use-cases/configure-routine.use-case.js';
import { ForkIntegrationRoutineUseCase } from '../modules/integration-protheus/application/use-cases/fork-integration-routine.use-case.js';
import {
  CreateFieldMappingUseCase,
  UpdateFieldMappingUseCase,
  DeleteFieldMappingUseCase,
} from '../modules/integration-protheus/application/use-cases/manage-field-mappings.use-case.js';
import {
  CreateParamUseCase,
  UpdateParamUseCase,
} from '../modules/integration-protheus/application/use-cases/manage-params.use-case.js';
import { ExecuteIntegrationUseCase } from '../modules/integration-protheus/application/use-cases/execute-integration.use-case.js';
import { ReprocessCallUseCase } from '../modules/integration-protheus/application/use-cases/reprocess-call.use-case.js';
import {
  ListCallLogsUseCase,
  GetCallLogUseCase,
} from '../modules/integration-protheus/application/use-cases/list-call-logs.use-case.js';
import { GetCallLogMetricsUseCase } from '../modules/integration-protheus/application/use-cases/get-call-log-metrics.use-case.js';

// ═══════════════════════════════════════════════════════════════════════════════
// Plugin
// ═══════════════════════════════════════════════════════════════════════════════

async function diPluginImpl(app: FastifyInstance): Promise<void> {
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Database connection
  // ─────────────────────────────────────────────────────────────────────────

  const sql = postgres(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  app.addHook('onClose', async () => {
    await sql.end();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Shared services (singleton)
  // ─────────────────────────────────────────────────────────────────────────

  const hashService = new BcryptPasswordHashService();
  const tokenService = new FastifyJwtTokenService(app, process.env.JWT_REFRESH_EXPIRES_IN || '7d');
  const cache = new InMemoryCacheService();
  const hashUtil = new CryptoHashUtilService();
  const emailService = new LogEmailService();
  const idempotency = new InMemoryIdempotencyService();
  const uow = new DrizzleUnitOfWork(db);

  // ─────────────────────────────────────────────────────────────────────────
  // 3. MOD-000 Foundation — Repositories + Use Cases
  // ─────────────────────────────────────────────────────────────────────────

  const userRepo = new DrizzleUserRepository(db);
  const sessionRepo = new DrizzleSessionRepository(db);
  const tenantRepo = new DrizzleTenantRepository(db);
  const roleRepo = new DrizzleRoleRepository(db);
  const tenantUserRepo = new DrizzleTenantUserRepository(db);
  const eventRepo = new DrizzleDomainEventRepository(db);
  const passwordResetTokenRepo = new StubPasswordResetTokenRepository();

  const loginUseCase = new LoginUseCase(
    userRepo,
    sessionRepo,
    eventRepo,
    uow,
    hashService,
    tokenService,
    tenantUserRepo,
    roleRepo,
  );
  const logoutUseCase = new LogoutUseCase(sessionRepo, eventRepo);
  const refreshTokenUseCase = new RefreshTokenUseCase(sessionRepo, eventRepo, uow, tokenService);
  const getProfileUseCase = new GetProfileUseCase(
    userRepo,
    tenantUserRepo,
    roleRepo,
    cache,
    tenantRepo,
  );
  const updateProfileUseCase = new UpdateProfileUseCase(userRepo, eventRepo, uow);
  const changePasswordUseCase = new ChangePasswordUseCase(userRepo, eventRepo, uow, hashService);
  const forgotPasswordUseCase = new ForgotPasswordUseCase(
    userRepo,
    passwordResetTokenRepo,
    eventRepo,
    uow,
    hashUtil,
    emailService,
  );
  const resetPasswordUseCase = new ResetPasswordUseCase(
    userRepo,
    passwordResetTokenRepo,
    eventRepo,
    uow,
    hashService,
    hashUtil,
  );
  const createUserUseCase = new CreateUserUseCase(userRepo, eventRepo, uow, hashService, hashUtil);
  const deleteUserUseCase = new DeleteUserUseCase(userRepo, eventRepo, uow);
  const createRoleUseCase = new CreateRoleUseCase(roleRepo, eventRepo, uow, hashUtil);
  const updateRoleUseCase = new UpdateRoleUseCase(roleRepo, eventRepo, uow, cache);
  const createTenantUseCase = new CreateTenantUseCase(tenantRepo, eventRepo, uow, hashUtil);
  const addTenantUserUseCase = new AddTenantUserUseCase(
    userRepo,
    tenantRepo,
    roleRepo,
    tenantUserRepo,
    eventRepo,
    uow,
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 4. MOD-003 Org-Units — Repositories + Use Cases
  // ─────────────────────────────────────────────────────────────────────────

  const orgUnitRepo = new DrizzleOrgUnitRepository(db);
  const orgUnitLinkRepo = new DrizzleOrgUnitTenantLinkRepository(db);

  const createOrgUnitUseCase = new CreateOrgUnitUseCase(
    orgUnitRepo,
    eventRepo,
    uow,
    hashUtil,
    idempotency,
  );
  const updateOrgUnitUseCase = new UpdateOrgUnitUseCase(orgUnitRepo, eventRepo, uow);
  const deleteOrgUnitUseCase = new DeleteOrgUnitUseCase(orgUnitRepo, eventRepo, uow);
  const restoreOrgUnitUseCase = new RestoreOrgUnitUseCase(orgUnitRepo, eventRepo, uow);
  const getOrgUnitUseCase = new GetOrgUnitUseCase(orgUnitRepo, orgUnitLinkRepo, tenantRepo);
  const listOrgUnitsUseCase = new ListOrgUnitsUseCase(orgUnitRepo);
  const getOrgUnitTreeUseCase = new GetOrgUnitTreeUseCase(orgUnitRepo);
  const linkTenantUseCase = new LinkTenantUseCase(
    orgUnitRepo,
    orgUnitLinkRepo,
    tenantRepo,
    eventRepo,
    uow,
    hashUtil,
    idempotency,
  );
  const unlinkTenantUseCase = new UnlinkTenantUseCase(orgUnitRepo, orgUnitLinkRepo, eventRepo, uow);

  // ─────────────────────────────────────────────────────────────────────────
  // 5. MOD-004 Identity-Advanced — Repositories + Use Cases
  // ─────────────────────────────────────────────────────────────────────────

  const orgScopeRepo = new DrizzleOrgScopeRepository(db);
  const accessShareRepo = new DrizzleAccessShareRepository(db);
  const accessDelegationRepo = new DrizzleAccessDelegationRepository(db);
  const userLookup = new DrizzleUserLookupAdapter(db);
  const redisCache = new StubRedisCacheAdapter();

  const createOrgScopeUseCase = new CreateOrgScopeUseCase(
    orgScopeRepo,
    eventRepo,
    uow,
    hashUtil,
    idempotency,
    redisCache,
    userLookup,
  );
  const deleteOrgScopeUseCase = new DeleteOrgScopeUseCase(orgScopeRepo, eventRepo, uow, redisCache);
  const listOrgScopesUseCase = new ListOrgScopesUseCase(orgScopeRepo);
  const createAccessShareUseCase = new CreateAccessShareUseCase(
    accessShareRepo,
    eventRepo,
    uow,
    hashUtil,
    idempotency,
    userLookup,
  );
  const listAccessSharesUseCase = new ListAccessSharesUseCase(accessShareRepo);
  const listMySharedAccessesUseCase = new ListMySharedAccessesUseCase(accessShareRepo);
  const revokeAccessShareUseCase = new RevokeAccessShareUseCase(accessShareRepo, eventRepo, uow);
  const createAccessDelegationUseCase = new CreateAccessDelegationUseCase(
    accessDelegationRepo,
    eventRepo,
    uow,
    hashUtil,
    idempotency,
    userLookup,
  );
  const revokeAccessDelegationUseCase = new RevokeAccessDelegationUseCase(
    accessDelegationRepo,
    eventRepo,
    uow,
  );
  const expireIdentityGrantsUseCase = new ExpireIdentityGrantsUseCase(
    orgScopeRepo,
    accessShareRepo,
    accessDelegationRepo,
    eventRepo,
    uow,
    redisCache,
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 6. MOD-005 Process-Modeling — Repositories + Use Cases
  // ─────────────────────────────────────────────────────────────────────────

  const cycleRepo = new DrizzleProcessCycleRepository(db);
  const macroStageRepo = new DrizzleProcessMacroStageRepository(db);
  const stageRepo = new DrizzleProcessStageRepository(db);
  const gateRepo = new DrizzleProcessGateRepository(db);
  const processRoleRepo = new DrizzleProcessRoleRepository(db);
  const stageRoleLinkRepo = new DrizzleStageRoleLinkRepository(db);
  const transitionRepo = new DrizzleStageTransitionRepository(db);
  const flowQueryRepo = new DrizzleFlowQueryRepository(db);

  // InstanceCheckerPort — wired to MOD-006 caseInstanceRepo below
  const instanceChecker = { countActiveByStageId: async (_stageId: string) => 0 };

  const createCycleUseCase = new CreateCycleUseCase(cycleRepo, eventRepo, uow, hashUtil);
  const updateCycleUseCase = new UpdateCycleUseCase(cycleRepo, eventRepo, uow);
  const deleteCycleUseCase = new DeleteCycleUseCase(cycleRepo, eventRepo, uow);
  const publishCycleUseCase = new PublishCycleUseCase(cycleRepo, stageRepo, eventRepo, uow);
  const forkCycleUseCase = new ForkCycleUseCase(
    cycleRepo,
    macroStageRepo,
    stageRepo,
    gateRepo,
    stageRoleLinkRepo,
    transitionRepo,
    eventRepo,
    uow,
    hashUtil,
    idempotency,
  );
  const deprecateCycleUseCase = new DeprecateCycleUseCase(cycleRepo, eventRepo, uow);
  const getCycleFlowUseCase = new GetCycleFlowUseCase(cycleRepo, flowQueryRepo);

  const createMacroStageUseCase = new CreateMacroStageUseCase(
    cycleRepo,
    macroStageRepo,
    eventRepo,
    uow,
    hashUtil,
  );
  const updateMacroStageUseCase = new UpdateMacroStageUseCase(
    cycleRepo,
    macroStageRepo,
    eventRepo,
    uow,
  );
  const deleteMacroStageUseCase = new DeleteMacroStageUseCase(
    cycleRepo,
    macroStageRepo,
    eventRepo,
    uow,
  );

  const createStageUseCase = new CreateStageUseCase(
    cycleRepo,
    macroStageRepo,
    stageRepo,
    eventRepo,
    uow,
    hashUtil,
  );
  const updateStageUseCase = new UpdateStageUseCase(cycleRepo, stageRepo, eventRepo, uow);
  const deleteStageUseCase = new DeleteStageUseCase(
    cycleRepo,
    stageRepo,
    instanceChecker,
    eventRepo,
    uow,
  );

  const createGateUseCase = new CreateGateUseCase(
    cycleRepo,
    stageRepo,
    gateRepo,
    eventRepo,
    uow,
    hashUtil,
  );
  const updateGateUseCase = new UpdateGateUseCase(cycleRepo, stageRepo, gateRepo, eventRepo, uow);
  const deleteGateUseCase = new DeleteGateUseCase(cycleRepo, stageRepo, gateRepo, eventRepo, uow);

  const createProcessRoleUseCase = new CreateProcessRoleUseCase(
    processRoleRepo,
    eventRepo,
    uow,
    hashUtil,
  );
  const updateProcessRoleUseCase = new UpdateProcessRoleUseCase(processRoleRepo, eventRepo, uow);
  const deleteProcessRoleUseCase = new DeleteProcessRoleUseCase(processRoleRepo, eventRepo, uow);

  const linkStageRoleUseCase = new LinkStageRoleUseCase(
    cycleRepo,
    stageRepo,
    processRoleRepo,
    stageRoleLinkRepo,
    eventRepo,
    uow,
    hashUtil,
  );
  const unlinkStageRoleUseCase = new UnlinkStageRoleUseCase(
    cycleRepo,
    stageRepo,
    stageRoleLinkRepo,
    eventRepo,
    uow,
  );

  const createTransitionUseCase = new CreateTransitionUseCase(
    cycleRepo,
    stageRepo,
    transitionRepo,
    eventRepo,
    uow,
    hashUtil,
  );
  const deleteTransitionUseCase = new DeleteTransitionUseCase(
    cycleRepo,
    stageRepo,
    transitionRepo,
    eventRepo,
    uow,
  );

  // Query use cases not generated by codegen — delegate to repos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listCyclesUseCase = {
    execute: (input: any) =>
      cycleRepo.list(input.filters ?? input, { cursor: input.cursor, limit: input.limit ?? 20 }),
  };
  const getCycleUseCase = { execute: (input: { id: string }) => cycleRepo.findById(input.id) };
  const getStageDetailUseCase = {
    execute: (input: { id: string }) => stageRepo.findById(input.id),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listProcessRolesUseCase = {
    execute: (input: any) =>
      processRoleRepo.list(input.filters ?? input, {
        cursor: input.cursor,
        limit: input.limit ?? 50,
      }),
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 7. MOD-006 Case-Execution — Repositories + Use Cases
  // ─────────────────────────────────────────────────────────────────────────

  const caseInstanceRepo = new DrizzleCaseInstanceRepository(db);
  const stageHistoryRepo = new DrizzleStageHistoryRepository(db);
  const gateInstanceRepo = new DrizzleGateInstanceRepository(db);
  const caseAssignmentRepo = new DrizzleCaseAssignmentRepository(db);
  const caseEventRepo = new DrizzleCaseEventRepository(db);
  const delegationChecker = new StubDelegationChecker();

  // Wire InstanceCheckerPort for MOD-005 (countActiveByStageId)
  instanceChecker.countActiveByStageId = async (stageId: string) => {
    const result = await caseInstanceRepo.list({
      tenantId: '', // not filtered by tenant for stage-level check
      stageId,
      limit: 1,
    });
    return result.items.length;
  };

  // Domain event emitter — noop stub (wired to real event bus when MOD-009/MOD-010 integrated)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emitCaseEvent = async (_event: any): Promise<void> => {
    /* noop */
  };

  // Callback adapters bridging MOD-005 repos → MOD-006 use case ports
  const getCycleInfo = async (cycleId: string) => {
    const cycle = await cycleRepo.findById(cycleId);
    if (!cycle) return null;
    const stages = await stageRepo.listByCycle(cycleId);
    const initialStage = stages.find((s) => s.isInitial);
    if (!initialStage) return null;
    const gates = await gateRepo.listByStage(initialStage.id);
    return {
      id: cycle.id,
      status: cycle.status,
      currentVersionId: cycle.id, // cycle IS the version (ADR-002)
      initialStageId: initialStage.id,
      initialStageGates: gates.map((g) => ({
        gateId: g.id,
        stageId: g.stageId,
        required: g.required,
      })),
    };
  };

  const findTransitionFn = async (
    fromStageId: string,
    toStageId: string,
    _cycleVersionId: string,
  ) => {
    const transitions = await transitionRepo.listByFromStage(fromStageId);
    const t = transitions.find((tr) => tr.toStageId === toStageId);
    if (!t) return null;
    return {
      id: t.id,
      fromStageId: t.fromStageId,
      toStageId: t.toStageId,
      gateRequired: t.gateRequired,
      evidenceRequired: t.evidenceRequired,
      allowedRoles: t.allowedRoles,
    };
  };

  const getGatesForStageFn = async (caseId: string, stageId: string) => {
    const instances = await gateInstanceRepo.findPendingByCaseAndStage(caseId, stageId);
    const result = [];
    for (const gi of instances) {
      const blueprintGate = await gateRepo.findById(gi.gateId);
      result.push({
        gateId: gi.gateId,
        gateName: blueprintGate?.nome ?? '',
        gateType: blueprintGate?.gateType ?? 'INFORMATIVE',
        required: blueprintGate?.required ?? false,
        status: gi.status as 'PENDING' | 'RESOLVED' | 'WAIVED' | 'REJECTED',
      });
    }
    return result;
  };

  const getRequiredRolesFn = async (caseId: string, stageId: string) => {
    const links = await stageRoleLinkRepo.listByStage(stageId);
    const assignments = await caseAssignmentRepo.findActiveByCaseId(caseId);
    const result = [];
    for (const link of links) {
      const role = await processRoleRepo.findById(link.roleId);
      const hasAssignment = assignments.some((a) => a.processRoleId === link.roleId && a.isActive);
      result.push({
        roleCodigo: role?.codigo ?? '',
        roleName: role?.nome ?? '',
        hasActiveAssignment: hasAssignment,
      });
    }
    return result;
  };

  const getTargetStageInfoFn = async (stageId: string) => {
    const stage = await stageRepo.findById(stageId);
    const gates = stage ? await gateRepo.listByStage(stageId) : [];
    return {
      isTerminal: stage?.isTerminal ?? false,
      gates: gates.map((g) => ({ gateId: g.id, stageId: g.stageId, required: g.required })),
    };
  };

  const getGateTypeFn = async (gateId: string) => {
    const gate = await gateRepo.findById(gateId);
    return gate?.gateType ?? 'INFORMATIVE';
  };

  const getStageGatesFn = async (stageId: string) => {
    const gates = await gateRepo.listByStage(stageId);
    return gates.map((g) => ({ gateId: g.id, stageId: g.stageId, required: g.required }));
  };

  // Use cases
  const openCaseUseCase = new OpenCaseUseCase(
    caseInstanceRepo,
    stageHistoryRepo,
    gateInstanceRepo,
    getCycleInfo,
    emitCaseEvent,
  );
  const transitionStageUseCase = new TransitionStageUseCase(
    caseInstanceRepo,
    stageHistoryRepo,
    gateInstanceRepo,
    caseEventRepo,
    caseAssignmentRepo,
    findTransitionFn,
    getGatesForStageFn,
    getRequiredRolesFn,
    getTargetStageInfoFn,
    emitCaseEvent,
  );
  const resolveGateUseCase = new ResolveGateUseCase(gateInstanceRepo, getGateTypeFn, emitCaseEvent);
  const waiveGateUseCase = new WaiveGateUseCase(gateInstanceRepo, emitCaseEvent);
  const assignResponsibleUseCase = new AssignResponsibleUseCase(
    caseInstanceRepo,
    caseAssignmentRepo,
    emitCaseEvent,
  );
  const recordEventUseCase = new RecordEventUseCase(caseInstanceRepo, caseEventRepo, emitCaseEvent);
  const controlCaseUseCase = new ControlCaseUseCase(
    caseInstanceRepo,
    caseEventRepo,
    gateInstanceRepo,
    getStageGatesFn,
    emitCaseEvent,
  );
  const listCasesUseCase = new ListCasesUseCase(caseInstanceRepo, gateInstanceRepo);
  const getCaseDetailsUseCase = new GetCaseDetailsUseCase(
    caseInstanceRepo,
    gateInstanceRepo,
    caseAssignmentRepo,
  );
  const getTimelineUseCase = new GetTimelineUseCase(
    stageHistoryRepo,
    gateInstanceRepo,
    caseEventRepo,
    caseAssignmentRepo,
  );
  const listGatesUseCase = new ListGatesUseCase(gateInstanceRepo);
  const listAssignmentsUseCase = new ListAssignmentsUseCase(caseAssignmentRepo);
  const expireAssignmentsUseCase = new ExpireAssignmentsUseCase(
    caseAssignmentRepo,
    caseEventRepo,
    delegationChecker,
    emitCaseEvent,
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 8. MOD-007 Contextual-Params — Repositories + Use Cases
  // ─────────────────────────────────────────────────────────────────────────

  const framerTypeRepo = new DrizzleFramerTypeRepository(db);
  const framerRepo = new DrizzleFramerRepository(db);
  const targetObjectRepo = new DrizzleTargetObjectRepository(db);
  const targetFieldRepo = new DrizzleTargetFieldRepository(db);
  const incidenceRuleRepo = new DrizzleIncidenceRuleRepository(db);
  const routineRepo = new DrizzleRoutineRepository(db);
  const routineItemRepo = new DrizzleRoutineItemRepository(db);
  const routineLinkRepo = new DrizzleRoutineIncidenceLinkRepository(db);
  const versionHistoryRepo = new DrizzleVersionHistoryRepository(db);
  const paramEventRepo = new DrizzleParamDomainEventRepository(db);
  const paramUow = new DrizzleParamUnitOfWork(db);
  const paramIdGen = new CryptoIdGenerator();

  const createFramerTypeUseCase = new CreateFramerTypeUseCase(
    framerTypeRepo,
    paramEventRepo,
    paramUow,
    paramIdGen,
  );
  const createFramerUseCase = new CreateFramerUseCase(
    framerRepo,
    framerTypeRepo,
    paramEventRepo,
    paramUow,
    paramIdGen,
  );
  const updateFramerUseCase = new UpdateFramerUseCase(
    framerRepo,
    paramEventRepo,
    paramUow,
    paramIdGen,
  );
  const deleteFramerUseCase = new DeleteFramerUseCase(framerRepo, paramUow);
  const createTargetObjectUseCase = new CreateTargetObjectUseCase(
    targetObjectRepo,
    paramUow,
    paramIdGen,
  );
  const createTargetFieldUseCase = new CreateTargetFieldUseCase(
    targetObjectRepo,
    targetFieldRepo,
    paramUow,
    paramIdGen,
  );
  const createIncidenceRuleUseCase = new CreateIncidenceRuleUseCase(
    incidenceRuleRepo,
    framerRepo,
    targetObjectRepo,
    paramEventRepo,
    paramUow,
    paramIdGen,
  );
  const updateIncidenceRuleUseCase = new UpdateIncidenceRuleUseCase(
    incidenceRuleRepo,
    paramEventRepo,
    paramUow,
    paramIdGen,
  );
  const deleteIncidenceRuleUseCase = new DeleteIncidenceRuleUseCase(incidenceRuleRepo, paramUow);
  const createRoutineUseCase = new CreateRoutineUseCase(
    routineRepo,
    paramEventRepo,
    paramUow,
    paramIdGen,
  );
  const updateRoutineUseCase = new UpdateRoutineUseCase(routineRepo, paramUow);
  const publishRoutineUseCase = new PublishRoutineUseCase(
    routineRepo,
    routineItemRepo,
    paramEventRepo,
    paramUow,
    paramIdGen,
  );
  const forkRoutineUseCase = new ForkRoutineUseCase(
    routineRepo,
    routineItemRepo,
    routineLinkRepo,
    versionHistoryRepo,
    paramEventRepo,
    paramUow,
    paramIdGen,
  );
  const createRoutineItemUseCase = new CreateRoutineItemUseCase(
    routineRepo,
    routineItemRepo,
    paramEventRepo,
    paramUow,
    paramIdGen,
  );
  const updateRoutineItemUseCase = new UpdateRoutineItemUseCase(
    routineRepo,
    routineItemRepo,
    paramUow,
  );
  const deleteRoutineItemUseCase = new DeleteRoutineItemUseCase(
    routineRepo,
    routineItemRepo,
    paramUow,
  );
  const linkRoutineUseCase = new LinkRoutineUseCase(
    routineRepo,
    incidenceRuleRepo,
    routineLinkRepo,
    paramEventRepo,
    paramUow,
    paramIdGen,
  );
  const unlinkRoutineUseCase = new UnlinkRoutineUseCase(
    routineLinkRepo,
    paramEventRepo,
    paramUow,
    paramIdGen,
  );
  const evaluateRulesUseCase = new EvaluateRulesUseCase(
    incidenceRuleRepo,
    routineRepo,
    routineItemRepo,
    routineLinkRepo,
    paramEventRepo,
    paramUow,
    paramIdGen,
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 9. MOD-008 Integration-Protheus — Repositories + Use Cases
  // ─────────────────────────────────────────────────────────────────────────

  const integServiceRepo = new DrizzleIntegrationServiceRepository(db);
  const integRoutineRepo = new DrizzleIntegrationRoutineRepository(db);
  const fieldMappingRepo = new DrizzleFieldMappingRepository(db);
  const integParamRepo = new DrizzleIntegrationParamRepository(db);
  const callLogRepo = new DrizzleCallLogRepository(db);
  const reprocessRepo = new DrizzleReprocessRequestRepository(db);
  const encryption = new StubEncryptionService();
  const queuePort = new StubQueuePort();

  const createServiceUseCase = new CreateServiceUseCase(
    integServiceRepo,
    eventRepo,
    uow,
    hashUtil,
    encryption,
  );
  const updateServiceUseCase = new UpdateServiceUseCase(
    integServiceRepo,
    eventRepo,
    uow,
    encryption,
  );
  const listServicesUseCase = new ListServicesUseCase(integServiceRepo);
  const configureRoutineUseCase = new ConfigureRoutineUseCase(
    integRoutineRepo,
    integServiceRepo,
    eventRepo,
    uow,
    hashUtil,
  );
  const forkIntegRoutineUseCase = new ForkIntegrationRoutineUseCase(
    integRoutineRepo,
    fieldMappingRepo,
    integParamRepo,
    uow,
    hashUtil,
  );
  const createFieldMappingUseCase = new CreateFieldMappingUseCase(fieldMappingRepo, uow, hashUtil);
  const updateFieldMappingUseCase = new UpdateFieldMappingUseCase(fieldMappingRepo, uow);
  const deleteFieldMappingUseCase = new DeleteFieldMappingUseCase(fieldMappingRepo, uow);
  const createParamUseCase = new CreateParamUseCase(integParamRepo, uow, hashUtil);
  const updateParamUseCase = new UpdateParamUseCase(integParamRepo, uow);
  const executeIntegrationUseCase = new ExecuteIntegrationUseCase(
    integServiceRepo,
    integRoutineRepo,
    fieldMappingRepo,
    integParamRepo,
    callLogRepo,
    eventRepo,
    uow,
    hashUtil,
    queuePort,
  );
  const reprocessCallUseCase = new ReprocessCallUseCase(
    callLogRepo,
    reprocessRepo,
    eventRepo,
    uow,
    hashUtil,
    queuePort,
  );
  const listCallLogsUseCase = new ListCallLogsUseCase(callLogRepo);
  const getCallLogUseCase = new GetCallLogUseCase(callLogRepo);
  const getCallLogMetricsUseCase = new GetCallLogMetricsUseCase(callLogRepo);

  // ─────────────────────────────────────────────────────────────────────────
  // 10. MOD-009 Movement-Approval — Repositories + Use Cases
  // ─────────────────────────────────────────────────────────────────────────

  const controlRuleRepo = new DrizzleControlRuleRepository(db);
  const approvalRuleRepo = new DrizzleApprovalRuleRepository(db);
  const movementRepo = new DrizzleMovementRepository(db);
  const approvalInstanceRepo = new DrizzleApprovalInstanceRepository(db);
  const movExecutionRepo = new DrizzleMovementExecutionRepository(db);
  const movHistoryRepo = new DrizzleMovementHistoryRepository(db);
  const overrideLogRepo = new DrizzleOverrideLogRepository(db);
  const movApprovalUow = new DrizzleMovApprovalUnitOfWork(db);
  const movApprovalEventRepo = new DrizzleMovApprovalEventRepository(db);
  const movApprovalIdGen = new MovApprovalIdGen();
  const codigoGen = new DrizzleCodigoGenerator(db);

  const createControlRuleUseCase = new CreateControlRuleUseCase(
    controlRuleRepo,
    movApprovalEventRepo,
    movApprovalUow,
    movApprovalIdGen,
  );
  const updateControlRuleUseCase = new UpdateControlRuleUseCase(
    controlRuleRepo,
    movApprovalEventRepo,
    movApprovalUow,
  );
  const listControlRulesUseCase = new ListControlRulesUseCase(controlRuleRepo);
  const createApprovalRuleUseCase = new CreateApprovalRuleUseCase(
    controlRuleRepo,
    approvalRuleRepo,
    movApprovalEventRepo,
    movApprovalUow,
    movApprovalIdGen,
  );
  const updateApprovalRuleUseCase = new UpdateApprovalRuleUseCase(
    approvalRuleRepo,
    movApprovalEventRepo,
    movApprovalUow,
  );
  const evaluateMovementUseCase = new EvaluateMovementUseCase(
    controlRuleRepo,
    approvalRuleRepo,
    movementRepo,
    approvalInstanceRepo,
    movHistoryRepo,
    movApprovalEventRepo,
    movApprovalUow,
    movApprovalIdGen,
    codigoGen,
  );
  const approveMovementUseCase = new ApproveMovementUseCase(
    movementRepo,
    approvalInstanceRepo,
    approvalRuleRepo,
    movHistoryRepo,
    movApprovalEventRepo,
    movApprovalUow,
    movApprovalIdGen,
  );
  const rejectMovementUseCase = new RejectMovementUseCase(
    movementRepo,
    approvalInstanceRepo,
    movHistoryRepo,
    movApprovalEventRepo,
    movApprovalUow,
    movApprovalIdGen,
  );
  const listMyApprovalsUseCase = new ListMyApprovalsUseCase(approvalInstanceRepo);
  const getMovementUseCase = new GetMovementUseCase(
    movementRepo,
    approvalInstanceRepo,
    movHistoryRepo,
  );
  const listMovementsUseCase = new ListMovementsUseCase(movementRepo);
  const cancelMovementUseCase = new CancelMovementUseCase(
    movementRepo,
    movHistoryRepo,
    movApprovalEventRepo,
    movApprovalUow,
    movApprovalIdGen,
  );
  const overrideMovementUseCase = new OverrideMovementUseCase(
    movementRepo,
    movHistoryRepo,
    overrideLogRepo,
    movApprovalEventRepo,
    movApprovalUow,
    movApprovalIdGen,
  );
  const retryMovementUseCase = new RetryMovementUseCase(
    movementRepo,
    movHistoryRepo,
    movExecutionRepo,
    movApprovalEventRepo,
    movApprovalUow,
    movApprovalIdGen,
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 11. MOD-010 MCP-Automation — Repositories + Use Cases
  // ─────────────────────────────────────────────────────────────────────────

  const mcpAgentRepo = new DrizzleMcpAgentRepository(db);
  const mcpActionTypeRepo = new DrizzleMcpActionTypeRepository(db);
  const mcpActionRepo = new DrizzleMcpActionRepository(db);
  const mcpLinkRepo = new DrizzleMcpAgentActionLinkRepository(db);
  const mcpExecRepo = new DrizzleMcpExecutionRepository(db);
  const mcpUow = new DrizzleMcpUnitOfWork(db);
  const mcpEventRepo = new DrizzleMcpEventRepository(db);
  const mcpIdGen = new CryptoMcpIdGenerator();
  const apiKeyService = new StubApiKeyService();
  const movementEngineGw = new StubMovementEngineGateway();
  const routineEvaluator = new StubRoutineEvaluator();
  const integrationQueue = new StubIntegrationQueue();
  const executorRegistry = new StubActionExecutorRegistry();

  const createAgentUseCase = new CreateAgentUseCase(
    mcpAgentRepo,
    mcpEventRepo,
    mcpUow,
    mcpIdGen,
    apiKeyService,
  );
  const listAgentsUseCase = new ListAgentsUseCase(mcpAgentRepo);
  const revokeAgentUseCase = new RevokeAgentUseCase(mcpAgentRepo, mcpEventRepo, mcpUow);
  const rotateAgentKeyUseCase = new RotateAgentKeyUseCase(
    mcpAgentRepo,
    mcpEventRepo,
    mcpUow,
    apiKeyService,
  );
  const enablePhase2UseCase = new EnablePhase2UseCase(mcpAgentRepo, mcpEventRepo, mcpUow);
  const updateAgentUseCase = new UpdateAgentUseCase(mcpAgentRepo, mcpEventRepo, mcpUow);
  const createActionUseCase = new CreateActionUseCase(
    mcpActionRepo,
    mcpActionTypeRepo,
    mcpEventRepo,
    mcpUow,
    mcpIdGen,
  );
  const updateActionUseCase = new UpdateActionUseCase(
    mcpActionRepo,
    mcpActionTypeRepo,
    mcpEventRepo,
    mcpUow,
  );
  const grantAgentActionUseCase = new GrantAgentActionUseCase(
    mcpAgentRepo,
    mcpActionRepo,
    mcpLinkRepo,
    mcpEventRepo,
    mcpUow,
    mcpIdGen,
  );
  const revokeAgentActionUseCase = new RevokeAgentActionUseCase(
    mcpLinkRepo,
    mcpActionRepo,
    mcpEventRepo,
    mcpUow,
  );
  const listExecutionsUseCase = new ListExecutionsUseCase(mcpExecRepo);
  const getExecutionUseCase = new GetExecutionUseCase(mcpExecRepo);
  const executeMcpUseCase = new ExecuteMcpUseCase(
    mcpAgentRepo,
    mcpActionRepo,
    mcpLinkRepo,
    mcpExecRepo,
    mcpEventRepo,
    mcpUow,
    mcpIdGen,
    apiKeyService,
    movementEngineGw,
    routineEvaluator,
    integrationQueue,
    executorRegistry,
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 12. Build DI container
  // ─────────────────────────────────────────────────────────────────────────

  const container = {
    // MOD-000 Foundation — Use Cases
    loginUseCase,
    logoutUseCase,
    refreshTokenUseCase,
    getProfileUseCase,
    updateProfileUseCase,
    changePasswordUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase,
    createUserUseCase,
    deleteUserUseCase,
    createRoleUseCase,
    updateRoleUseCase,
    createTenantUseCase,
    addTenantUserUseCase,
    // MOD-000 Foundation — Direct repo access
    userRepo,
    sessionRepo,
    tenantRepo,
    roleRepo,
    tenantUserRepo,

    // MOD-003 Org-Units
    createOrgUnitUseCase,
    updateOrgUnitUseCase,
    deleteOrgUnitUseCase,
    restoreOrgUnitUseCase,
    getOrgUnitUseCase,
    listOrgUnitsUseCase,
    getOrgUnitTreeUseCase,
    linkTenantUseCase,
    unlinkTenantUseCase,

    // MOD-004 Identity-Advanced
    createOrgScopeUseCase,
    deleteOrgScopeUseCase,
    listOrgScopesUseCase,
    createAccessShareUseCase,
    listAccessSharesUseCase,
    listMySharedAccessesUseCase,
    revokeAccessShareUseCase,
    createAccessDelegationUseCase,
    revokeAccessDelegationUseCase,
    expireIdentityGrantsUseCase,

    // MOD-005 Process-Modeling — Use Cases
    createCycleUseCase,
    updateCycleUseCase,
    deleteCycleUseCase,
    publishCycleUseCase,
    forkCycleUseCase,
    deprecateCycleUseCase,
    getCycleFlowUseCase,
    listCyclesUseCase,
    getCycleUseCase,
    createMacroStageUseCase,
    updateMacroStageUseCase,
    deleteMacroStageUseCase,
    createStageUseCase,
    updateStageUseCase,
    deleteStageUseCase,
    getStageDetailUseCase,
    createGateUseCase,
    updateGateUseCase,
    deleteGateUseCase,
    createProcessRoleUseCase,
    updateProcessRoleUseCase,
    deleteProcessRoleUseCase,
    listProcessRolesUseCase,
    linkStageRoleUseCase,
    unlinkStageRoleUseCase,
    createTransitionUseCase,
    deleteTransitionUseCase,

    // MOD-006 Case-Execution
    openCaseUseCase,
    transitionStageUseCase,
    resolveGateUseCase,
    waiveGateUseCase,
    assignResponsibleUseCase,
    recordEventUseCase,
    controlCaseUseCase,
    listCasesUseCase,
    getCaseDetailsUseCase,
    getTimelineUseCase,
    listGatesUseCase,
    listAssignmentsUseCase,
    expireAssignmentsUseCase,

    // MOD-007 Contextual-Params
    createFramerTypeUseCase,
    createFramerUseCase,
    updateFramerUseCase,
    deleteFramerUseCase,
    createTargetObjectUseCase,
    createTargetFieldUseCase,
    createIncidenceRuleUseCase,
    updateIncidenceRuleUseCase,
    deleteIncidenceRuleUseCase,
    createRoutineUseCase,
    updateRoutineUseCase,
    publishRoutineUseCase,
    forkRoutineUseCase,
    createRoutineItemUseCase,
    updateRoutineItemUseCase,
    deleteRoutineItemUseCase,
    linkRoutineUseCase,
    unlinkRoutineUseCase,
    evaluateRulesUseCase,

    // MOD-008 Integration-Protheus
    createServiceUseCase,
    updateServiceUseCase,
    listServicesUseCase,
    configureRoutineUseCase,
    forkIntegRoutineUseCase,
    createFieldMappingUseCase,
    updateFieldMappingUseCase,
    deleteFieldMappingUseCase,
    createParamUseCase,
    updateParamUseCase,
    executeIntegrationUseCase,
    reprocessCallUseCase,
    listCallLogsUseCase,
    getCallLogUseCase,
    getCallLogMetricsUseCase,

    // MOD-009 Movement-Approval
    createControlRuleUseCase,
    updateControlRuleUseCase,
    listControlRulesUseCase,
    createApprovalRuleUseCase,
    updateApprovalRuleUseCase,
    evaluateMovementUseCase,
    approveMovementUseCase,
    rejectMovementUseCase,
    listMyApprovalsUseCase,
    getMovementUseCase,
    listMovementsUseCase,
    cancelMovementUseCase,
    overrideMovementUseCase,
    retryMovementUseCase,

    // MOD-010 MCP-Automation
    createAgentUseCase,
    listAgentsUseCase,
    revokeAgentUseCase,
    rotateAgentKeyUseCase,
    enablePhase2UseCase,
    updateAgentUseCase,
    createActionUseCase,
    updateActionUseCase,
    grantAgentActionUseCase,
    revokeAgentActionUseCase,
    listExecutionsUseCase,
    getExecutionUseCase,
    executeMcpUseCase,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Dashboard (read-only query repo — no use cases needed)
  // ─────────────────────────────────────────────────────────────────────────

  const dashboardQueryRepo = new DashboardQueryRepository(db);
  (container as Record<string, unknown>).dashboardQueryRepo = dashboardQueryRepo;

  // ─────────────────────────────────────────────────────────────────────────
  // 13. Decorate Fastify
  // ─────────────────────────────────────────────────────────────────────────

  app.decorateRequest('dipiContainer', { getter: () => container });

  app.decorate('caseExecution', container);
  app.decorate('movementApproval', container);
  app.decorate('mcpAutomation', container);
}

export const diPlugin = fp(diPluginImpl, { name: 'di-plugin' });
