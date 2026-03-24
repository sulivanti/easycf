/**
 * @contract BR-005, BR-006, BR-007, BR-008, BR-012, DATA-007 E-006
 *
 * Aggregate Root for Behavior Routines.
 * Controls the state machine (DRAFT → PUBLISHED → DEPRECATED)
 * and enforces invariants: immutability, publication gates, fork,
 * link eligibility.
 */

import { type RoutineStatus, assertTransition } from '../value-objects/routine-status.js';
import {
  RoutineImmutableError,
  RoutineNoItemsError,
  RoutineDraftLinkError,
  RoutineDeprecatedLinkError,
} from '../errors/param-errors.js';

export interface BehaviorRoutineProps {
  id: string;
  tenantId: string;
  codigo: string;
  nome: string;
  routineType: 'BEHAVIOR' | 'INTEGRATION';
  version: number;
  status: RoutineStatus;
  parentRoutineId: string | null;
  publishedAt: Date | null;
  approvedBy: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class BehaviorRoutine {
  constructor(private props: BehaviorRoutineProps) {}

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
  get routineType() {
    return this.props.routineType;
  }
  get version() {
    return this.props.version;
  }
  get status() {
    return this.props.status;
  }
  get parentRoutineId() {
    return this.props.parentRoutineId;
  }
  get publishedAt() {
    return this.props.publishedAt;
  }
  get approvedBy() {
    return this.props.approvedBy;
  }
  get createdBy() {
    return this.props.createdBy;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  /** BR-005: PUBLISHED routines are immutable */
  assertMutable(): void {
    if (this.props.status === 'PUBLISHED') {
      throw new RoutineImmutableError(this.props.id);
    }
  }

  /** BR-005: Transition the routine status */
  transitionTo(newStatus: RoutineStatus): void {
    assertTransition(this.props.status, newStatus);
    this.props.status = newStatus;
    this.props.updatedAt = new Date();

    if (newStatus === 'PUBLISHED') {
      this.props.publishedAt = new Date();
    }
  }

  /** BR-006: Publishing requires at least 1 item */
  assertCanPublish(itemCount: number): void {
    if (itemCount < 1) {
      throw new RoutineNoItemsError(this.props.id);
    }
  }

  /** BR-007 + BR-012: Can this routine be linked to an incidence rule? */
  assertLinkable(): void {
    if (this.props.status === 'DRAFT') {
      throw new RoutineDraftLinkError(this.props.id);
    }
    if (this.props.status === 'DEPRECATED') {
      throw new RoutineDeprecatedLinkError(this.props.id);
    }
  }

  /** BR-008: Fork creates a new DRAFT version with incremented version */
  assertCanFork(): void {
    if (this.props.status !== 'PUBLISHED') {
      throw new Error(
        `Routine ${this.props.id} must be PUBLISHED to fork. Current: ${this.props.status}`,
      );
    }
  }

  /** BR-008: Produce fork props (new DRAFT with parent ref) */
  toForkProps(newId: string, createdBy: string): BehaviorRoutineProps {
    return {
      id: newId,
      tenantId: this.props.tenantId,
      codigo: this.props.codigo,
      nome: this.props.nome,
      routineType: this.props.routineType,
      version: this.props.version + 1,
      status: 'DRAFT',
      parentRoutineId: this.props.id,
      publishedAt: null,
      approvedBy: null,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
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
