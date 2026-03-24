import { describe, it, expect, vi, afterEach } from 'vitest';
import { Session } from '../../../../src/modules/foundation/domain/entities/session.entity.js';
import {
  SessionRevokedError,
  SessionExpiredError,
} from '../../../../src/modules/foundation/domain/errors/domain-errors.js';

describe('Session entity (BR-002)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('create', () => {
    it('creates with 12h TTL by default', () => {
      const session = Session.create('user-1', false);
      const expectedTtl = 12 * 60 * 60 * 1000;
      const diff = session.expiresAt.getTime() - session.createdAt.getTime();
      expect(diff).toBe(expectedTtl);
      expect(session.rememberMe).toBe(false);
      expect(session.isRevoked).toBe(false);
    });

    it('creates with 30d TTL when rememberMe=true', () => {
      const session = Session.create('user-1', true);
      const expectedTtl = 30 * 24 * 60 * 60 * 1000;
      const diff = session.expiresAt.getTime() - session.createdAt.getTime();
      expect(diff).toBe(expectedTtl);
      expect(session.rememberMe).toBe(true);
    });

    it('stores deviceFp when provided', () => {
      const session = Session.create('user-1', false, 'fp-abc');
      expect(session.deviceFp).toBe('fp-abc');
    });

    it('sets deviceFp to null when not provided', () => {
      const session = Session.create('user-1', false);
      expect(session.deviceFp).toBeNull();
    });
  });

  describe('assertActive', () => {
    it('does not throw for active non-expired session', () => {
      const session = Session.create('user-1', false);
      expect(() => session.assertActive()).not.toThrow();
    });

    it('throws SessionRevokedError if revoked', () => {
      const session = Session.create('user-1', false);
      const revoked = session.revoke();
      expect(() => revoked.assertActive()).toThrow(SessionRevokedError);
    });

    it('throws SessionExpiredError if past expiry', () => {
      vi.useFakeTimers();

      const session = Session.create('user-1', false);

      // Advance past 12h TTL
      vi.advanceTimersByTime(13 * 60 * 60 * 1000);

      expect(() => session.assertActive()).toThrow(SessionExpiredError);
    });
  });

  describe('isActive', () => {
    it('returns true for fresh session', () => {
      const session = Session.create('user-1', false);
      expect(session.isActive).toBe(true);
    });

    it('returns false when revoked', () => {
      const session = Session.create('user-1', false).revoke();
      expect(session.isActive).toBe(false);
    });
  });

  describe('revoke (kill-switch)', () => {
    it('sets isRevoked and revokedAt', () => {
      const session = Session.create('user-1', false);
      const revoked = session.revoke();
      expect(revoked.isRevoked).toBe(true);
      expect(revoked.revokedAt).toBeInstanceOf(Date);
    });

    it('returns a new instance (immutable)', () => {
      const session = Session.create('user-1', false);
      const revoked = session.revoke();
      expect(revoked).not.toBe(session);
      expect(session.isRevoked).toBe(false);
    });
  });

  describe('static TTL constants', () => {
    it('exposes NORMAL_TTL_MS = 12h', () => {
      expect(Session.NORMAL_TTL_MS).toBe(12 * 60 * 60 * 1000);
    });

    it('exposes REMEMBER_TTL_MS = 30d', () => {
      expect(Session.REMEMBER_TTL_MS).toBe(30 * 24 * 60 * 60 * 1000);
    });
  });
});
