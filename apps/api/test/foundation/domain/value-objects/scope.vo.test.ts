import { describe, it, expect } from 'vitest';
import { Scope } from '../../../../src/modules/foundation/domain/value-objects/scope.vo.js';
import { DomainValidationError } from '../../../../src/modules/foundation/domain/errors/domain-errors.js';

describe('Scope value object (BR-005)', () => {
  describe('valid scopes', () => {
    it('accepts 3-segment canonical format', () => {
      const scope = Scope.create('users:user:read');
      expect(scope.value).toBe('users:user:read');
      expect(scope.domain).toBe('users');
      expect(scope.entity).toBe('user');
      expect(scope.action).toBe('read');
      expect(scope.isCanonical).toBe(true);
    });

    it('accepts 2-segment retrocompatible format', () => {
      const scope = Scope.create('admin:manage');
      expect(scope.domain).toBe('admin');
      expect(scope.entity).toBeUndefined();
      expect(scope.action).toBe('manage');
      expect(scope.isCanonical).toBe(false);
    });

    it('trims whitespace', () => {
      const scope = Scope.create('  users:user:write  ');
      expect(scope.value).toBe('users:user:write');
    });

    it('accepts underscores in segments', () => {
      const scope = Scope.create('org_units:unit:read_all');
      expect(scope.value).toBe('org_units:unit:read_all');
    });

    it('accepts digits in segments after first char', () => {
      const scope = Scope.create('mod2:entity3:action4');
      expect(scope.value).toBe('mod2:entity3:action4');
    });
  });

  describe('invalid scopes', () => {
    it('rejects empty string', () => {
      expect(() => Scope.create('')).toThrow(DomainValidationError);
    });

    it('rejects whitespace-only', () => {
      expect(() => Scope.create('   ')).toThrow(DomainValidationError);
    });

    it('rejects single segment (no colon)', () => {
      expect(() => Scope.create('admin')).toThrow(DomainValidationError);
    });

    it('rejects 4+ segments', () => {
      expect(() => Scope.create('a:b:c:d')).toThrow(DomainValidationError);
    });

    it('rejects uppercase letters', () => {
      expect(() => Scope.create('Users:user:read')).toThrow(DomainValidationError);
    });

    it('rejects starting with digit', () => {
      expect(() => Scope.create('1users:read')).toThrow(DomainValidationError);
    });

    it('rejects special characters', () => {
      expect(() => Scope.create('users:user:read!')).toThrow(DomainValidationError);
    });

    it('rejects hyphens in scope segments (FR-000-C11)', () => {
      expect(() => Scope.create('mcp:agent:phase2-enable')).toThrow(DomainValidationError);
      expect(() => Scope.create('users:user:read-all')).toThrow(DomainValidationError);
    });

    it('rejects scope exceeding 100 chars', () => {
      const long = 'a'.repeat(50) + ':' + 'b'.repeat(50);
      expect(() => Scope.create(long)).toThrow(DomainValidationError);
    });
  });

  describe('equality', () => {
    it('equals returns true for same value', () => {
      const a = Scope.create('users:user:read');
      const b = Scope.create('users:user:read');
      expect(a.equals(b)).toBe(true);
    });

    it('equals returns false for different value', () => {
      const a = Scope.create('users:user:read');
      const b = Scope.create('users:user:write');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('seed SCOPES consistency (FR-000-C11)', () => {
    it('all SCOPES in scopes-catalog pass Scope.create() validation', async () => {
      const { SCOPES } = await import('../../../../db/scopes-catalog.js');
      expect(SCOPES.length).toBeGreaterThan(0);
      for (const s of SCOPES) {
        expect(() => Scope.create(s)).not.toThrow();
      }
    });
  });

  describe('toString', () => {
    it('returns the raw value', () => {
      const scope = Scope.create('users:role:write');
      expect(scope.toString()).toBe('users:role:write');
    });
  });
});
