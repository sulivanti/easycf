/**
 * @contract BR-002, DATA-000 §3
 *
 * Entity: Session
 * Anchored in DB for kill-switch support (BR-002).
 * TTL: 12h normal, 30d with remember-me.
 */

import { SessionRevokedError, SessionExpiredError } from '../errors/domain-errors.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
const NORMAL_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface SessionProps {
  readonly id: string;
  readonly userId: string;
  readonly isRevoked: boolean;
  readonly deviceFp: string | null;
  readonly rememberMe: boolean;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly revokedAt: Date | null;
}

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------
export class Session {
  private _props: SessionProps;

  private constructor(props: SessionProps) {
    this._props = props;
  }

  // -- Factory ---------------------------------------------------------------

  static create(userId: string, rememberMe: boolean, deviceFp?: string): Session {
    const now = new Date();
    const ttl = rememberMe ? REMEMBER_TTL_MS : NORMAL_TTL_MS;

    return new Session({
      id: '', // assigned by infrastructure (DB default)
      userId,
      isRevoked: false,
      deviceFp: deviceFp ?? null,
      rememberMe,
      expiresAt: new Date(now.getTime() + ttl),
      createdAt: now,
      revokedAt: null,
    });
  }

  static fromPersistence(props: SessionProps): Session {
    return new Session(props);
  }

  // -- Getters ---------------------------------------------------------------

  get id(): string {
    return this._props.id;
  }
  get userId(): string {
    return this._props.userId;
  }
  get isRevoked(): boolean {
    return this._props.isRevoked;
  }
  get deviceFp(): string | null {
    return this._props.deviceFp;
  }
  get rememberMe(): boolean {
    return this._props.rememberMe;
  }
  get expiresAt(): Date {
    return this._props.expiresAt;
  }
  get createdAt(): Date {
    return this._props.createdAt;
  }
  get revokedAt(): Date | null {
    return this._props.revokedAt;
  }

  // -- Invariants ------------------------------------------------------------

  get isExpired(): boolean {
    return new Date() > this._props.expiresAt;
  }

  get isActive(): boolean {
    return !this._props.isRevoked && !this.isExpired;
  }

  /**
   * @contract BR-002 — Kill-switch validation.
   * MUST be called on every authenticated request.
   * @throws SessionRevokedError if session was revoked
   * @throws SessionExpiredError if session TTL exceeded
   */
  assertActive(): void {
    if (this._props.isRevoked) {
      throw new SessionRevokedError();
    }
    if (this.isExpired) {
      throw new SessionExpiredError();
    }
  }

  // -- Mutations -------------------------------------------------------------

  /** @contract BR-002 — Revoke individual session (kill-switch) */
  revoke(): Session {
    return new Session({
      ...this._props,
      isRevoked: true,
      revokedAt: new Date(),
    });
  }

  /** Return plain props for persistence */
  toProps(): SessionProps {
    return { ...this._props };
  }

  /** TTL constants exposed for infrastructure */
  static get NORMAL_TTL_MS(): number {
    return NORMAL_TTL_MS;
  }
  static get REMEMBER_TTL_MS(): number {
    return REMEMBER_TTL_MS;
  }
}
