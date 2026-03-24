/**
 * Entity: ApprovalRule
 * Defines an approval level within a control rule's approval chain.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ApproverType = 'ROLE' | 'USER' | 'SCOPE';

export interface ApprovalRuleProps {
  readonly id: string;
  readonly tenantId: string;
  readonly controlRuleId: string;
  readonly level: number;
  readonly approverType: ApproverType;
  readonly approverValue: string;
  readonly requiredScope: string | null;
  readonly allowSelfApprove: boolean;
  readonly timeoutMinutes: number | null;
  readonly escalationRuleId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------
export class ApprovalRule {
  private _props: ApprovalRuleProps;

  private constructor(props: ApprovalRuleProps) {
    this._props = props;
  }

  // -- Factory ---------------------------------------------------------------

  static create(props: ApprovalRuleProps): ApprovalRule {
    return new ApprovalRule(props);
  }

  static fromPersistence(props: ApprovalRuleProps): ApprovalRule {
    return new ApprovalRule(props);
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
  get level(): number {
    return this._props.level;
  }
  get approverType(): ApproverType {
    return this._props.approverType;
  }
  get approverValue(): string {
    return this._props.approverValue;
  }
  get requiredScope(): string | null {
    return this._props.requiredScope;
  }
  get allowSelfApprove(): boolean {
    return this._props.allowSelfApprove;
  }
  get timeoutMinutes(): number | null {
    return this._props.timeoutMinutes;
  }
  get escalationRuleId(): string | null {
    return this._props.escalationRuleId;
  }
  get createdAt(): Date {
    return this._props.createdAt;
  }
  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  // -- Invariants ------------------------------------------------------------

  /**
   * Checks if the requester can auto-approve at this level.
   * Requires: allowSelfApprove=true AND requester has the requiredScope.
   */
  canAutoApprove(requesterScopes: readonly string[]): boolean {
    if (!this._props.allowSelfApprove) return false;
    if (this._props.requiredScope === null) return true;
    return requesterScopes.includes(this._props.requiredScope);
  }

  /** Return plain props for persistence */
  toProps(): ApprovalRuleProps {
    return { ...this._props };
  }
}
