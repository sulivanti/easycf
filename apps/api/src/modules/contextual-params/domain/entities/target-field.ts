/**
 * @contract DATA-007 E-004, FR-003
 *
 * Entity representing an individual field of a target object.
 * is_system fields cannot be edited by admin (FR-003).
 */

export interface TargetFieldProps {
  id: string;
  targetObjectId: string;
  tenantId: string;
  fieldKey: string;
  fieldLabel: string | null;
  fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'BOOLEAN' | 'FILE';
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class TargetField {
  constructor(private props: TargetFieldProps) {}

  get id() {
    return this.props.id;
  }
  get targetObjectId() {
    return this.props.targetObjectId;
  }
  get tenantId() {
    return this.props.tenantId;
  }
  get fieldKey() {
    return this.props.fieldKey;
  }
  get fieldLabel() {
    return this.props.fieldLabel;
  }
  get fieldType() {
    return this.props.fieldType;
  }
  get isSystem() {
    return this.props.isSystem;
  }
}
