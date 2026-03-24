import { describe, it, expect } from 'vitest';
import { ControlEngine } from '../../../../src/modules/movement-approval/domain/services/control-engine.service.js';
import { MovementControlRule } from '../../../../src/modules/movement-approval/domain/entities/movement-control-rule.entity.js';

function makeRule(
  overrides: Partial<{
    id: string;
    status: 'ACTIVE' | 'INACTIVE';
    objectType: string;
    operationType: string;
    originTypes: ('HUMAN' | 'API' | 'MCP' | 'AGENT')[];
    validFrom: Date;
    validUntil: Date | null;
    priority: number;
  }> = {},
): MovementControlRule {
  return MovementControlRule.create({
    id: overrides.id ?? 'rule-001',
    tenantId: 'tenant-001',
    codigo: 'CTRL-001',
    nome: 'Test Rule',
    descricao: null,
    objectType: overrides.objectType ?? 'purchase_order',
    operationType: overrides.operationType ?? 'CREATE',
    originTypes: overrides.originTypes ?? ['HUMAN', 'API'],
    criteriaType: 'VALUE',
    valueThreshold: 10000,
    priority: overrides.priority ?? 1,
    status: overrides.status ?? 'ACTIVE',
    validFrom: overrides.validFrom ?? new Date('2026-01-01'),
    validUntil: overrides.validUntil ?? null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}

describe('ControlEngine domain service (ADR-001)', () => {
  const engine = new ControlEngine();
  const now = new Date('2026-06-01');

  it('returns controlled=true for matching active rule', () => {
    const rules = [makeRule()];
    const result = engine.evaluate(rules, 'purchase_order', 'CREATE', 'HUMAN', now);
    expect(result.controlled).toBe(true);
    expect(result.ruleId).toBe('rule-001');
  });

  it('returns controlled=false when no rules match', () => {
    const rules = [makeRule({ objectType: 'invoice' })];
    const result = engine.evaluate(rules, 'purchase_order', 'CREATE', 'HUMAN', now);
    expect(result.controlled).toBe(false);
  });

  it('skips inactive rules', () => {
    const rules = [makeRule({ status: 'INACTIVE' })];
    const result = engine.evaluate(rules, 'purchase_order', 'CREATE', 'HUMAN', now);
    expect(result.controlled).toBe(false);
  });

  it('skips expired rules', () => {
    const rules = [makeRule({ validUntil: new Date('2026-03-01') })];
    const result = engine.evaluate(rules, 'purchase_order', 'CREATE', 'HUMAN', now);
    expect(result.controlled).toBe(false);
  });

  it('skips rules not yet valid', () => {
    const rules = [makeRule({ validFrom: new Date('2027-01-01') })];
    const result = engine.evaluate(rules, 'purchase_order', 'CREATE', 'HUMAN', now);
    expect(result.controlled).toBe(false);
  });

  it('returns first matching rule by priority order', () => {
    const rules = [
      makeRule({ id: 'rule-high', priority: 1 }),
      makeRule({ id: 'rule-low', priority: 2 }),
    ];
    const result = engine.evaluate(rules, 'purchase_order', 'CREATE', 'HUMAN', now);
    expect(result.ruleId).toBe('rule-high');
  });

  it('returns controlled=false for empty rules', () => {
    const result = engine.evaluate([], 'purchase_order', 'CREATE', 'HUMAN', now);
    expect(result.controlled).toBe(false);
  });

  it('skips rules where origin does not match', () => {
    const rules = [makeRule({ originTypes: ['MCP'] })];
    const result = engine.evaluate(rules, 'purchase_order', 'CREATE', 'HUMAN', now);
    expect(result.controlled).toBe(false);
  });
});
