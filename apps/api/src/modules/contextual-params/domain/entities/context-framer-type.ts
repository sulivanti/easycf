/**
 * @contract DATA-007 E-001
 *
 * Entity representing a framer type catalog entry.
 * Pre-defined types: OPERACAO, CLASSE_PRODUTO, TIPO_DOCUMENTO, CONTEXTO_PROCESSO.
 */

export interface ContextFramerTypeProps {
  id: string;
  tenantId: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ContextFramerType {
  constructor(private props: ContextFramerTypeProps) {}

  get id() {
    return this.props.id;
  }
  get tenantId() {
    return this.props.tenantId;
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
}
