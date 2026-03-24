/**
 * @contract BR-001, BR-003, BR-004, BR-010, DATA-005 §2.1
 *
 * Aggregate Root for Process Cycles.
 * Controls the state machine (DRAFT → PUBLISHED → DEPRECATED)
 * and enforces invariants on the cycle and its children.
 */

import { type CycleStatus, assertTransition } from '../value-objects/cycle-status.js';
import { CycleImmutableError } from '../errors/cycle-immutable.error.js';

export interface ProcessCycleProps {
  id: string;
  tenantId: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  version: number;
  status: CycleStatus;
  parentCycleId: string | null;
  publishedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ProcessCycle {
  constructor(private props: ProcessCycleProps) {}

  get id() {
    return this.props.id;
  }
  get tenantId() {
    return this.props.tenantId;
  }
  get codigo() {
    return this.props.codigo;
  }
  get nome() {
    return this.props.nome;
  }
  get descricao() {
    return this.props.descricao;
  }
  get version() {
    return this.props.version;
  }
  get status() {
    return this.props.status;
  }
  get parentCycleId() {
    return this.props.parentCycleId;
  }
  get publishedAt() {
    return this.props.publishedAt;
  }
  get createdBy() {
    return this.props.createdBy;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  /** BR-001: PUBLISHED cycles are immutable */
  assertMutable(): void {
    if (this.props.status === 'PUBLISHED') {
      throw new CycleImmutableError(this.props.id);
    }
  }

  /** BR-010: Transition the cycle status (irreversible) */
  transitionTo(newStatus: CycleStatus): void {
    assertTransition(this.props.status, newStatus);
    this.props.status = newStatus;
    this.props.updatedAt = new Date();

    if (newStatus === 'PUBLISHED') {
      this.props.publishedAt = new Date();
    }
  }

  /** BR-003: Publishing requires at least one is_initial stage */
  assertCanPublish(hasInitialStage: boolean): void {
    if (!hasInitialStage) {
      throw new Error(
        `Cycle ${this.props.id} cannot be published without an initial stage (BR-003).`,
      );
    }
  }

  /** BR-004: Fork creates a new DRAFT version with incremented version */
  toForkProps(newId: string, createdBy: string): ProcessCycleProps {
    return {
      id: newId,
      tenantId: this.props.tenantId,
      codigo: this.props.codigo,
      nome: this.props.nome,
      descricao: this.props.descricao,
      version: this.props.version + 1,
      status: 'DRAFT',
      parentCycleId: this.props.id,
      publishedAt: null,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  isDraft(): boolean {
    return this.props.status === 'DRAFT';
  }

  isPublished(): boolean {
    return this.props.status === 'PUBLISHED';
  }

  isDeprecated(): boolean {
    return this.props.status === 'DEPRECATED';
  }
}
