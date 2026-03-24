import { describe, it, expect } from 'vitest';
import {
  DomainError,
  DomainValidationError,
  AuthenticationFailedError,
  SessionRevokedError,
  SessionExpiredError,
  RateLimitExceededError,
  CurrentPasswordMismatchError,
  TokenExpiredError,
  TokenAlreadyUsedError,
  MfaRequiredError,
  MfaCodeInvalidError,
  TenantIsolationError,
  InsufficientScopeError,
  EntityNotFoundError,
  EntityBlockedError,
  InvalidStatusTransitionError,
} from '../../../../src/modules/foundation/domain/errors/domain-errors.js';

describe('DomainError hierarchy', () => {
  it('all concrete errors extend DomainError', () => {
    const errors = [
      new DomainValidationError('validation'),
      new AuthenticationFailedError(),
      new SessionRevokedError(),
      new SessionExpiredError(),
      new RateLimitExceededError(60),
      new CurrentPasswordMismatchError(),
      new TokenExpiredError(),
      new TokenAlreadyUsedError(),
      new MfaRequiredError(),
      new MfaCodeInvalidError(),
      new TenantIsolationError(),
      new InsufficientScopeError('users:user:read'),
      new EntityNotFoundError('User', 'abc-123'),
      new EntityBlockedError('User'),
      new InvalidStatusTransitionError('User', 'ACTIVE', 'PENDING'),
    ];

    for (const err of errors) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err).toBeInstanceOf(Error);
      expect(err.type).toBeTruthy();
      expect(typeof err.statusHint).toBe('number');
    }
  });

  describe('AuthenticationFailedError (BR-001)', () => {
    it('has 401 status and generic message to prevent enumeration', () => {
      const err = new AuthenticationFailedError();
      expect(err.statusHint).toBe(401);
      expect(err.type).toBe('/problems/authentication-failed');
      expect(err.message).toBe('E-mail ou senha incorretos.');
    });
  });

  describe('SessionRevokedError (BR-002)', () => {
    it('has 401 status', () => {
      const err = new SessionRevokedError();
      expect(err.statusHint).toBe(401);
      expect(err.type).toBe('/problems/session-revoked');
    });
  });

  describe('SessionExpiredError (BR-002)', () => {
    it('has 401 status', () => {
      const err = new SessionExpiredError();
      expect(err.statusHint).toBe(401);
      expect(err.type).toBe('/problems/session-expired');
    });
  });

  describe('RateLimitExceededError (BR-003)', () => {
    it('carries retryAfterSeconds and 429 status', () => {
      const err = new RateLimitExceededError(120);
      expect(err.statusHint).toBe(429);
      expect(err.retryAfterSeconds).toBe(120);
      expect(err.message).toContain('120');
    });
  });

  describe('TokenExpiredError (BR-013)', () => {
    it('returns 422 (not 401) for expired reset tokens', () => {
      const err = new TokenExpiredError();
      expect(err.statusHint).toBe(422);
    });
  });

  describe('TokenAlreadyUsedError (BR-013)', () => {
    it('returns 422 and same message as TokenExpiredError', () => {
      const expired = new TokenExpiredError();
      const used = new TokenAlreadyUsedError();
      expect(used.statusHint).toBe(422);
      expect(used.message).toBe(expired.message);
    });
  });

  describe('InsufficientScopeError', () => {
    it('carries the required scope in the message', () => {
      const err = new InsufficientScopeError('users:user:write');
      expect(err.statusHint).toBe(403);
      expect(err.requiredScope).toBe('users:user:write');
      expect(err.message).toContain('users:user:write');
    });
  });

  describe('EntityNotFoundError', () => {
    it('includes entity type and id in message', () => {
      const err = new EntityNotFoundError('Role', 'role-456');
      expect(err.statusHint).toBe(404);
      expect(err.message).toContain('Role');
      expect(err.message).toContain('role-456');
    });
  });

  describe('InvalidStatusTransitionError', () => {
    it('includes from→to in message', () => {
      const err = new InvalidStatusTransitionError('User', 'INACTIVE', 'ACTIVE');
      expect(err.statusHint).toBe(422);
      expect(err.message).toContain('INACTIVE');
      expect(err.message).toContain('ACTIVE');
    });
  });

  describe('MfaRequiredError (BR-008)', () => {
    it('has 403 status', () => {
      const err = new MfaRequiredError();
      expect(err.statusHint).toBe(403);
    });
  });
});
