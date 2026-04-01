/**
 * @contract BR-003, BR-011, DATA-007 E-005
 *
 * Entity representing an incidence rule that binds a framer to a target object.
 * UNIQUE constraint (framer_id, target_object_id) blocks config-time conflicts (BR-003).
 * No priority field — conflict resolution by restrictiveness only (BR-011, ADR-002).
 */

export interface IncidenceRuleProps {
  id: string;
  tenantId: string;
  framerId: string;
  targetObjectId: string;
  conditionExpr: string | null;
  incidenceType: 'OBR' | 'OPC' | 'AUTO';
  validFrom: Date;
  validUntil: Date | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class IncidenceRule {
  constructor(private props: IncidenceRuleProps) {}

  get id() {
    return this.props.id;
  }
  get tenantId() {
    return this.props.tenantId;
  }
  get framerId() {
    return this.props.framerId;
  }
  get targetObjectId() {
    return this.props.targetObjectId;
  }
  get conditionExpr() {
    return this.props.conditionExpr;
  }
  get incidenceType() {
    return this.props.incidenceType;
  }
  get validFrom() {
    return this.props.validFrom;
  }
  get validUntil() {
    return this.props.validUntil;
  }
  get status() {
    return this.props.status;
  }

  isActive(now: Date = new Date()): boolean {
    if (this.props.status !== 'ACTIVE') return false;
    if (now < this.props.validFrom) return false;
    if (this.props.validUntil !== null && now > this.props.validUntil) return false;
    return true;
  }
}
