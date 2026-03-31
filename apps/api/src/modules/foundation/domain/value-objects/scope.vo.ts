/**
 * @contract BR-005, DOC-FND-000 §2.1
 *
 * Value Object: Scope
 * Validates the canonical permission format: `dominio:entidade:acao` (3 segments)
 * or `dominio:acao` (2 segments, retrocompatible).
 * Regex: ^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$
 */

import { DomainValidationError } from '../errors/domain-errors.js';

const SCOPE_REGEX = /^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$/;
const MAX_LENGTH = 100;

export class Scope {
  readonly value: string;
  readonly segments: readonly string[];

  private constructor(value: string) {
    this.value = value;
    this.segments = value.split(':');
  }

  static create(raw: string): Scope {
    // Normalize: convert hyphens to underscores for legacy scopes (FR-000-C10)
    const trimmed = raw.trim().replace(/-/g, '_');

    if (trimmed.length === 0) {
      throw new DomainValidationError('Scope é obrigatório.');
    }

    if (trimmed.length > MAX_LENGTH) {
      throw new DomainValidationError(`Scope não pode exceder ${MAX_LENGTH} caracteres.`);
    }

    if (!SCOPE_REGEX.test(trimmed)) {
      throw new DomainValidationError(
        `Scope "${trimmed}" não segue o formato canônico. ` +
          `Esperado: dominio:entidade:acao (regex: ${SCOPE_REGEX.source})`,
      );
    }

    return new Scope(trimmed);
  }

  /** Domain segment (first part, e.g. "users") */
  get domain(): string {
    return this.segments[0]!;
  }

  /** Entity segment (second part when 3-seg, e.g. "user") */
  get entity(): string | undefined {
    return this.segments.length === 3 ? this.segments[1] : undefined;
  }

  /** Action segment (last part, e.g. "read") */
  get action(): string {
    return this.segments[this.segments.length - 1]!;
  }

  /** Whether this is the canonical 3-segment format */
  get isCanonical(): boolean {
    return this.segments.length === 3;
  }

  equals(other: Scope): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
