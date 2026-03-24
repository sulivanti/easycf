/**
 * @contract DATA-005 §2.7, BR-008
 *
 * Entity for Stage Transitions (directed graph edges).
 * Invariants: no self-transition, both stages must belong to same cycle (BR-008).
 */

import { CrossCycleTransitionError } from '../errors/cross-cycle-transition.error.js';

export interface StageTransitionProps {
  id: string;
  fromStageId: string;
  toStageId: string;
  nome: string;
  condicao: string | null;
  gateRequired: boolean;
  evidenceRequired: boolean;
  allowedRoles: string[] | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class StageTransition {
  constructor(private props: StageTransitionProps) {}

  get id() {
    return this.props.id;
  }
  get fromStageId() {
    return this.props.fromStageId;
  }
  get toStageId() {
    return this.props.toStageId;
  }
  get nome() {
    return this.props.nome;
  }
  get condicao() {
    return this.props.condicao;
  }
  get gateRequired() {
    return this.props.gateRequired;
  }
  get evidenceRequired() {
    return this.props.evidenceRequired;
  }
  get allowedRoles() {
    return this.props.allowedRoles;
  }

  /** BR-008: Validate same-cycle and no self-transition */
  static assertValid(
    fromStageId: string,
    fromCycleId: string,
    toStageId: string,
    toCycleId: string,
  ): void {
    if (fromStageId === toStageId) {
      throw new CrossCycleTransitionError(fromStageId, toStageId);
    }
    if (fromCycleId !== toCycleId) {
      throw new CrossCycleTransitionError(fromStageId, toStageId);
    }
  }

  /** ADR-003: Fork produces new props with remapped IDs */
  toForkProps(
    newId: string,
    newFromStageId: string,
    newToStageId: string,
    createdBy: string,
  ): StageTransitionProps {
    return {
      id: newId,
      fromStageId: newFromStageId,
      toStageId: newToStageId,
      nome: this.props.nome,
      condicao: this.props.condicao,
      gateRequired: this.props.gateRequired,
      evidenceRequired: this.props.evidenceRequired,
      allowedRoles: this.props.allowedRoles ? [...this.props.allowedRoles] : null,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
