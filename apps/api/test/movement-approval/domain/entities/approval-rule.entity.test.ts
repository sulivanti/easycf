import { describe, it, expect } from 'vitest';
import {
  ApprovalRule,
  type ApprovalRuleProps,
} from '../../../../src/modules/movement-approval/domain/entities/approval-rule.entity.js';

function makeRule(overrides: Partial<ApprovalRuleProps> = {}): ApprovalRule {
  return ApprovalRule.create({
    id: 'arule-001',
    tenantId: 'tenant-001',
    controlRuleId: 'rule-001',
    level: 1,
    approverType: 'ROLE',
    approverValue: 'GERENTE_FINANCEIRO',
    requiredScope: 'approval:decide',
    allowSelfApprove: false,
    timeoutMinutes: 60,
    escalationRuleId: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });
}

describe('ApprovalRule entity', () => {
  describe('create', () => {
    it('creates a valid rule', () => {
      const rule = makeRule();
      expect(rule.id).toBe('arule-001');
      expect(rule.level).toBe(1);
      expect(rule.approverType).toBe('ROLE');
      expect(rule.approverValue).toBe('GERENTE_FINANCEIRO');
    });
  });

  describe('canAutoApprove (ADR-002)', () => {
    it('returns false when allowSelfApprove is false', () => {
      const rule = makeRule({ allowSelfApprove: false });
      expect(rule.canAutoApprove(['approval:decide'])).toBe(false);
    });

    it('returns true when allowSelfApprove and requester has requiredScope', () => {
      const rule = makeRule({
        allowSelfApprove: true,
        requiredScope: 'approval:decide',
      });
      expect(rule.canAutoApprove(['approval:decide', 'other:scope'])).toBe(true);
    });

    it('returns false when allowSelfApprove but requester lacks requiredScope', () => {
      const rule = makeRule({
        allowSelfApprove: true,
        requiredScope: 'approval:decide',
      });
      expect(rule.canAutoApprove(['other:scope'])).toBe(false);
    });

    it('returns true when allowSelfApprove and requiredScope is null', () => {
      const rule = makeRule({
        allowSelfApprove: true,
        requiredScope: null,
      });
      expect(rule.canAutoApprove([])).toBe(true);
    });
  });

  describe('toProps', () => {
    it('returns plain props', () => {
      const rule = makeRule();
      const props = rule.toProps();
      expect(props.id).toBe('arule-001');
      expect(props.level).toBe(1);
    });
  });
});
