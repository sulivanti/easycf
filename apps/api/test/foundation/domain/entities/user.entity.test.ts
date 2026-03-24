import { describe, it, expect } from 'vitest';
import {
  User,
  type UserProps,
} from '../../../../src/modules/foundation/domain/entities/user.entity.js';
import { Email } from '../../../../src/modules/foundation/domain/value-objects/email.vo.js';
import {
  DomainValidationError,
  EntityBlockedError,
  InvalidStatusTransitionError,
} from '../../../../src/modules/foundation/domain/errors/domain-errors.js';

function makeUserProps(overrides: Partial<UserProps> = {}): UserProps {
  return {
    id: 'usr-001',
    codigo: 'USR001',
    email: Email.create('test@example.com'),
    passwordHash: '$2b$12$hash',
    mfaSecret: null,
    status: 'ACTIVE',
    forcePwdReset: false,
    profile: { fullName: 'Test User', cpfCnpj: null, avatarUrl: null },
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    ...overrides,
  };
}

describe('User entity', () => {
  describe('create', () => {
    it('creates a valid user', () => {
      const user = User.create(makeUserProps());
      expect(user.id).toBe('usr-001');
      expect(user.email.value).toBe('test@example.com');
      expect(user.status).toBe('ACTIVE');
    });

    it('rejects empty codigo (BR-009)', () => {
      expect(() => User.create(makeUserProps({ codigo: '' }))).toThrow(DomainValidationError);
    });
  });

  describe('assertCanAuthenticate', () => {
    it('allows ACTIVE user', () => {
      const user = User.create(makeUserProps({ status: 'ACTIVE' }));
      expect(() => user.assertCanAuthenticate()).not.toThrow();
    });

    it('throws EntityBlockedError for BLOCKED user', () => {
      const user = User.fromPersistence(makeUserProps({ status: 'BLOCKED' }));
      expect(() => user.assertCanAuthenticate()).toThrow(EntityBlockedError);
    });

    it('throws DomainValidationError for INACTIVE user', () => {
      const user = User.fromPersistence(makeUserProps({ status: 'INACTIVE' }));
      expect(() => user.assertCanAuthenticate()).toThrow(DomainValidationError);
    });

    it('throws DomainValidationError for PENDING user', () => {
      const user = User.fromPersistence(makeUserProps({ status: 'PENDING' }));
      expect(() => user.assertCanAuthenticate()).toThrow(DomainValidationError);
    });
  });

  describe('isMfaEnabled (BR-008)', () => {
    it('returns false when mfaSecret is null', () => {
      const user = User.create(makeUserProps({ mfaSecret: null }));
      expect(user.isMfaEnabled).toBe(false);
    });

    it('returns true when mfaSecret is set', () => {
      const user = User.create(makeUserProps({ mfaSecret: 'JBSWY3DPEHPK3PXP' }));
      expect(user.isMfaEnabled).toBe(true);
    });
  });

  describe('status transitions', () => {
    it('PENDING → ACTIVE', () => {
      const user = User.fromPersistence(makeUserProps({ status: 'PENDING' }));
      const activated = user.transitionStatus('ACTIVE');
      expect(activated.status).toBe('ACTIVE');
    });

    it('ACTIVE → BLOCKED', () => {
      const user = User.create(makeUserProps({ status: 'ACTIVE' }));
      const blocked = user.transitionStatus('BLOCKED');
      expect(blocked.status).toBe('BLOCKED');
    });

    it('BLOCKED → ACTIVE (unblock)', () => {
      const user = User.fromPersistence(makeUserProps({ status: 'BLOCKED' }));
      const unblocked = user.transitionStatus('ACTIVE');
      expect(unblocked.status).toBe('ACTIVE');
    });

    it('INACTIVE is terminal — cannot transition', () => {
      const user = User.fromPersistence(makeUserProps({ status: 'INACTIVE' }));
      expect(() => user.transitionStatus('ACTIVE')).toThrow(InvalidStatusTransitionError);
    });

    it('ACTIVE → PENDING is not allowed', () => {
      const user = User.create(makeUserProps({ status: 'ACTIVE' }));
      expect(() => user.transitionStatus('PENDING')).toThrow(InvalidStatusTransitionError);
    });
  });

  describe('softDelete (BR-004)', () => {
    it('transitions to INACTIVE and sets deletedAt', () => {
      const user = User.create(makeUserProps({ status: 'ACTIVE' }));
      const deleted = user.softDelete();
      expect(deleted.status).toBe('INACTIVE');
      expect(deleted.deletedAt).toBeInstanceOf(Date);
      expect(deleted.isDeleted).toBe(true);
    });
  });

  describe('changePassword', () => {
    it('updates hash and clears forcePwdReset', () => {
      const user = User.create(makeUserProps({ forcePwdReset: true }));
      const updated = user.changePassword('$2b$12$newhash');
      expect(updated.passwordHash).toBe('$2b$12$newhash');
      expect(updated.forcePwdReset).toBe(false);
    });
  });

  describe('enableMfa', () => {
    it('sets mfaSecret', () => {
      const user = User.create(makeUserProps({ mfaSecret: null }));
      const mfaUser = user.enableMfa('SECRET123');
      expect(mfaUser.isMfaEnabled).toBe(true);
      expect(mfaUser.mfaSecret).toBe('SECRET123');
    });
  });

  describe('updateProfile', () => {
    it('merges partial profile', () => {
      const user = User.create(makeUserProps());
      const updated = user.updateProfile({ fullName: 'New Name' });
      expect(updated.profile?.fullName).toBe('New Name');
      expect(updated.profile?.cpfCnpj).toBeNull();
    });

    it('creates profile from null', () => {
      const user = User.create(makeUserProps({ profile: null }));
      const updated = user.updateProfile({ fullName: 'Created' });
      expect(updated.profile?.fullName).toBe('Created');
    });
  });

  describe('immutability', () => {
    it('mutations return new instances', () => {
      const original = User.create(makeUserProps());
      const changed = original.changePassword('$2b$12$other');
      expect(changed).not.toBe(original);
      expect(original.passwordHash).toBe('$2b$12$hash');
    });
  });
});
