import { describe, it, expect } from 'vitest';
import {
  MovementControlRule,
  type MovementControlRuleProps,
} from '../../../../src/modules/movement-approval/domain/entities/movement-control-rule.entity.js';

function makeControlRule(overrides: Partial<MovementControlRuleProps> = {}): MovementControlRule {
  return MovementControlRule.create({
    id: 'crule-001',
    tenantId: 'tenant-001',
    codigo: 'CTRL-PO-CREATE',
    nome: 'Controle de criação de pedido de compra',
    descricao: null,
    objectType: 'purchase_order',
    operationType: 'CREATE',
    originTypes: ['HUMAN', 'API', 'MCP'],
    criteriaType: 'VALUE',
    valueThreshold: 10000,
    priority: 1,
    status: 'ACTIVE',
    validFrom: new Date('2026-01-01'),
    validUntil: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });
}

describe('MovementControlRule entity', () => {
  describe('create', () => {
    it('creates a valid control rule', () => {
      const rule = makeControlRule();
      expect(rule.id).toBe('crule-001');
      expect(rule.codigo).toBe('CTRL-PO-CREATE');
      expect(rule.objectType).toBe('purchase_order');
      expect(rule.originTypes).toEqual(['HUMAN', 'API', 'MCP']);
    });
  });

  describe('isActive', () => {
    it('returns true for ACTIVE', () => {
      const rule = makeControlRule({ status: 'ACTIVE' });
      expect(rule.isActive()).toBe(true);
    });

    it('returns false for INACTIVE', () => {
      const rule = makeControlRule({ status: 'INACTIVE' });
      expect(rule.isActive()).toBe(false);
    });
  });

  describe('isValid', () => {
    it('returns true when now is after validFrom and no validUntil', () => {
      const rule = makeControlRule({ validFrom: new Date('2026-01-01'), validUntil: null });
      expect(rule.isValid(new Date('2026-06-01'))).toBe(true);
    });

    it('returns false when now is before validFrom', () => {
      const rule = makeControlRule({ validFrom: new Date('2026-06-01') });
      expect(rule.isValid(new Date('2026-01-01'))).toBe(false);
    });

    it('returns false when now is after validUntil', () => {
      const rule = makeControlRule({
        validFrom: new Date('2026-01-01'),
        validUntil: new Date('2026-03-01'),
      });
      expect(rule.isValid(new Date('2026-06-01'))).toBe(false);
    });

    it('returns true when now is within range', () => {
      const rule = makeControlRule({
        validFrom: new Date('2026-01-01'),
        validUntil: new Date('2026-12-31'),
      });
      expect(rule.isValid(new Date('2026-06-15'))).toBe(true);
    });
  });

  describe('matchesOperation', () => {
    it('matches when objectType, operationType and origin all match', () => {
      const rule = makeControlRule();
      expect(rule.matchesOperation('purchase_order', 'CREATE', 'HUMAN')).toBe(true);
    });

    it('does not match wrong objectType', () => {
      const rule = makeControlRule();
      expect(rule.matchesOperation('invoice', 'CREATE', 'HUMAN')).toBe(false);
    });

    it('does not match wrong operationType', () => {
      const rule = makeControlRule();
      expect(rule.matchesOperation('purchase_order', 'DELETE', 'HUMAN')).toBe(false);
    });

    it('does not match origin not in originTypes', () => {
      const rule = makeControlRule({ originTypes: ['API'] });
      expect(rule.matchesOperation('purchase_order', 'CREATE', 'HUMAN')).toBe(false);
    });
  });

  describe('activate / deactivate', () => {
    it('deactivate returns INACTIVE rule', () => {
      const rule = makeControlRule({ status: 'ACTIVE' });
      const inactive = rule.deactivate();
      expect(inactive.isActive()).toBe(false);
    });

    it('activate returns ACTIVE rule', () => {
      const rule = makeControlRule({ status: 'INACTIVE' });
      const active = rule.activate();
      expect(active.isActive()).toBe(true);
    });

    it('is immutable — original unchanged', () => {
      const rule = makeControlRule({ status: 'ACTIVE' });
      rule.deactivate();
      expect(rule.isActive()).toBe(true);
    });
  });

  describe('toProps', () => {
    it('returns plain props', () => {
      const rule = makeControlRule();
      const props = rule.toProps();
      expect(props.id).toBe('crule-001');
      expect(props.criteriaType).toBe('VALUE');
    });
  });
});
