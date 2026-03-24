/**
 * @contract DATA-005 §2.3, BR-002, BR-006, ADR-001
 *
 * Entity for Process Stages.
 * Contains canvas positioning for the visual editor (UX-PROC-001).
 * cycle_id is denormalized from macro_stage (ADR-001).
 */

export interface StageProps {
  id: string;
  macroStageId: string;
  cycleId: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  ordem: number;
  isInitial: boolean;
  isTerminal: boolean;
  canvasX: number | null;
  canvasY: number | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Stage {
  constructor(private props: StageProps) {}

  get id() {
    return this.props.id;
  }
  get macroStageId() {
    return this.props.macroStageId;
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
  get descricao() {
    return this.props.descricao;
  }
  get ordem() {
    return this.props.ordem;
  }
  get isInitial() {
    return this.props.isInitial;
  }
  get isTerminal() {
    return this.props.isTerminal;
  }
  get canvasX() {
    return this.props.canvasX;
  }
  get canvasY() {
    return this.props.canvasY;
  }

  updateNome(nome: string): void {
    this.props.nome = nome;
    this.props.updatedAt = new Date();
  }

  updateDescricao(descricao: string | null): void {
    this.props.descricao = descricao;
    this.props.updatedAt = new Date();
  }

  updateOrdem(ordem: number): void {
    this.props.ordem = ordem;
    this.props.updatedAt = new Date();
  }

  setInitial(value: boolean): void {
    this.props.isInitial = value;
    this.props.updatedAt = new Date();
  }

  setTerminal(value: boolean): void {
    this.props.isTerminal = value;
    this.props.updatedAt = new Date();
  }

  updateCanvasPosition(x: number, y: number): void {
    this.props.canvasX = x;
    this.props.canvasY = y;
    this.props.updatedAt = new Date();
  }

  /** ADR-003: Fork produces new props with remapped IDs */
  toForkProps(
    newId: string,
    newMacroStageId: string,
    newCycleId: string,
    createdBy: string,
  ): StageProps {
    return {
      id: newId,
      macroStageId: newMacroStageId,
      cycleId: newCycleId,
      codigo: this.props.codigo,
      nome: this.props.nome,
      descricao: this.props.descricao,
      ordem: this.props.ordem,
      isInitial: this.props.isInitial,
      isTerminal: this.props.isTerminal,
      canvasX: this.props.canvasX,
      canvasY: this.props.canvasY,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
