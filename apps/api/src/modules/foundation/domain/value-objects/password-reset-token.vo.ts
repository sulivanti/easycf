/**
 * @contract BR-013
 *
 * Value Object: PasswordResetToken
 * UUID v4 token, stored as SHA-256 hash, single-use, TTL 1 hour.
 * The plain token is sent to the user; only the hash is persisted.
 */

import { DomainValidationError } from '../errors/domain-errors.js';

const TTL_MS = 3_600_000; // 1 hour in milliseconds

export interface PasswordResetTokenProps {
  readonly tokenHash: string;
  readonly userId: string;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly usedAt: Date | null;
}

export class PasswordResetToken {
  readonly tokenHash: string;
  readonly userId: string;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly usedAt: Date | null;

  private constructor(props: PasswordResetTokenProps) {
    this.tokenHash = props.tokenHash;
    this.userId = props.userId;
    this.createdAt = props.createdAt;
    this.expiresAt = props.expiresAt;
    this.usedAt = props.usedAt;
  }

  /**
   * Creates a new token entry from a pre-computed SHA-256 hash.
   * The caller is responsible for generating UUID + hashing (infrastructure concern).
   */
  static create(tokenHash: string, userId: string): PasswordResetToken {
    if (!tokenHash || tokenHash.length === 0) {
      throw new DomainValidationError('Token hash é obrigatório.');
    }

    if (!userId || userId.length === 0) {
      throw new DomainValidationError('userId é obrigatório.');
    }

    const now = new Date();
    return new PasswordResetToken({
      tokenHash,
      userId,
      createdAt: now,
      expiresAt: new Date(now.getTime() + TTL_MS),
      usedAt: null,
    });
  }

  /** Reconstitutes from persistence */
  static fromPersistence(props: PasswordResetTokenProps): PasswordResetToken {
    return new PasswordResetToken(props);
  }

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isUsed(): boolean {
    return this.usedAt !== null;
  }

  get isValid(): boolean {
    return !this.isExpired && !this.isUsed;
  }

  /**
   * Marks the token as consumed. Returns a new instance (immutability).
   * @throws DomainValidationError if token is expired or already used.
   */
  consume(): PasswordResetToken {
    if (this.isExpired) {
      throw new DomainValidationError('Link expirado ou inválido. Solicite um novo link.');
    }

    if (this.isUsed) {
      throw new DomainValidationError('Link expirado ou inválido. Solicite um novo link.');
    }

    return new PasswordResetToken({
      tokenHash: this.tokenHash,
      userId: this.userId,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      usedAt: new Date(),
    });
  }

  /** TTL constant exposed for infrastructure layer */
  static get TTL_MS(): number {
    return TTL_MS;
  }
}
