/**
 * @contract FR-001, BR-002, DATA-003, SEC-008
 *
 * Use Case: Create Integration Service (destination catalog).
 * - auth_config encrypted at rest with AES-256 (ADR-004)
 * - Emits integration.service_created domain event
 */

import {
  createIntegrationEvent,
  INTEGRATION_EVENT_TYPES,
} from '../../domain/domain-events/integration-events.js';
import type { IntegrationServiceProps } from '../../domain/entities/integration-service.entity.js';
import type { IntegrationServiceRepository, EncryptionService } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type { HashUtilService } from '../../../foundation/application/ports/services.js';

export interface CreateServiceInput {
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly baseUrl: string;
  readonly authType: 'NONE' | 'BASIC' | 'BEARER' | 'OAUTH2';
  readonly authConfig: Record<string, unknown> | null;
  readonly timeoutMs?: number;
  readonly environment: 'PROD' | 'HML' | 'DEV';
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface CreateServiceOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly baseUrl: string;
  readonly authType: string;
  readonly timeoutMs: number;
  readonly status: 'ACTIVE';
  readonly environment: string;
}

export class CreateServiceUseCase {
  constructor(
    private readonly serviceRepo: IntegrationServiceRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
    private readonly encryption: EncryptionService,
  ) {}

  async execute(input: CreateServiceInput): Promise<CreateServiceOutput> {
    const id = this.hashUtil.generateUuid();
    const now = new Date();

    // ADR-004: Encrypt auth_config at rest
    const encryptedAuthConfig =
      input.authConfig !== null
        ? JSON.parse(this.encryption.encrypt(JSON.stringify(input.authConfig)))
        : null;

    const serviceProps: IntegrationServiceProps = {
      id,
      tenantId: input.tenantId,
      codigo: input.codigo.trim(),
      nome: input.nome.trim(),
      baseUrl: input.baseUrl.trim(),
      authType: input.authType,
      authConfig: encryptedAuthConfig,
      timeoutMs: input.timeoutMs ?? 30000,
      status: 'ACTIVE',
      environment: input.environment,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await this.uow.transaction(async (tx) => {
      await this.serviceRepo.create(serviceProps, tx);

      await this.eventRepo.create(
        createIntegrationEvent({
          eventType: INTEGRATION_EVENT_TYPES.SERVICE_CREATED,
          entityType: 'integration_service',
          entityId: id,
          tenantId: input.tenantId,
          createdBy: input.createdBy,
          correlationId: input.correlationId,
          sensitivityLevel: 2,
          payload: {
            id,
            codigo: serviceProps.codigo,
            nome: serviceProps.nome,
            baseUrl: serviceProps.baseUrl,
            authType: serviceProps.authType,
            environment: serviceProps.environment,
            // BR-002: Never include auth_config in events
          },
        }),
        tx,
      );
    });

    return {
      id,
      codigo: serviceProps.codigo,
      nome: serviceProps.nome,
      baseUrl: serviceProps.baseUrl,
      authType: serviceProps.authType,
      timeoutMs: serviceProps.timeoutMs,
      status: 'ACTIVE',
      environment: serviceProps.environment,
    };
  }
}
