/**
 * @contract FR-008, BR-001, BR-010, DATA-008
 *
 * Use Case: Fork integration routine config + mappings + params.
 * - Copies atomically: integration_routines, field_mappings, params
 * - All copied records get new UUIDs
 * - Called AFTER the MOD-007 behavior_routines fork (which provides newRoutineId)
 */

import type {
  IntegrationRoutineRepository,
  IntegrationRoutineRow,
  FieldMappingRepository,
  FieldMappingRow,
  IntegrationParamRepository,
  IntegrationParamRow,
} from '../ports/repositories.js';
import type { UnitOfWork } from '../../../foundation/application/ports/repositories.js';
import type { HashUtilService } from '../../../foundation/application/ports/services.js';

export interface ForkIntegrationRoutineInput {
  readonly tenantId: string;
  readonly sourceRoutineId: string;
  readonly newRoutineId: string;
  readonly createdBy: string;
}

export interface ForkIntegrationRoutineOutput {
  readonly integrationRoutineId: string;
  readonly fieldMappingsCopied: number;
  readonly paramsCopied: number;
}

export class ForkIntegrationRoutineUseCase {
  constructor(
    private readonly routineRepo: IntegrationRoutineRepository,
    private readonly mappingRepo: FieldMappingRepository,
    private readonly paramRepo: IntegrationParamRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
  ) {}

  async execute(input: ForkIntegrationRoutineInput): Promise<ForkIntegrationRoutineOutput> {
    // Load source integration config
    const sourceConfig = await this.routineRepo.findByRoutineId(input.sourceRoutineId);
    if (!sourceConfig || sourceConfig.tenantId !== input.tenantId) {
      throw new Error(`Integration routine config not found for routine: ${input.sourceRoutineId}`);
    }

    // Load source mappings and params
    const sourceMappings = await this.mappingRepo.listByRoutine(input.sourceRoutineId);
    const sourceParams = await this.paramRepo.listByRoutine(input.sourceRoutineId);

    const now = new Date();
    const newConfigId = this.hashUtil.generateUuid();

    // Copy integration routine config
    const newConfig: IntegrationRoutineRow = {
      ...sourceConfig,
      id: newConfigId,
      routineId: input.newRoutineId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    // Copy field mappings with new IDs
    const newMappings: FieldMappingRow[] = sourceMappings.map((m) => ({
      ...m,
      id: this.hashUtil.generateUuid(),
      routineId: input.newRoutineId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }));

    // Copy params with new IDs
    const newParams: IntegrationParamRow[] = sourceParams.map((p) => ({
      ...p,
      id: this.hashUtil.generateUuid(),
      routineId: input.newRoutineId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }));

    await this.uow.transaction(async (tx) => {
      await this.routineRepo.create(newConfig, tx);

      if (newMappings.length > 0) {
        await this.mappingRepo.createMany(newMappings, tx);
      }

      if (newParams.length > 0) {
        await this.paramRepo.createMany(newParams, tx);
      }
    });

    return {
      integrationRoutineId: newConfigId,
      fieldMappingsCopied: newMappings.length,
      paramsCopied: newParams.length,
    };
  }
}
