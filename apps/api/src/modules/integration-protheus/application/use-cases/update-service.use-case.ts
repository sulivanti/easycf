/**
 * @contract FR-001, BR-002, DATA-003, SEC-008
 *
 * Use Case: Update Integration Service.
 * - Re-encrypts auth_config if provided (ADR-004)
 * - Emits integration.service_updated domain event
 */

import { IntegrationService } from '../../domain/entities/integration-service.entity.js';
import {
  createIntegrationEvent,
  INTEGRATION_EVENT_TYPES,
} from '../../domain/domain-events/integration-events.js';
import type { IntegrationServiceRepository, EncryptionService } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';

export interface UpdateServiceInput {
  readonly id: string;
  readonly tenantId: string;
  readonly nome?: string;
  readonly baseUrl?: string;
  readonly authType?: 'NONE' | 'BASIC' | 'BEARER' | 'OAUTH2';
  readonly authConfig?: Record<string, unknown> | null;
  readonly timeoutMs?: number;
  readonly status?: 'ACTIVE' | 'INACTIVE';
  readonly environment?: 'PROD' | 'HML' | 'DEV';
  readonly updatedBy: string;
  readonly correlationId: string;
}

export interface UpdateServiceOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly baseUrl: string;
  readonly authType: string;
  readonly timeoutMs: number;
  readonly status: string;
  readonly environment: string;
}

export class UpdateServiceUseCase {
  constructor(
    private readonly serviceRepo: IntegrationServiceRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly encryption: EncryptionService,
  ) {}

  async execute(input: UpdateServiceInput): Promise<UpdateServiceOutput> {
    const existing = await this.serviceRepo.findById(input.id);
    if (!existing || existing.tenantId !== input.tenantId) {
      throw new Error(`Integration service not found: ${input.id}`);
    }

    const now = new Date();

    // ADR-004: Re-encrypt auth_config if provided
    let authConfig = existing.authConfig;
    if (input.authConfig !== undefined) {
      authConfig =
        input.authConfig !== null
          ? JSON.parse(this.encryption.encrypt(JSON.stringify(input.authConfig)))
          : null;
    }

    const updated = {
      ...existing,
      nome: input.nome?.trim() ?? existing.nome,
      baseUrl: input.baseUrl?.trim() ?? existing.baseUrl,
      authType: input.authType ?? existing.authType,
      authConfig,
      timeoutMs: input.timeoutMs ?? existing.timeoutMs,
      status: input.status ?? existing.status,
      environment: input.environment ?? existing.environment,
      updatedAt: now,
    };

    await this.uow.transaction(async (tx) => {
      await this.serviceRepo.update(updated, tx);

      const entity = new IntegrationService(updated);
      await this.eventRepo.create(
        createIntegrationEvent({
          eventType: INTEGRATION_EVENT_TYPES.SERVICE_UPDATED,
          entityType: 'integration_service',
          entityId: input.id,
          tenantId: input.tenantId,
          createdBy: input.updatedBy,
          correlationId: input.correlationId,
          sensitivityLevel: 2,
          payload: entity.toSanitizedProps(),
        }),
        tx,
      );
    });

    return {
      id: updated.id,
      codigo: updated.codigo,
      nome: updated.nome,
      baseUrl: updated.baseUrl,
      authType: updated.authType,
      timeoutMs: updated.timeoutMs,
      status: updated.status,
      environment: updated.environment,
    };
  }
}
