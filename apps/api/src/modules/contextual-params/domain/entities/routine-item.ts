/**
 * @contract DATA-007 E-007, FR-009
 *
 * Entity representing a parameterizable item within a routine.
 * 7 item types × 8 actions. is_blocking gates MOD-006 transitions (FR-009).
 * ordem defines evaluation sequence in the engine step 3.
 */

import { type ItemType } from '../value-objects/item-type.js';
import { type ItemAction } from '../value-objects/item-action.js';

export interface RoutineItemProps {
  id: string;
  routineId: string;
  itemType: ItemType;
  targetFieldId: string | null;
  action: ItemAction;
  value: unknown;
  conditionExpr: string | null;
  validationMessage: string | null;
  isBlocking: boolean;
  ordem: number;
  createdAt: Date;
  updatedAt: Date;
}

export class RoutineItem {
  constructor(private props: RoutineItemProps) {}

  get id() {
    return this.props.id;
  }
  get routineId() {
    return this.props.routineId;
  }
  get itemType() {
    return this.props.itemType;
  }
  get targetFieldId() {
    return this.props.targetFieldId;
  }
  get action() {
    return this.props.action;
  }
  get value() {
    return this.props.value;
  }
  get conditionExpr() {
    return this.props.conditionExpr;
  }
  get validationMessage() {
    return this.props.validationMessage;
  }
  get isBlocking() {
    return this.props.isBlocking;
  }
  get ordem() {
    return this.props.ordem;
  }

  /** FR-009: Copy item with a new ID (used by fork) */
  toCopyProps(newId: string, newRoutineId: string): RoutineItemProps {
    const now = new Date();
    return {
      ...this.props,
      id: newId,
      routineId: newRoutineId,
      createdAt: now,
      updatedAt: now,
    };
  }
}
