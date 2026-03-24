/**
 * @contract DATA-005 §2.2, BR-006
 *
 * Entity for Process Macro-stages.
 * Grouped phases within a cycle; stages are children of macro-stages.
 */

export interface MacroStageProps {
  id: string;
  cycleId: string;
  codigo: string;
  nome: string;
  ordem: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MacroStage {
  constructor(private props: MacroStageProps) {}

  get id() {
    return this.props.id;
  }
  get cycleId() {
    return this.props.cycleId;
  }
  get codigo() {
    return this.props.codigo;
  }
  get nome() {
    return this.props.nome;
  }
  get ordem() {
    return this.props.ordem;
  }
  get createdBy() {
    return this.props.createdBy;
  }

  updateNome(nome: string): void {
    this.props.nome = nome;
    this.props.updatedAt = new Date();
  }

  updateOrdem(ordem: number): void {
    this.props.ordem = ordem;
    this.props.updatedAt = new Date();
  }

  /** ADR-003: Fork produces new props with remapped IDs */
  toForkProps(newId: string, newCycleId: string, createdBy: string): MacroStageProps {
    return {
      id: newId,
      cycleId: newCycleId,
      codigo: this.props.codigo,
      nome: this.props.nome,
      ordem: this.props.ordem,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
