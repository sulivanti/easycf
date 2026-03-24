/**
 * @contract FR-001..FR-009, SEC-008, DATA-003, DATA-008
 *
 * Integration Protheus application layer — central re-export.
 */

// Ports
export type {
  IntegrationServiceRepository,
  IntegrationRoutineRepository,
  IntegrationRoutineRow,
  FieldMappingRepository,
  FieldMappingRow,
  IntegrationParamRepository,
  IntegrationParamRow,
  CallLogRepository,
  CallLogRow,
  CallLogListFilters,
  ReprocessRequestRepository,
  ReprocessRequestRow,
  ServiceListFilters,
  EncryptionService,
  HttpClientPort,
  HttpCallOptions,
  HttpCallResult,
  QueuePort,
} from './ports/repositories.js';

// Use Cases — Services (FR-001)
export { CreateServiceUseCase } from './use-cases/create-service.use-case.js';
export type {
  CreateServiceInput,
  CreateServiceOutput,
} from './use-cases/create-service.use-case.js';

export { UpdateServiceUseCase } from './use-cases/update-service.use-case.js';
export type {
  UpdateServiceInput,
  UpdateServiceOutput,
} from './use-cases/update-service.use-case.js';

export { ListServicesUseCase } from './use-cases/list-services.use-case.js';
export type { ListServicesInput, ServiceListItem } from './use-cases/list-services.use-case.js';

// Use Cases — Routine configuration (FR-002)
export { ConfigureRoutineUseCase } from './use-cases/configure-routine.use-case.js';
export type {
  ConfigureRoutineInput,
  ConfigureRoutineOutput,
} from './use-cases/configure-routine.use-case.js';

// Use Cases — Field mappings (FR-003)
export {
  CreateFieldMappingUseCase,
  UpdateFieldMappingUseCase,
  DeleteFieldMappingUseCase,
} from './use-cases/manage-field-mappings.use-case.js';
export type {
  CreateFieldMappingInput,
  UpdateFieldMappingInput,
  DeleteFieldMappingInput,
  FieldMappingOutput,
} from './use-cases/manage-field-mappings.use-case.js';

// Use Cases — Params (FR-004)
export { CreateParamUseCase, UpdateParamUseCase } from './use-cases/manage-params.use-case.js';
export type {
  CreateParamInput,
  UpdateParamInput,
  ParamOutput,
} from './use-cases/manage-params.use-case.js';

// Use Cases — Execution engine (FR-005, FR-006)
export { ExecuteIntegrationUseCase } from './use-cases/execute-integration.use-case.js';
export type {
  ExecuteIntegrationInput,
  ExecuteIntegrationOutput,
} from './use-cases/execute-integration.use-case.js';

// Use Cases — Reprocess DLQ (FR-007)
export { ReprocessCallUseCase } from './use-cases/reprocess-call.use-case.js';
export type {
  ReprocessCallInput,
  ReprocessCallOutput,
} from './use-cases/reprocess-call.use-case.js';

// Use Cases — Call logs (FR-009)
export { ListCallLogsUseCase, GetCallLogUseCase } from './use-cases/list-call-logs.use-case.js';
export type { ListCallLogsInput, CallLogOutput } from './use-cases/list-call-logs.use-case.js';

// Use Cases — Fork integration (FR-008)
export { ForkIntegrationRoutineUseCase } from './use-cases/fork-integration-routine.use-case.js';
export type {
  ForkIntegrationRoutineInput,
  ForkIntegrationRoutineOutput,
} from './use-cases/fork-integration-routine.use-case.js';

// Use Cases — Metrics (FR-011)
export { GetCallLogMetricsUseCase } from './use-cases/get-call-log-metrics.use-case.js';
export type {
  GetCallLogMetricsInput,
  CallLogMetricsOutput,
} from './use-cases/get-call-log-metrics.use-case.js';
