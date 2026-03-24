/**
 * @contract BR-001, DATA-000 §1
 *
 * Value Object: Email
 * Validates format and normalizes to lowercase.
 * Used by User entity for login identity.
 */

import { DomainValidationError } from '../errors/domain-errors.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTH = 255;

export class Email {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): Email {
    const trimmed = raw.trim().toLowerCase();

    if (trimmed.length === 0) {
      throw new DomainValidationError('Email é obrigatório.');
    }

    if (trimmed.length > MAX_LENGTH) {
      throw new DomainValidationError(`Email não pode exceder ${MAX_LENGTH} caracteres.`);
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      throw new DomainValidationError('Formato de e-mail inválido.');
    }

    return new Email(trimmed);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
