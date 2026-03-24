/**
 * @contract FR-003, BR-001, BR-004, DATA-008
 *
 * Use Cases: CRUD for integration field mappings.
 * - Only DRAFT routines allow mutation (BR-001)
 * - 5 mapping types: FIELD, PARAM, HEADER, FIXED_VALUE, DERIVED
 */

import { IntegrationRoutineImmutableError } from '../../domain/errors/integration-errors.js';
import type { FieldMappingRepository, FieldMappingRow } from '../ports/repositories.js';
import type { UnitOfWork } from '../../../foundation/application/ports/repositories.js';
import type { HashUtilService } from '../../../foundation/application/ports/services.js';

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateFieldMappingInput {
  readonly tenantId: string;
  readonly routineId: string;
  readonly routineStatus: string;
  readonly sourceField: string;
  readonly targetField: string;
  readonly mappingType: 'FIELD' | 'PARAM' | 'HEADER' | 'FIXED_VALUE' | 'DERIVED';
  readonly required?: boolean;
  readonly transformExpr?: string | null;
  readonly conditionExpr?: string | null;
  readonly defaultValue?: string | null;
  readonly ordem: number;
}

export interface FieldMappingOutput {
  readonly id: string;
  readonly routineId: string;
  readonly sourceField: string;
  readonly targetField: string;
  readonly mappingType: string;
  readonly required: boolean;
  readonly transformExpr: string | null;
  readonly conditionExpr: string | null;
  readonly defaultValue: string | null;
  readonly ordem: number;
}

export class CreateFieldMappingUseCase {
  constructor(
    private readonly mappingRepo: FieldMappingRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
  ) {}

  async execute(input: CreateFieldMappingInput): Promise<FieldMappingOutput> {
    if (input.routineStatus !== 'DRAFT') {
      throw new IntegrationRoutineImmutableError(input.routineId);
    }

    const id = this.hashUtil.generateUuid();
    const now = new Date();

    const row: FieldMappingRow = {
      id,
      tenantId: input.tenantId,
      routineId: input.routineId,
      sourceField: input.sourceField.trim(),
      targetField: input.targetField.trim(),
      mappingType: input.mappingType,
      required: input.required ?? false,
      transformExpr: input.transformExpr ?? null,
      conditionExpr: input.conditionExpr ?? null,
      defaultValue: input.defaultValue ?? null,
      ordem: input.ordem,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await this.uow.transaction(async (tx) => {
      await this.mappingRepo.create(row, tx);
    });

    return toOutput(row);
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export interface UpdateFieldMappingInput {
  readonly id: string;
  readonly tenantId: string;
  readonly routineStatus: string;
  readonly sourceField?: string;
  readonly targetField?: string;
  readonly mappingType?: 'FIELD' | 'PARAM' | 'HEADER' | 'FIXED_VALUE' | 'DERIVED';
  readonly required?: boolean;
  readonly transformExpr?: string | null;
  readonly conditionExpr?: string | null;
  readonly defaultValue?: string | null;
  readonly ordem?: number;
}

export class UpdateFieldMappingUseCase {
  constructor(
    private readonly mappingRepo: FieldMappingRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateFieldMappingInput): Promise<FieldMappingOutput> {
    const existing = await this.mappingRepo.findById(input.id);
    if (!existing || existing.tenantId !== input.tenantId) {
      throw new Error(`Field mapping not found: ${input.id}`);
    }

    if (input.routineStatus !== 'DRAFT') {
      throw new IntegrationRoutineImmutableError(existing.routineId);
    }

    const now = new Date();
    const updated: FieldMappingRow = {
      ...existing,
      sourceField: input.sourceField?.trim() ?? existing.sourceField,
      targetField: input.targetField?.trim() ?? existing.targetField,
      mappingType: input.mappingType ?? existing.mappingType,
      required: input.required ?? existing.required,
      transformExpr:
        input.transformExpr !== undefined ? input.transformExpr : existing.transformExpr,
      conditionExpr:
        input.conditionExpr !== undefined ? input.conditionExpr : existing.conditionExpr,
      defaultValue: input.defaultValue !== undefined ? input.defaultValue : existing.defaultValue,
      ordem: input.ordem ?? existing.ordem,
      updatedAt: now,
    };

    await this.uow.transaction(async (tx) => {
      await this.mappingRepo.update(updated, tx);
    });

    return toOutput(updated);
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export interface DeleteFieldMappingInput {
  readonly id: string;
  readonly tenantId: string;
  readonly routineStatus: string;
}

export class DeleteFieldMappingUseCase {
  constructor(
    private readonly mappingRepo: FieldMappingRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: DeleteFieldMappingInput): Promise<void> {
    const existing = await this.mappingRepo.findById(input.id);
    if (!existing || existing.tenantId !== input.tenantId) {
      throw new Error(`Field mapping not found: ${input.id}`);
    }

    if (input.routineStatus !== 'DRAFT') {
      throw new IntegrationRoutineImmutableError(existing.routineId);
    }

    await this.uow.transaction(async (tx) => {
      await this.mappingRepo.softDelete(input.id, tx);
    });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toOutput(row: FieldMappingRow): FieldMappingOutput {
  return {
    id: row.id,
    routineId: row.routineId,
    sourceField: row.sourceField,
    targetField: row.targetField,
    mappingType: row.mappingType,
    required: row.required,
    transformExpr: row.transformExpr,
    conditionExpr: row.conditionExpr,
    defaultValue: row.defaultValue,
    ordem: row.ordem,
  };
}
