/**
 * @contract FR-007, BR-013, BR-017, BR-018, DATA-002
 *
 * Use Case: Create Department
 * - Per-tenant uniqueness of codigo (BR-013)
 * - Hex color validation (BR-017)
 * - Idempotency-Key support (ADR-004)
 * - Soft limit warning header (BR-018)
 */

import { Department } from '../../domain/entities/department.entity.js';
import { createDepartmentEvent } from '../../domain/events/department-events.js';
import { DuplicateDepartmentCodigoError } from '../../domain/errors/department-errors.js';
import type { DepartmentRepository } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type {
  IdempotencyService,
  HashUtilService,
} from '../../../foundation/application/ports/services.js';

export interface CreateDepartmentInput {
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao?: string | null;
  readonly cor?: string | null;
  readonly createdBy: string | null;
  readonly correlationId: string;
  readonly idempotencyKey?: string;
}

export interface CreateDepartmentOutput {
  readonly id: string;
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly status: string;
  readonly cor: string | null;
  readonly createdBy: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly limitWarning: string | null;
}

const SOFT_LIMIT = 100;
const SOFT_LIMIT_THRESHOLD = 0.8;

export class CreateDepartmentUseCase {
  constructor(
    private readonly deptRepo: DepartmentRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
    private readonly idempotency: IdempotencyService,
  ) {}

  async execute(input: CreateDepartmentInput): Promise<CreateDepartmentOutput> {
    // ADR-004: Idempotency check
    if (input.idempotencyKey) {
      const cached = await this.idempotency.check<CreateDepartmentOutput>(input.idempotencyKey);
      if (cached) return cached.value;
    }

    // BR-013: Codigo uniqueness per tenant
    const existing = await this.deptRepo.findByCodigo(input.tenantId, input.codigo.trim());
    if (existing) {
      throw new DuplicateDepartmentCodigoError(input.codigo.trim());
    }

    const id = this.hashUtil.generateUuid();

    // BR-017: Cor validated inside entity factory
    const department = Department.create({
      id,
      tenantId: input.tenantId,
      codigo: input.codigo,
      nome: input.nome,
      descricao: input.descricao,
      cor: input.cor,
      createdBy: input.createdBy,
    });

    // BR-018: Soft limit warning
    const activeCount = await this.deptRepo.countActiveByTenant(input.tenantId);
    const newCount = activeCount + 1;
    let limitWarning: string | null = null;

    if (newCount > SOFT_LIMIT) {
      limitWarning = `departments_count=${newCount}, soft_limit=${SOFT_LIMIT}, threshold=${Math.round(SOFT_LIMIT_THRESHOLD * 100)}%, exceeded=true`;
    } else if (newCount > SOFT_LIMIT * SOFT_LIMIT_THRESHOLD) {
      limitWarning = `departments_count=${newCount}, soft_limit=${SOFT_LIMIT}, threshold=${Math.round(SOFT_LIMIT_THRESHOLD * 100)}%`;
    }

    await this.uow.transaction(async (tx) => {
      await this.deptRepo.create(department.toProps(), tx);

      await this.eventRepo.create(
        createDepartmentEvent({
          tenantId: input.tenantId,
          entityId: id,
          eventType: 'org.dept_created',
          payload: {
            id,
            tenant_id: input.tenantId,
            codigo: department.codigo,
            nome: department.nome,
            cor: department.cor,
            status: department.status,
            created_by: department.createdBy,
            ...(department.descricao ? { descricao: department.descricao } : {}),
          },
          correlationId: input.correlationId,
          createdBy: input.createdBy,
        }),
        tx,
      );
    });

    const output: CreateDepartmentOutput = {
      id,
      tenantId: department.tenantId,
      codigo: department.codigo,
      nome: department.nome,
      descricao: department.descricao,
      status: department.status,
      cor: department.cor,
      createdBy: department.createdBy,
      createdAt: department.createdAt.toISOString(),
      updatedAt: department.updatedAt.toISOString(),
      limitWarning,
    };

    if (input.idempotencyKey) {
      await this.idempotency.store(input.idempotencyKey, output, 60);
    }

    return output;
  }
}
