/**
 * @contract BR-001, BR-002, BR-003, BR-004, BR-005, BR-007, BR-008, BR-010, BR-012
 *
 * Domain errors for the Integration Protheus module.
 * All errors include a code for Problem Details (RFC 9457) mapping.
 */

/** BR-001: PUBLISHED integration routine is immutable */
export class IntegrationRoutineImmutableError extends Error {
  public readonly code = 'INTEGRATION_ROUTINE_IMMUTABLE';
  public readonly statusCode = 422;

  constructor(routineId: string) {
    super(`Rotinas publicadas são imutáveis (${routineId}). Use o fork para criar nova versão.`);
    this.name = 'IntegrationRoutineImmutableError';
  }
}

/** BR-003: Service is inactive — cannot execute routines */
export class ServiceInactiveError extends Error {
  public readonly code = 'SERVICE_INACTIVE';
  public readonly statusCode = 422;

  constructor(serviceId: string, codigo: string) {
    super(`Serviço inativo: ${codigo} (${serviceId}).`);
    this.name = 'ServiceInactiveError';
  }
}

/** BR-003: Service has active routines — cannot be soft-deleted */
export class ServiceHasActiveRoutinesError extends Error {
  public readonly code = 'SERVICE_HAS_ACTIVE_ROUTINES';
  public readonly statusCode = 422;

  constructor(serviceId: string, routineCount: number) {
    super(
      `Serviço ${serviceId} possui ${routineCount} rotina(s) ativa(s) vinculada(s). Desvincule antes de desativar.`,
    );
    this.name = 'ServiceHasActiveRoutinesError';
  }
}

/** BR-004: Required field missing in execution context */
export class RequiredFieldMissingError extends Error {
  public readonly code = 'REQUIRED_FIELD_MISSING';
  public readonly statusCode = 422;

  constructor(sourceField: string) {
    super(`Campo obrigatório ausente: ${sourceField}`);
    this.name = 'RequiredFieldMissingError';
  }
}

/** BR-007: Retry max exhausted — call moved to DLQ */
export class CallDlqError extends Error {
  public readonly code = 'CALL_DLQ';
  public readonly statusCode = 422;

  constructor(logId: string, totalAttempts: number) {
    super(`Chamada ${logId} movida para DLQ após ${totalAttempts} tentativa(s).`);
    this.name = 'CallDlqError';
  }
}

/** BR-008: Reprocess justification too short (min 10 chars) */
export class ReprocessReasonTooShortError extends Error {
  public readonly code = 'REPROCESS_REASON_TOO_SHORT';
  public readonly statusCode = 422;

  constructor(reasonLength: number) {
    super(
      `Justificativa de reprocessamento deve ter no mínimo 10 caracteres (atual: ${reasonLength}).`,
    );
    this.name = 'ReprocessReasonTooShortError';
  }
}

/** BR-008: Only DLQ logs can be reprocessed */
export class LogNotInDlqError extends Error {
  public readonly code = 'LOG_NOT_IN_DLQ';
  public readonly statusCode = 422;

  constructor(logId: string, currentStatus: string) {
    super(
      `Log ${logId} não está em DLQ (status atual: ${currentStatus}). Apenas chamadas DLQ podem ser reprocessadas.`,
    );
    this.name = 'LogNotInDlqError';
  }
}

/** BR-012: No HML service available for testing */
export class NoHmlServiceError extends Error {
  public readonly code = 'NO_HML_SERVICE';
  public readonly statusCode = 422;

  constructor(tenantId: string) {
    super(
      `Nenhum serviço de homologação (HML) cadastrado para o tenant ${tenantId}. Cadastre um serviço HML para habilitar testes.`,
    );
    this.name = 'NoHmlServiceError';
  }
}
