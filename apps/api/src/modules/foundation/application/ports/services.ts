/**
 * @contract BR-010, BR-011, BR-012, BR-013, DOC-GNP-00
 *
 * Service port interfaces for the Foundation module.
 * These abstract infrastructure concerns (hashing, caching, tokens, email)
 * so use cases remain framework-agnostic.
 */

// ---------------------------------------------------------------------------
// PasswordHashService — bcrypt abstraction
// ---------------------------------------------------------------------------
export interface PasswordHashService {
  /** Hash a plain password (bcrypt) */
  hash(plainPassword: string): Promise<string>;
  /** Compare plain password against hash (bcrypt compare) */
  compare(plainPassword: string, hash: string): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// TokenService — JWT + temp token generation
// ---------------------------------------------------------------------------
export interface TokenPayload {
  readonly userId: string;
  readonly sessionId: string;
  readonly tenantId?: string;
  readonly scopes?: readonly string[];
}

export interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
}

export interface TempTokenPayload {
  readonly userId: string;
  readonly scope: string;
  readonly [key: string]: unknown;
}

export interface TokenService {
  /** Generate access + refresh token pair */
  generatePair(payload: TokenPayload): Promise<TokenPair>;
  /** Verify and decode an access token */
  verifyAccessToken(token: string): Promise<TokenPayload>;
  /** Generate a temporary token (MFA, SSO link) */
  generateTempToken(payload: TempTokenPayload, ttlSeconds: number): Promise<string>;
  /** Verify a temporary token */
  verifyTempToken(token: string, expectedScope: string): Promise<TempTokenPayload>;
}

// ---------------------------------------------------------------------------
// CacheService — Redis abstraction (BR-011)
// ---------------------------------------------------------------------------
export interface CacheService {
  /** Get cached value, returns null if miss or Redis unavailable */
  get<T>(key: string): Promise<T | null>;
  /** Set value with optional TTL in seconds */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  /** Delete a cache key */
  del(key: string): Promise<void>;
  /**
   * Get-or-set pattern: returns cached value or calls factory and caches result.
   * Redis failures MUST NOT throw — fall through to factory (BR-011).
   */
  getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T>;
}

// ---------------------------------------------------------------------------
// IdempotencyService — dedup for side-effect endpoints (BR-012)
// ---------------------------------------------------------------------------
export interface IdempotencyResult<T> {
  readonly cached: boolean;
  readonly value: T;
}

export interface IdempotencyService {
  /**
   * Check if an idempotency key has been used.
   * Returns the cached response if it has.
   */
  check<T>(key: string): Promise<IdempotencyResult<T> | null>;
  /** Store the response for an idempotency key with TTL */
  store<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
}

// ---------------------------------------------------------------------------
// HashUtilService — SHA-256 for password reset tokens (BR-013)
// ---------------------------------------------------------------------------
export interface HashUtilService {
  /** SHA-256 hash (for password reset tokens) */
  sha256(input: string): string;
  /** Generate a UUID v4 */
  generateUuid(): string;
}

// ---------------------------------------------------------------------------
// EmailService — async email dispatch (fire-and-forget)
// ---------------------------------------------------------------------------
export interface EmailService {
  /** Send password reset email. Failures MUST NOT throw. */
  sendPasswordReset(email: string, token: string, expiresAt: Date): Promise<void>;
  /** Send welcome email. Failures MUST NOT throw. */
  sendWelcome(email: string, fullName: string): Promise<void>;
}
