/**
 * @contract FR-003, BR-001, DATA-007 E-003
 *
 * Use Case: Create a target object (parametrizable business entity).
 * codigo is auto-uppercased and immutable after creation (BR-001).
 */

import type {
  TargetObjectRepository,
  TargetObjectRecord,
  UnitOfWork,
} from '../ports/repositories.js';
import type { IdGeneratorService } from '../ports/services.js';

export interface CreateTargetObjectInput {
  readonly codigo: string;
  readonly nome: string;
  readonly moduloEcf?: string;
  readonly descricao?: string;
  readonly tenantId: string;
}

export interface CreateTargetObjectOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
}

export class CreateTargetObjectUseCase {
  constructor(
    private readonly targetObjectRepo: TargetObjectRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: CreateTargetObjectInput): Promise<CreateTargetObjectOutput> {
    const codigo = input.codigo.toUpperCase();
    const now = new Date();

    const record: TargetObjectRecord = {
      id: this.idGen.generate(),
      codigo,
      nome: input.nome,
      moduloEcf: input.moduloEcf ?? null,
      descricao: input.descricao ?? null,
      tenantId: input.tenantId,
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.uow.transaction(async (tx) => {
      return this.targetObjectRepo.create(record, tx);
    });

    return { id: created.id, codigo: created.codigo, nome: created.nome };
  }
}
