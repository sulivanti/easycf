import { describe, it, expect } from 'vitest';
import { ApprovalChainResolver } from '../../../../src/modules/movement-approval/domain/services/approval-chain-resolver.service.js';
import { ApprovalRule } from '../../../../src/modules/movement-approval/domain/entities/approval-rule.entity.js';

function makeRule(level: number): ApprovalRule {
  return ApprovalRule.create({
    id: `arule-${level}`,
    tenantId: 'tenant-001',
    controlRuleId: 'rule-001',
    level,
    approverType: 'ROLE',
    approverValue: `LEVEL_${level}`,
    requiredScope: null,
    allowSelfApprove: false,
    timeoutMinutes: 60,
    escalationRuleId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('ApprovalChainResolver domain service', () => {
  const resolver = new ApprovalChainResolver();

  it('sorts rules by level ascending', () => {
    const rules = [makeRule(3), makeRule(1), makeRule(2)];
    const chain = resolver.resolveChain(rules);
    expect(chain.map((r) => r.level)).toEqual([1, 2, 3]);
  });

  it('returns empty array for empty input', () => {
    expect(resolver.resolveChain([])).toEqual([]);
  });

  it('handles single-level chain', () => {
    const chain = resolver.resolveChain([makeRule(1)]);
    expect(chain).toHaveLength(1);
    expect(chain[0]!.level).toBe(1);
  });

  it('does not mutate original array', () => {
    const rules = [makeRule(3), makeRule(1)];
    resolver.resolveChain(rules);
    expect(rules[0]!.level).toBe(3);
  });
});
