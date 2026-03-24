/**
 * @contract BR-001, BR-004, BR-008, BR-009, BR-014, DATA-000 §1-§2
 *
 * Entity: User
 * Aggregate root for user identity + profile (content_users).
 * Encapsulates invariants: status transitions, soft-delete, MFA check,
 * force password reset.
 */

import type { Email } from '../value-objects/email.vo.js';
import {
  DomainValidationError,
  EntityBlockedError,
  InvalidStatusTransitionError,
} from '../errors/domain-errors.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'PENDING' | 'INACTIVE';

export interface UserProfile {
  readonly fullName: string;
  readonly cpfCnpj: string | null;
  readonly avatarUrl: string | null;
}

export interface UserProps {
  readonly id: string;
  readonly codigo: string;
  readonly email: Email;
  readonly passwordHash: string;
  readonly mfaSecret: string | null;
  readonly status: UserStatus;
  readonly forcePwdReset: boolean;
  readonly profile: UserProfile | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

// Status transitions allowed (from → to[])
const STATUS_TRANSITIONS: Record<UserStatus, readonly UserStatus[]> = {
  PENDING: ['ACTIVE', 'INACTIVE'],
  ACTIVE: ['BLOCKED', 'INACTIVE'],
  BLOCKED: ['ACTIVE', 'INACTIVE'],
  INACTIVE: [], // terminal (soft-deleted — BR-004)
};

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------
export class User {
  private _props: UserProps;

  private constructor(props: UserProps) {
    this._props = props;
  }

  // -- Factory ---------------------------------------------------------------

  static create(props: UserProps): User {
    if (!props.codigo || props.codigo.length === 0) {
      throw new DomainValidationError("Campo 'codigo' é obrigatório (BR-009).");
    }
    return new User(props);
  }

  static fromPersistence(props: UserProps): User {
    return new User(props);
  }

  // -- Getters ---------------------------------------------------------------

  get id(): string {
    return this._props.id;
  }
  get codigo(): string {
    return this._props.codigo;
  }
  get email(): Email {
    return this._props.email;
  }
  get passwordHash(): string {
    return this._props.passwordHash;
  }
  get mfaSecret(): string | null {
    return this._props.mfaSecret;
  }
  get status(): UserStatus {
    return this._props.status;
  }
  get forcePwdReset(): boolean {
    return this._props.forcePwdReset;
  }
  get profile(): UserProfile | null {
    return this._props.profile;
  }
  get createdAt(): Date {
    return this._props.createdAt;
  }
  get updatedAt(): Date {
    return this._props.updatedAt;
  }
  get deletedAt(): Date | null {
    return this._props.deletedAt;
  }

  // -- Invariants ------------------------------------------------------------

  /** @contract BR-008 — Check if MFA flow is required */
  get isMfaEnabled(): boolean {
    return this._props.mfaSecret !== null;
  }

  get isActive(): boolean {
    return this._props.status === 'ACTIVE';
  }

  get isDeleted(): boolean {
    return this._props.deletedAt !== null;
  }

  /**
   * Guard: ensures user can authenticate.
   * @throws EntityBlockedError if BLOCKED
   * @throws DomainValidationError if INACTIVE/PENDING
   */
  assertCanAuthenticate(): void {
    if (this._props.status === 'BLOCKED') {
      throw new EntityBlockedError('Usuário');
    }
    if (this._props.status === 'INACTIVE') {
      throw new DomainValidationError('Conta desativada.');
    }
    if (this._props.status === 'PENDING') {
      throw new DomainValidationError('Conta pendente de ativação.');
    }
  }

  // -- Mutations (return new state) ------------------------------------------

  /** Transition to a new status with invariant check */
  transitionStatus(to: UserStatus): User {
    const from = this._props.status;
    const allowed = STATUS_TRANSITIONS[from];

    if (!allowed.includes(to)) {
      throw new InvalidStatusTransitionError('User', from, to);
    }

    return new User({
      ...this._props,
      status: to,
      updatedAt: new Date(),
    });
  }

  /** @contract BR-004 — Soft delete (LGPD) */
  softDelete(): User {
    const transitioned = this.transitionStatus('INACTIVE');
    return new User({
      ...transitioned._props,
      deletedAt: new Date(),
    });
  }

  /** Update password hash (used by change-password and reset-password) */
  changePassword(newPasswordHash: string): User {
    return new User({
      ...this._props,
      passwordHash: newPasswordHash,
      forcePwdReset: false,
      updatedAt: new Date(),
    });
  }

  /** Enable MFA by setting the TOTP secret */
  enableMfa(mfaSecret: string): User {
    return new User({
      ...this._props,
      mfaSecret,
      updatedAt: new Date(),
    });
  }

  /** Update profile (content_users embedded) */
  updateProfile(profile: Partial<UserProfile>): User {
    const current = this._props.profile ?? {
      fullName: '',
      cpfCnpj: null,
      avatarUrl: null,
    };

    return new User({
      ...this._props,
      profile: {
        fullName: profile.fullName ?? current.fullName,
        cpfCnpj: profile.cpfCnpj ?? current.cpfCnpj,
        avatarUrl: profile.avatarUrl ?? current.avatarUrl,
      },
      updatedAt: new Date(),
    });
  }

  /** Return plain props for persistence */
  toProps(): UserProps {
    return { ...this._props };
  }
}
