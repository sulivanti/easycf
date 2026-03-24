/**
 * @contract DATA-005 §2.4, BR-007
 *
 * Entity for Process Gates (exit pre-conditions of a stage).
 * 4 types: APPROVAL, DOCUMENT, CHECKLIST, INFORMATIVE.
 * INFORMATIVE gates never block transitions (BR-007).
 */

import { type GateType, isBlockingGate } from '../value-objects/gate-type.js';

export interface GateProps {
  id: string;
  stageId: string;
  nome: string;
  descricao: string | null;
  gateType: GateType;
  required: boolean;
  ordem: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Gate {
  constructor(private props: GateProps) {}

  get id() {
    return this.props.id;
  }
  get stageId() {
    return this.props.stageId;
  }
  get nome() {
    return this.props.nome;
  }
  get descricao() {
    return this.props.descricao;
  }
  get gateType() {
    return this.props.gateType;
  }
  get required() {
    return this.props.required;
  }
  get ordem() {
    return this.props.ordem;
  }

  /** BR-007: INFORMATIVE gates never block, regardless of required flag */
  isBlocking(): boolean {
    return this.props.required && isBlockingGate(this.props.gateType);
  }

  updateOrdem(ordem: number): void {
    this.props.ordem = ordem;
    this.props.updatedAt = new Date();
  }

  /** ADR-003: Fork produces new props with remapped IDs */
  toForkProps(newId: string, newStageId: string, createdBy: string): GateProps {
    return {
      id: newId,
      stageId: newStageId,
      nome: this.props.nome,
      descricao: this.props.descricao,
      gateType: this.props.gateType,
      required: this.props.required,
      ordem: this.props.ordem,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
