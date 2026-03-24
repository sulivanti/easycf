/**
 * Entity: MovementControlRule
 * Defines when an operation requires approval control.
 * Matches operations by objectType, operationType, and origin.
 */

import type { OriginType } from '../value-objects/origin-type.vo.js';
import type { ApprovalCriteria } from '../value-objects/approval-criteria.vo.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ControlRuleStatus = 'ACTIVE' | 'INACTIVE';

export interface MovementControlRuleProps {
  readonly id: string;
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly objectType: string;
  readonly operationType: string;
  readonly originTypes: readonly OriginType[];
  readonly criteriaType: ApprovalCriteria;
  readonly valueThreshold: number | null;
  readonly priority: number;
  readonly status: ControlRuleStatus;
  readonly validFrom: Date;
  readonly validUntil: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------
export class MovementControlRule {
  private _props: MovementControlRuleProps;

  private constructor(props: MovementControlRuleProps) {
    this._props = props;
  }

  // -- Factory ---------------------------------------------------------------

  static create(props: MovementControlRuleProps): MovementControlRule {
    return new MovementControlRule(props);
  }

  static fromPersistence(props: MovementControlRuleProps): MovementControlRule {
    return new MovementControlRule(props);
  }

  // -- Getters ---------------------------------------------------------------

  get id(): string {
    return this._props.id;
  }
  get tenantId(): string {
    return this._props.tenantId;
  }
  get codigo(): string {
    return this._props.codigo;
  }
  get nome(): string {
    return this._props.nome;
  }
  get descricao(): string | null {
    return this._props.descricao;
  }
  get objectType(): string {
    return this._props.objectType;
  }
  get operationType(): string {
    return this._props.operationType;
  }
  get originTypes(): readonly OriginType[] {
    return this._props.originTypes;
  }
  get criteriaType(): ApprovalCriteria {
    return this._props.criteriaType;
  }
  get valueThreshold(): number | null {
    return this._props.valueThreshold;
  }
  get priority(): number {
    return this._props.priority;
  }
  get status(): ControlRuleStatus {
    return this._props.status;
  }
  get validFrom(): Date {
    return this._props.validFrom;
  }
  get validUntil(): Date | null {
    return this._props.validUntil;
  }
  get createdAt(): Date {
    return this._props.createdAt;
  }
  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  // -- Invariants ------------------------------------------------------------

  isActive(): boolean {
    return this._props.status === 'ACTIVE';
  }

  isValid(now: Date): boolean {
    if (this._props.validFrom > now) return false;
    if (this._props.validUntil !== null && this._props.validUntil < now) {
      return false;
    }
    return true;
  }

  matchesOperation(objectType: string, operationType: string, origin: OriginType): boolean {
    return (
      this._props.objectType === objectType &&
      this._props.operationType === operationType &&
      this._props.originTypes.includes(origin)
    );
  }

  // -- Mutations (return new state) ------------------------------------------

  activate(): MovementControlRule {
    return new MovementControlRule({
      ...this._props,
      status: 'ACTIVE',
      updatedAt: new Date(),
    });
  }

  deactivate(): MovementControlRule {
    return new MovementControlRule({
      ...this._props,
      status: 'INACTIVE',
      updatedAt: new Date(),
    });
  }

  /** Return plain props for persistence */
  toProps(): MovementControlRuleProps {
    return { ...this._props };
  }
}
