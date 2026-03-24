/**
 * Entity: ApprovalInstance
 * Represents an individual approval decision at a specific level
 * within a controlled movement's approval chain.
 */

import { InsufficientOpinionError } from '../errors/movement-approval-errors.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ApprovalInstanceStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'TIMEOUT' | 'ESCALATED';

export interface ApprovalInstanceProps {
  readonly id: string;
  readonly tenantId: string;
  readonly movementId: string;
  readonly level: number;
  readonly approverId: string | null;
  readonly status: ApprovalInstanceStatus;
  readonly opinion: string | null;
  readonly decidedAt: Date | null;
  readonly timeoutAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const MIN_OPINION_LENGTH = 10;

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------
export class ApprovalInstance {
  private _props: ApprovalInstanceProps;

  private constructor(props: ApprovalInstanceProps) {
    this._props = props;
  }

  // -- Factory ---------------------------------------------------------------

  static create(props: ApprovalInstanceProps): ApprovalInstance {
    return new ApprovalInstance(props);
  }

  static fromPersistence(props: ApprovalInstanceProps): ApprovalInstance {
    return new ApprovalInstance(props);
  }

  // -- Getters ---------------------------------------------------------------

  get id(): string {
    return this._props.id;
  }
  get tenantId(): string {
    return this._props.tenantId;
  }
  get movementId(): string {
    return this._props.movementId;
  }
  get level(): number {
    return this._props.level;
  }
  get approverId(): string | null {
    return this._props.approverId;
  }
  get status(): ApprovalInstanceStatus {
    return this._props.status;
  }
  get opinion(): string | null {
    return this._props.opinion;
  }
  get decidedAt(): Date | null {
    return this._props.decidedAt;
  }
  get timeoutAt(): Date | null {
    return this._props.timeoutAt;
  }
  get createdAt(): Date {
    return this._props.createdAt;
  }
  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  // -- Mutations (return new state) ------------------------------------------

  approve(approverId: string, opinion: string): ApprovalInstance {
    if (opinion.length < MIN_OPINION_LENGTH) {
      throw new InsufficientOpinionError();
    }

    return new ApprovalInstance({
      ...this._props,
      approverId,
      status: 'APPROVED',
      opinion,
      decidedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  reject(approverId: string, opinion: string): ApprovalInstance {
    if (opinion.length < MIN_OPINION_LENGTH) {
      throw new InsufficientOpinionError();
    }

    return new ApprovalInstance({
      ...this._props,
      approverId,
      status: 'REJECTED',
      opinion,
      decidedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  timeout(): ApprovalInstance {
    return new ApprovalInstance({
      ...this._props,
      status: 'TIMEOUT',
      decidedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  escalate(): ApprovalInstance {
    return new ApprovalInstance({
      ...this._props,
      status: 'ESCALATED',
      updatedAt: new Date(),
    });
  }

  /** Return plain props for persistence */
  toProps(): ApprovalInstanceProps {
    return { ...this._props };
  }
}
