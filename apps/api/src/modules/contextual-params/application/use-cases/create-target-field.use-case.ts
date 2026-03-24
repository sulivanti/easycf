/**
 * @contract FR-003, DATA-007 E-004
 *
 * Use Case: Add a target field to a target object.
 * field_type constrained to: TEXT, NUMBER, DATE, SELECT, BOOLEAN, FILE.
 */

import type {
  TargetObjectRepository,
  TargetFieldRepository,
  TargetFieldRecord,
  UnitOfWork,
} from '../ports/repositories.js';
import type { IdGeneratorService } from '../ports/services.js';

export interface CreateTargetFieldInput {
  readonly targetObjectId: string;
  readonly fieldKey: string;
  readonly fieldLabel?: string;
  readonly fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'BOOLEAN' | 'FILE';
  readonly isSystem?: boolean;
  readonly tenantId: string;
}

export interface CreateTargetFieldOutput {
  readonly id: string;
  readonly fieldKey: string;
  readonly fieldType: string;
}

export class CreateTargetFieldUseCase {
  constructor(
    private readonly targetObjectRepo: TargetObjectRepository,
    private readonly targetFieldRepo: TargetFieldRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: CreateTargetFieldInput): Promise<CreateTargetFieldOutput> {
    const targetObject = await this.targetObjectRepo.findById(input.tenantId, input.targetObjectId);
    if (!targetObject) {
      throw new Error(`Objeto-alvo ${input.targetObjectId} não encontrado.`);
    }

    const now = new Date();

    const record: TargetFieldRecord = {
      id: this.idGen.generate(),
      targetObjectId: input.targetObjectId,
      fieldKey: input.fieldKey,
      fieldLabel: input.fieldLabel ?? null,
      fieldType: input.fieldType,
      isSystem: input.isSystem ?? false,
      tenantId: input.tenantId,
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.uow.transaction(async (tx) => {
      return this.targetFieldRepo.create(record, tx);
    });

    return {
      id: created.id,
      fieldKey: created.fieldKey,
      fieldType: created.fieldType,
    };
  }
}
