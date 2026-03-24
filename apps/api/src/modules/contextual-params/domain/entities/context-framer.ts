/**
 * @contract BR-001, BR-002, DATA-007 E-002
 *
 * Entity representing a context framer with validity period.
 * codigo is immutable after creation (BR-001).
 * Framers with valid_until in the past are expired by background job (BR-002).
 */

import { type FramerStatus } from '../value-objects/framer-status.js';
import { CodigoImmutableError } from '../errors/param-errors.js';

export interface ContextFramerProps {
  id: string;
  tenantId: string;
  codigo: string;
  nome: string;
  framerTypeId: string;
  status: FramerStatus;
  version: number;
  validFrom: Date;
  validUntil: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class ContextFramer {
  constructor(private props: ContextFramerProps) {}

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
  get framerTypeId() {
    return this.props.framerTypeId;
  }
  get status() {
    return this.props.status;
  }
  get version() {
    return this.props.version;
  }
  get validFrom() {
    return this.props.validFrom;
  }
  get validUntil() {
    return this.props.validUntil;
  }

  /** BR-001: Reject changes to codigo */
  assertCodigoUnchanged(newCodigo: string): void {
    if (newCodigo !== this.props.codigo) {
      throw new CodigoImmutableError('context_framer', this.props.id);
    }
  }

  /** BR-002: Check if framer has expired */
  isExpired(now: Date = new Date()): boolean {
    return this.props.validUntil !== null && this.props.validUntil < now;
  }

  /** BR-002: Expire the framer (set INACTIVE) */
  expire(): void {
    this.props.status = 'INACTIVE';
    this.props.updatedAt = new Date();
  }

  isActive(): boolean {
    return this.props.status === 'ACTIVE' && !this.isExpired();
  }
}
