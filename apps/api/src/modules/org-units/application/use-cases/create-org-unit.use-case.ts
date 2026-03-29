/**
 * @contract FR-001, BR-001, BR-002, BR-003, BR-004, BR-008, BR-011, BR-012, DATA-003
 *
 * Use Case: Create Organizational Unit (N1–N4)
 * - Nivel derived from parent (BR-002)
 * - Loop prevention via CTE (BR-004)
 * - Idempotency-Key support (BR-012)
 * - Soft limit warning header (FR-001)
 */

import { OrgUnit } from '../../domain/entities/org-unit.entity.js';
import type { OrgUnitNivel } from '../../domain/entities/org-unit.entity.js';
import { createOrgUnitEvent } from '../../domain/events/org-unit-events.js';
import {
  DuplicateCodigoError,
  MaxLevelExceededError,
} from '../../domain/errors/org-unit-errors.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { OrgUnitRepository } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type {
  IdempotencyService,
  HashUtilService,
} from '../../../foundation/application/ports/services.js';

export interface CreateOrgUnitInput {
  readonly codigo: string;
  readonly nome: string;
  readonly descricao?: string | null;
  readonly parentId?: string | null;
  readonly createdBy: string | null;
  readonly correlationId: string;
  readonly idempotencyKey?: string;
  // Campos cadastrais (FR-001-M01 / DATA-001-M01)
  readonly cnpj?: string;
  readonly razaoSocial?: string;
  readonly filial?: string;
  readonly responsavel?: string;
  readonly telefone?: string;
  readonly emailContato?: string;
}

export interface CreateOrgUnitOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly nivel: OrgUnitNivel;
  readonly parentId: string | null;
  readonly status: string;
  readonly cnpj: string | null;
  readonly razaoSocial: string | null;
  readonly filial: string | null;
  readonly responsavel: string | null;
  readonly telefone: string | null;
  readonly emailContato: string | null;
  /** Soft limit warning message, if applicable */
  readonly limitWarning: string | null;
}

const SOFT_LIMIT = 500;
const SOFT_LIMIT_THRESHOLD = 0.8;

export class CreateOrgUnitUseCase {
  constructor(
    private readonly orgUnitRepo: OrgUnitRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
    private readonly idempotency: IdempotencyService,
  ) {}

  async execute(input: CreateOrgUnitInput): Promise<CreateOrgUnitOutput> {
    // BR-012: Idempotency check
    if (input.idempotencyKey) {
      const cached = await this.idempotency.check<CreateOrgUnitOutput>(input.idempotencyKey);
      if (cached) return cached.value;
    }

    // BR-008: Global codigo uniqueness
    const existing = await this.orgUnitRepo.findByCodigo(input.codigo.trim().toUpperCase());
    if (existing) {
      throw new DuplicateCodigoError(input.codigo.trim().toUpperCase());
    }

    // BR-002: Resolve parent nivel
    let parentNivel: OrgUnitNivel | null = null;
    const parentId = input.parentId ?? null;

    if (parentId) {
      const parent = await this.orgUnitRepo.findById(parentId);
      if (!parent) {
        throw new EntityNotFoundError('OrgUnit (parent)', parentId);
      }
      // BR-011: Parent must not be N4 (max level)
      if (parent.nivel === 4) {
        throw new MaxLevelExceededError();
      }
      parentNivel = parent.nivel as OrgUnitNivel;
    }

    const id = this.hashUtil.generateUuid();

    const orgUnit = OrgUnit.create({
      id,
      codigo: input.codigo,
      nome: input.nome,
      descricao: input.descricao,
      parentId,
      parentNivel,
      createdBy: input.createdBy,
      cnpj: input.cnpj,
      razaoSocial: input.razaoSocial,
      filial: input.filial,
      responsavel: input.responsavel,
      telefone: input.telefone,
      emailContato: input.emailContato,
    });

    // FR-001: Soft limit warning
    const activeCount = await this.orgUnitRepo.countActive();
    const newCount = activeCount + 1;
    let limitWarning: string | null = null;

    if (newCount > SOFT_LIMIT) {
      limitWarning = `org_units_count=${newCount}, soft_limit=${SOFT_LIMIT}, threshold=${Math.round(SOFT_LIMIT_THRESHOLD * 100)}%, exceeded=true`;
    } else if (newCount > SOFT_LIMIT * SOFT_LIMIT_THRESHOLD) {
      limitWarning = `org_units_count=${newCount}, soft_limit=${SOFT_LIMIT}, threshold=${Math.round(SOFT_LIMIT_THRESHOLD * 100)}%`;
    }

    await this.uow.transaction(async (tx) => {
      await this.orgUnitRepo.create(orgUnit.toProps(), tx);

      await this.eventRepo.create(
        createOrgUnitEvent({
          entityType: 'org_unit',
          entityId: id,
          eventType: 'org.unit_created',
          payload: {
            id,
            codigo: orgUnit.codigo,
            nome: orgUnit.nome,
            nivel: orgUnit.nivel,
            parent_id: orgUnit.parentId,
            status: orgUnit.status,
            created_by: orgUnit.createdBy,
            ...(orgUnit.descricao ? { descricao: orgUnit.descricao } : {}),
          },
          correlationId: input.correlationId,
          createdBy: input.createdBy,
        }),
        tx,
      );
    });

    const output: CreateOrgUnitOutput = {
      id,
      codigo: orgUnit.codigo,
      nome: orgUnit.nome,
      descricao: orgUnit.descricao,
      nivel: orgUnit.nivel,
      parentId: orgUnit.parentId,
      status: orgUnit.status,
      cnpj: orgUnit.cnpj,
      razaoSocial: orgUnit.razaoSocial,
      filial: orgUnit.filial,
      responsavel: orgUnit.responsavel,
      telefone: orgUnit.telefone,
      emailContato: orgUnit.emailContato,
      limitWarning,
    };

    // BR-012: Store idempotency result
    if (input.idempotencyKey) {
      await this.idempotency.store(input.idempotencyKey, output, 60);
    }

    return output;
  }
}
