import { describe, it, expect } from 'vitest';
import { Role } from '../../../../src/modules/foundation/domain/entities/role.entity.js';
import { Scope } from '../../../../src/modules/foundation/domain/value-objects/scope.vo.js';
import {
  DomainValidationError,
  InvalidStatusTransitionError,
} from '../../../../src/modules/foundation/domain/errors/domain-errors.js';

function makeRole(overrides: Partial<Parameters<typeof Role.create>[0]> = {}) {
  return Role.create({
    id: 'role-001',
    codigo: 'ADMIN',
    name: 'Administrador',
    description: 'Full access',
    status: 'ACTIVE',
    scopes: [Scope.create('users:user:read'), Scope.create('users:user:write')],
    ...overrides,
  });
}

describe('Role entity (BR-005, BR-006)', () => {
  describe('create', () => {
    it('creates a valid role', () => {
      const role = makeRole();
      expect(role.codigo).toBe('ADMIN');
      expect(role.name).toBe('Administrador');
      expect(role.scopes).toHaveLength(2);
      expect(role.isActive).toBe(true);
    });

    it('rejects empty codigo (BR-009)', () => {
      expect(() => makeRole({ codigo: '' })).toThrow(DomainValidationError);
    });

    it('rejects empty name', () => {
      expect(() => makeRole({ name: '' })).toThrow(DomainValidationError);
    });

    it('rejects duplicate scopes', () => {
      const scope = Scope.create('users:user:read');
      expect(() => makeRole({ scopes: [scope, scope] })).toThrow(DomainValidationError);
    });
  });

  describe('hasScope', () => {
    it('returns true for existing scope', () => {
      const role = makeRole();
      const scope = Scope.create('users:user:read');
      expect(role.hasScope(scope)).toBe(true);
    });

    it('returns false for missing scope', () => {
      const role = makeRole();
      const scope = Scope.create('admin:manage');
      expect(role.hasScope(scope)).toBe(false);
    });
  });

  describe('replaceScopes (BR-006)', () => {
    it('fully replaces all scopes', () => {
      const role = makeRole();
      const newScopes = [Scope.create('tenants:tenant:read')];
      const updated = role.replaceScopes(newScopes);

      expect(updated.scopes).toHaveLength(1);
      expect(updated.scopes[0]!.value).toBe('tenants:tenant:read');
      // Original unchanged
      expect(role.scopes).toHaveLength(2);
    });

    it('rejects duplicate scopes in replacement', () => {
      const role = makeRole();
      const dup = Scope.create('x:y:z');
      expect(() => role.replaceScopes([dup, dup])).toThrow(DomainValidationError);
    });
  });

  describe('scopeValues', () => {
    it('returns string array of scope values', () => {
      const role = makeRole();
      expect(role.scopeValues).toEqual(['users:user:read', 'users:user:write']);
    });
  });

  describe('status transitions', () => {
    it('ACTIVE → INACTIVE', () => {
      const role = makeRole({ status: 'ACTIVE' });
      const deactivated = role.transitionStatus('INACTIVE');
      expect(deactivated.status).toBe('INACTIVE');
    });

    it('INACTIVE is terminal', () => {
      const role = Role.fromPersistence({
        id: 'role-001',
        codigo: 'ADMIN',
        name: 'Admin',
        description: null,
        status: 'INACTIVE',
        scopes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      expect(() => role.transitionStatus('ACTIVE')).toThrow(InvalidStatusTransitionError);
    });
  });

  describe('softDelete (BR-004)', () => {
    it('transitions to INACTIVE and sets deletedAt', () => {
      const role = makeRole();
      const deleted = role.softDelete();
      expect(deleted.status).toBe('INACTIVE');
      expect(deleted.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('update', () => {
    it('updates name and description', () => {
      const role = makeRole();
      const updated = role.update({ name: 'Super Admin', description: 'All perms' });
      expect(updated.name).toBe('Super Admin');
      expect(updated.description).toBe('All perms');
    });

    it('keeps original values when not provided', () => {
      const role = makeRole();
      const updated = role.update({});
      expect(updated.name).toBe('Administrador');
      expect(updated.description).toBe('Full access');
    });
  });
});
