/**
 * @contract DATA-003, DOC-ARC-003, SEC-002
 *
 * Domain event type definitions for MOD-008.
 * 8 events covering the full lifecycle of integration services,
 * routine configuration, and execution engine.
 */

import type { DomainEventBase } from '../../../foundation/domain/events/foundation-events.js';

export const INTEGRATION_EVENT_TYPES = {
  // Catálogo de Serviços (F01)
  SERVICE_CREATED: 'integration.service_created',
  SERVICE_UPDATED: 'integration.service_updated',

  // Configuração de Rotinas (F01)
  ROUTINE_CONFIGURED: 'integration.routine_configured',

  // Motor de Execução (F03)
  CALL_QUEUED: 'integration.call_queued',
  CALL_COMPLETED: 'integration.call_completed',
  CALL_FAILED: 'integration.call_failed',
  CALL_DLQ: 'integration.call_dlq',
  CALL_REPROCESSED: 'integration.call_reprocessed',
} as const;

export type IntegrationEventType =
  (typeof INTEGRATION_EVENT_TYPES)[keyof typeof INTEGRATION_EVENT_TYPES];

export function createIntegrationEvent(params: {
  eventType: IntegrationEventType;
  entityType?: string;
  entityId: string;
  tenantId: string;
  createdBy: string | null;
  correlationId: string;
  causationId?: string;
  sensitivityLevel: 0 | 1 | 2 | 3;
  payload: Record<string, unknown>;
}): DomainEventBase {
  const entityType = params.entityType ?? params.eventType.split('.')[0];
  return {
    tenantId: params.tenantId,
    entityType,
    entityId: params.entityId,
    eventType: params.eventType,
    payload: params.payload,
    correlationId: params.correlationId,
    createdBy: params.createdBy,
    sensitivityLevel: params.sensitivityLevel,
    causationId: params.causationId,
  };
}
