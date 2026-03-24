/**
 * @contract FR-004, BR-001, BR-005, DATA-008
 *
 * Use Cases: CRUD for integration parameters.
 * - Only DRAFT routines allow mutation (BR-001)
 * - is_sensitive=true → value masked in logs and UI (BR-005)
 */

import { IntegrationRoutineImmutableError } from '../../domain/errors/integration-errors.js';
import type { IntegrationParamRepository, IntegrationParamRow } from '../ports/repositories.js';
import type { UnitOfWork } from '../../../foundation/application/ports/repositories.js';
import type { HashUtilService } from '../../../foundation/application/ports/services.js';

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateParamInput {
  readonly tenantId: string;
  readonly routineId: string;
  readonly routineStatus: string;
  readonly paramKey: string;
  readonly paramType: 'FIXED' | 'DERIVED_FROM_TENANT' | 'DERIVED_FROM_CONTEXT' | 'HEADER';
  readonly value?: string | null;
  readonly derivationExpr?: string | null;
  readonly isSensitive?: boolean;
}

export interface ParamOutput {
  readonly id: string;
  readonly routineId: string;
  readonly paramKey: string;
  readonly paramType: string;
  readonly value: string | null;
  readonly derivationExpr: string | null;
  readonly isSensitive: boolean;
}

export class CreateParamUseCase {
  constructor(
    private readonly paramRepo: IntegrationParamRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
  ) {}

  async execute(input: CreateParamInput): Promise<ParamOutput> {
    if (input.routineStatus !== 'DRAFT') {
      throw new IntegrationRoutineImmutableError(input.routineId);
    }

    const id = this.hashUtil.generateUuid();
    const now = new Date();

    const row: IntegrationParamRow = {
      id,
      tenantId: input.tenantId,
      routineId: input.routineId,
      paramKey: input.paramKey.trim(),
      paramType: input.paramType,
      value: input.value ?? null,
      derivationExpr: input.derivationExpr ?? null,
      isSensitive: input.isSensitive ?? false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await this.uow.transaction(async (tx) => {
      await this.paramRepo.create(row, tx);
    });

    return toOutput(row);
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export interface UpdateParamInput {
  readonly id: string;
  readonly tenantId: string;
  readonly routineStatus: string;
  readonly paramKey?: string;
  readonly paramType?: 'FIXED' | 'DERIVED_FROM_TENANT' | 'DERIVED_FROM_CONTEXT' | 'HEADER';
  readonly value?: string | null;
  readonly derivationExpr?: string | null;
  readonly isSensitive?: boolean;
}

export class UpdateParamUseCase {
  constructor(
    private readonly paramRepo: IntegrationParamRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateParamInput): Promise<ParamOutput> {
    const existing = await this.paramRepo.findById(input.id);
    if (!existing || existing.tenantId !== input.tenantId) {
      throw new Error(`Integration param not found: ${input.id}`);
    }

    if (input.routineStatus !== 'DRAFT') {
      throw new IntegrationRoutineImmutableError(existing.routineId);
    }

    const now = new Date();
    const updated: IntegrationParamRow = {
      ...existing,
      paramKey: input.paramKey?.trim() ?? existing.paramKey,
      paramType: input.paramType ?? existing.paramType,
      value: input.value !== undefined ? input.value : existing.value,
      derivationExpr:
        input.derivationExpr !== undefined ? input.derivationExpr : existing.derivationExpr,
      isSensitive: input.isSensitive ?? existing.isSensitive,
      updatedAt: now,
    };

    await this.uow.transaction(async (tx) => {
      await this.paramRepo.update(updated, tx);
    });

    return toOutput(updated);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toOutput(row: IntegrationParamRow): ParamOutput {
  return {
    id: row.id,
    routineId: row.routineId,
    paramKey: row.paramKey,
    paramType: row.paramType,
    value: row.isSensitive ? '***' : row.value,
    derivationExpr: row.derivationExpr,
    isSensitive: row.isSensitive,
  };
}
