/**
 * @contract FR-001, BR-002, SEC-008
 *
 * Use Case: List Integration Services with cursor-based pagination.
 * - auth_config is NEVER returned (BR-002) — sanitized by entity
 */

import { IntegrationService } from '../../domain/entities/integration-service.entity.js';
import type { IntegrationServiceRepository, ServiceListFilters } from '../ports/repositories.js';
import type {
  PaginationParams,
  PaginatedResult,
} from '../../../foundation/application/ports/repositories.js';

export interface ListServicesInput {
  readonly tenantId: string;
  readonly status?: 'ACTIVE' | 'INACTIVE';
  readonly environment?: 'PROD' | 'HML' | 'DEV';
  readonly cursor?: string;
  readonly limit: number;
}

export interface ServiceListItem {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly baseUrl: string;
  readonly authType: string;
  readonly timeoutMs: number;
  readonly status: string;
  readonly environment: string;
  readonly createdAt: Date;
}

export class ListServicesUseCase {
  constructor(private readonly serviceRepo: IntegrationServiceRepository) {}

  async execute(input: ListServicesInput): Promise<PaginatedResult<ServiceListItem>> {
    const filters: ServiceListFilters = {
      tenantId: input.tenantId,
      status: input.status,
      environment: input.environment,
    };

    const pagination: PaginationParams = {
      cursor: input.cursor,
      limit: input.limit,
    };

    const result = await this.serviceRepo.list(filters, pagination);

    return {
      data: result.data.map((row) => {
        const _entity = new IntegrationService(row);
        return {
          id: row.id,
          codigo: row.codigo,
          nome: row.nome,
          baseUrl: row.baseUrl,
          authType: row.authType,
          timeoutMs: row.timeoutMs,
          status: row.status,
          environment: row.environment,
          createdAt: row.createdAt,
        };
      }),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }
}
