/**
 * @contract BR-001, BR-002, BR-003, BR-004, BR-005, BR-007, BR-008, BR-010, BR-012
 *
 * Domain errors for the Integration Protheus module.
 * All errors extend DomainError (DOC-GNP-00) with RFC 9457 Problem Details fields.
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

/** BR-001: PUBLISHED integration routine is immutable */
export class IntegrationRoutineImmutableError extends DomainError {
  readonly type = '/problems/integration-routine-immutable';
  readonly statusHint = 422;

  constructor(routineId: string) {
    super(`Rotinas publicadas são imutáveis (${routineId}). Use o fork para criar nova versão.`);
  }
}

/** BR-003: Service is inactive — cannot execute routines */
export class ServiceInactiveError extends DomainError {
  readonly type = '/problems/service-inactive';
  readonly statusHint = 422;

  constructor(serviceId: string, codigo: string) {
    super(`Serviço inativo: ${codigo} (${serviceId}).`);
  }
}

/** BR-003: Service has active routines — cannot be soft-deleted */
export class ServiceHasActiveRoutinesError extends DomainError {
  readonly type = '/problems/service-has-active-routines';
  readonly statusHint = 422;

  constructor(serviceId: string, routineCount: number) {
    super(
      `Serviço ${serviceId} possui ${routineCount} rotina(s) ativa(s) vinculada(s). Desvincule antes de desativar.`,
    );
  }
}

/** BR-004: Required field missing in execution context */
export class RequiredFieldMissingError extends DomainError {
  readonly type = '/problems/required-field-missing';
  readonly statusHint = 422;

  constructor(sourceField: string) {
    super(`Campo obrigatório ausente: ${sourceField}`);
  }
}

/** BR-007: Retry max exhausted — call moved to DLQ */
export class CallDlqError extends DomainError {
  readonly type = '/problems/call-dlq';
  readonly statusHint = 422;

  constructor(logId: string, totalAttempts: number) {
    super(`Chamada ${logId} movida para DLQ após ${totalAttempts} tentativa(s).`);
  }
}

/** BR-008: Reprocess justification too short (min 10 chars) */
export class ReprocessReasonTooShortError extends DomainError {
  readonly type = '/problems/reprocess-reason-too-short';
  readonly statusHint = 422;

  constructor(reasonLength: number) {
    super(
      `Justificativa de reprocessamento deve ter no mínimo 10 caracteres (atual: ${reasonLength}).`,
    );
  }
}

/** BR-008: Only DLQ logs can be reprocessed */
export class LogNotInDlqError extends DomainError {
  readonly type = '/problems/log-not-in-dlq';
  readonly statusHint = 422;

  constructor(logId: string, currentStatus: string) {
    super(
      `Log ${logId} não está em DLQ (status atual: ${currentStatus}). Apenas chamadas DLQ podem ser reprocessadas.`,
    );
  }
}

/** BR-012: No HML service available for testing */
export class NoHmlServiceError extends DomainError {
  readonly type = '/problems/no-hml-service';
  readonly statusHint = 422;

  constructor(tenantId: string) {
    super(
      `Nenhum serviço de homologação (HML) cadastrado para o tenant ${tenantId}. Cadastre um serviço HML para habilitar testes.`,
    );
  }
}
