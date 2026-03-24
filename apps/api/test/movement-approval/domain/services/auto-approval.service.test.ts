import { describe, it, expect } from 'vitest';
import { AutoApprovalService } from '../../../../src/modules/movement-approval/domain/services/auto-approval.service.js';
import { ApprovalRule } from '../../../../src/modules/movement-approval/domain/entities/approval-rule.entity.js';

function makeRule(
  overrides: Partial<{ allowSelfApprove: boolean; requiredScope: string | null }> = {},
): ApprovalRule {
  return ApprovalRule.create({
    id: 'arule-001',
    tenantId: 'tenant-001',
    controlRuleId: 'rule-001',
    level: 1,
    approverType: 'ROLE',
    approverValue: 'GERENTE',
    requiredScope: overrides.requiredScope ?? 'approval:decide',
    allowSelfApprove: overrides.allowSelfApprove ?? true,
    timeoutMinutes: 60,
    escalationRuleId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('AutoApprovalService (ADR-002)', () => {
  const service = new AutoApprovalService();

  it('returns true when all rules allow self-approve and requester has scopes', () => {
    const rules = [
      makeRule({ allowSelfApprove: true, requiredScope: 'approval:decide' }),
      makeRule({ allowSelfApprove: true, requiredScope: null }),
    ];
    expect(service.canAutoApprove(['approval:decide'], rules)).toBe(true);
  });

  it('returns false when any rule disallows self-approve', () => {
    const rules = [
      makeRule({ allowSelfApprove: true, requiredScope: null }),
      makeRule({ allowSelfApprove: false }),
    ];
    expect(service.canAutoApprove(['approval:decide'], rules)).toBe(false);
  });

  it('returns false when requester lacks required scope', () => {
    const rules = [
      makeRule({ allowSelfApprove: true, requiredScope: 'approval:decide' }),
    ];
    expect(service.canAutoApprove(['other:scope'], rules)).toBe(false);
  });

  it('returns false for empty approval chain', () => {
    expect(service.canAutoApprove(['approval:decide'], [])).toBe(false);
  });
});
