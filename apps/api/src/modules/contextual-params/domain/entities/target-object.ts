/**
 * @contract BR-001, DATA-007 E-003
 *
 * Entity representing a parameterizable business object.
 * codigo is immutable after creation (BR-001).
 */

import { CodigoImmutableError } from '../errors/param-errors.js';

export interface TargetObjectProps {
  id: string;
  tenantId: string;
  codigo: string;
  nome: string;
  moduloEcf: string | null;
  descricao: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class TargetObject {
  constructor(private props: TargetObjectProps) {}

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
  get moduloEcf() {
    return this.props.moduloEcf;
  }
  get descricao() {
    return this.props.descricao;
  }

  /** BR-001: Reject changes to codigo */
  assertCodigoUnchanged(newCodigo: string): void {
    if (newCodigo !== this.props.codigo) {
      throw new CodigoImmutableError('target_object', this.props.id);
    }
  }
}
