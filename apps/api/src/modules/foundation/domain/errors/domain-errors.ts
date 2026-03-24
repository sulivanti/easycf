/**
 * @contract BR-001, BR-002, BR-003, BR-013, BR-014, DOC-GNP-00
 *
 * Domain error hierarchy for the Foundation module.
 * All errors carry RFC 9457 Problem Details-compatible fields
 * so the presentation layer can map them directly to HTTP responses.
 */

export abstract class DomainError extends Error {
  /** RFC 9457 `type` — relative URI for the problem category */
  abstract readonly type: string;
  /** Suggested HTTP status code (presentation layer may override) */
  abstract readonly statusHint: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// ---------------------------------------------------------------------------
// Validation errors (422)
// ---------------------------------------------------------------------------
export class DomainValidationError extends DomainError {
  readonly type = '/problems/validation-error';
  readonly statusHint = 422;
}

// ---------------------------------------------------------------------------
// Authentication errors
// ---------------------------------------------------------------------------

/** @contract BR-001 — Generic auth failure (prevents user enumeration) */
export class AuthenticationFailedError extends DomainError {
  readonly type = '/problems/authentication-failed';
  readonly statusHint = 401;

  constructor() {
    super('E-mail ou senha incorretos.');
  }
}

/** @contract BR-002 — Session revoked via kill-switch */
export class SessionRevokedError extends DomainError {
  readonly type = '/problems/session-revoked';
  readonly statusHint = 401;

  constructor() {
    super('Sessão revogada. Faça login novamente.');
  }
}

/** @contract BR-002 — Session expired */
export class SessionExpiredError extends DomainError {
  readonly type = '/problems/session-expired';
  readonly statusHint = 401;

  constructor() {
    super('Sessão expirada. Faça login novamente.');
  }
}

/** @contract BR-003 — Rate limit exceeded */
export class RateLimitExceededError extends DomainError {
  readonly type = '/problems/rate-limit-exceeded';
  readonly statusHint = 429;
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super(`Limite de tentativas excedido. Tente novamente em ${retryAfterSeconds} segundos.`);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// ---------------------------------------------------------------------------
// Password errors
// ---------------------------------------------------------------------------

/** @contract BR-014 — Current password mismatch on change-password */
export class CurrentPasswordMismatchError extends DomainError {
  readonly type = '/problems/current-password-mismatch';
  readonly statusHint = 400;

  constructor() {
    super('Senha atual incorreta.');
  }
}

/** @contract BR-013 — Token expired */
export class TokenExpiredError extends DomainError {
  readonly type = '/problems/token-expired';
  readonly statusHint = 422;

  constructor() {
    super('Link expirado ou inválido. Solicite um novo link.');
  }
}

/** @contract BR-013 — Token already used */
export class TokenAlreadyUsedError extends DomainError {
  readonly type = '/problems/token-used';
  readonly statusHint = 422;

  constructor() {
    super('Link expirado ou inválido. Solicite um novo link.');
  }
}

// ---------------------------------------------------------------------------
// MFA errors
// ---------------------------------------------------------------------------

/** @contract BR-008 — MFA required, no access token issued */
export class MfaRequiredError extends DomainError {
  readonly type = '/problems/mfa-required';
  readonly statusHint = 403;

  constructor() {
    super('Autenticação multifator necessária.');
  }
}

export class MfaCodeInvalidError extends DomainError {
  readonly type = '/problems/mfa-code-invalid';
  readonly statusHint = 401;

  constructor() {
    super('Código MFA inválido.');
  }
}

// ---------------------------------------------------------------------------
// Authorization / tenant errors
// ---------------------------------------------------------------------------

/** @contract BR-007 — Tenant isolation violation */
export class TenantIsolationError extends DomainError {
  readonly type = '/problems/tenant-isolation';
  readonly statusHint = 403;

  constructor() {
    super('Acesso negado: recurso pertence a outro tenant.');
  }
}

export class InsufficientScopeError extends DomainError {
  readonly type = '/problems/insufficient-scope';
  readonly statusHint = 403;
  readonly requiredScope: string;

  constructor(requiredScope: string) {
    super(`Permissão insuficiente. Escopo necessário: ${requiredScope}`);
    this.requiredScope = requiredScope;
  }
}

// ---------------------------------------------------------------------------
// Entity state errors
// ---------------------------------------------------------------------------

export class EntityNotFoundError extends DomainError {
  readonly type = '/problems/not-found';
  readonly statusHint = 404;

  constructor(entityType: string, id: string) {
    super(`${entityType} não encontrado: ${id}`);
  }
}

export class EntityBlockedError extends DomainError {
  readonly type = '/problems/entity-blocked';
  readonly statusHint = 403;

  constructor(entityType: string) {
    super(`${entityType} está bloqueado.`);
  }
}

export class InvalidStatusTransitionError extends DomainError {
  readonly type = '/problems/invalid-status-transition';
  readonly statusHint = 422;

  constructor(entityType: string, from: string, to: string) {
    super(`Transição de status inválida para ${entityType}: ${from} → ${to}`);
  }
}
