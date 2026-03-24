/**
 * Aggregate Root: ControlledMovement
 * Encapsulates the lifecycle of a movement under approval control.
 * Enforces status transitions and segregation invariants.
 */

import type { MovementStatus } from '../value-objects/movement-status.vo.js';
import { isValidMovementTransition } from '../value-objects/movement-status.vo.js';
import type { OriginType } from '../value-objects/origin-type.vo.js';
import {
  InvalidMovementTransitionError,
  SegregationViolationError,
  InsufficientJustificationError,
  MovementNotPendingError,
} from '../errors/movement-approval-errors.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ControlledMovementProps {
  readonly id: string;
  readonly tenantId: string;
  readonly controlRuleId: string;
  readonly codigo: string;
  readonly requesterId: string;
  readonly requesterOrigin: OriginType;
  readonly objectType: string;
  readonly objectId: string;
  readonly operationType: string;
  readonly operationPayload: Record<string, unknown>;
  readonly caseId: string | null;
  readonly currentLevel: number;
  readonly totalLevels: number;
  readonly status: MovementStatus;
  readonly idempotencyKey: string;
  readonly errorMessage: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const MIN_JUSTIFICATION_LENGTH = 20;

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------
export class ControlledMovement {
  private _props: ControlledMovementProps;

  private constructor(props: ControlledMovementProps) {
    this._props = props;
  }

  // -- Factory ---------------------------------------------------------------

  static create(props: ControlledMovementProps): ControlledMovement {
    return new ControlledMovement(props);
  }

  static fromPersistence(props: ControlledMovementProps): ControlledMovement {
    return new ControlledMovement(props);
  }

  // -- Getters ---------------------------------------------------------------

  get id(): string {
    return this._props.id;
  }
  get tenantId(): string {
    return this._props.tenantId;
  }
  get controlRuleId(): string {
    return this._props.controlRuleId;
  }
  get codigo(): string {
    return this._props.codigo;
  }
  get requesterId(): string {
    return this._props.requesterId;
  }
  get requesterOrigin(): OriginType {
    return this._props.requesterOrigin;
  }
  get objectType(): string {
    return this._props.objectType;
  }
  get objectId(): string {
    return this._props.objectId;
  }
  get operationType(): string {
    return this._props.operationType;
  }
  get operationPayload(): Record<string, unknown> {
    return this._props.operationPayload;
  }
  get caseId(): string | null {
    return this._props.caseId;
  }
  get currentLevel(): number {
    return this._props.currentLevel;
  }
  get totalLevels(): number {
    return this._props.totalLevels;
  }
  get status(): MovementStatus {
    return this._props.status;
  }
  get idempotencyKey(): string {
    return this._props.idempotencyKey;
  }
  get errorMessage(): string | null {
    return this._props.errorMessage;
  }
  get createdAt(): Date {
    return this._props.createdAt;
  }
  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  // -- Private helpers -------------------------------------------------------

  private transition(to: MovementStatus): ControlledMovement {
    if (!isValidMovementTransition(this._props.status, to)) {
      throw new InvalidMovementTransitionError(this._props.status, to);
    }
    return new ControlledMovement({
      ...this._props,
      status: to,
      updatedAt: new Date(),
    });
  }

  private assertPending(): void {
    if (this._props.status !== 'PENDING_APPROVAL') {
      throw new MovementNotPendingError(this._props.id);
    }
  }

  // -- Invariants ------------------------------------------------------------

  /**
   * Segregation check: actorId !== requesterId (unless auto-approve).
   * @throws SegregationViolationError
   */
  assertCanDecide(actorId: string): void {
    if (actorId === this._props.requesterId) {
      throw new SegregationViolationError();
    }
  }

  // -- Mutations (return new state) ------------------------------------------

  /** Transitions to APPROVED when current level is final */
  approve(): ControlledMovement {
    this.assertPending();
    return this.transition('APPROVED');
  }

  /** Transitions to AUTO_APPROVED */
  autoApprove(): ControlledMovement {
    this.assertPending();
    return this.transition('AUTO_APPROVED');
  }

  /** Transitions to REJECTED */
  reject(): ControlledMovement {
    this.assertPending();
    return this.transition('REJECTED');
  }

  /** Cancel — only if PENDING_APPROVAL and actor is requester */
  cancel(actorId: string): ControlledMovement {
    this.assertPending();
    if (actorId !== this._props.requesterId) {
      throw new SegregationViolationError();
    }
    return this.transition('CANCELLED');
  }

  /** Override — requires justification >= 20 chars */
  override(actorId: string, justification: string): ControlledMovement {
    this.assertPending();
    if (justification.length < MIN_JUSTIFICATION_LENGTH) {
      throw new InsufficientJustificationError();
    }
    return this.transition('OVERRIDDEN');
  }

  /** Transitions APPROVED|OVERRIDDEN to EXECUTED */
  markExecuted(): ControlledMovement {
    return this.transition('EXECUTED');
  }

  /** Transitions APPROVED|OVERRIDDEN to FAILED */
  markFailed(errorMessage: string): ControlledMovement {
    const moved = this.transition('FAILED');
    return new ControlledMovement({
      ...moved._props,
      errorMessage,
    });
  }

  /** Increments currentLevel */
  advanceLevel(): ControlledMovement {
    return new ControlledMovement({
      ...this._props,
      currentLevel: this._props.currentLevel + 1,
      updatedAt: new Date(),
    });
  }

  /** Return plain props for persistence */
  toProps(): ControlledMovementProps {
    return { ...this._props };
  }
}
