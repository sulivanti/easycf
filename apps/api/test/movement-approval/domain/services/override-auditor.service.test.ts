import { describe, it, expect } from 'vitest';
import { OverrideAuditor } from '../../../../src/modules/movement-approval/domain/services/override-auditor.service.js';
import { InsufficientJustificationError } from '../../../../src/modules/movement-approval/domain/errors/movement-approval-errors.js';
import { InsufficientScopeError } from '../../../../src/modules/foundation/domain/errors/domain-errors.js';

describe('OverrideAuditor domain service (ADR-004)', () => {
  const auditor = new OverrideAuditor();
  const validJustification = 'Override justified due to urgent compliance requirement.';

  it('passes with valid scope and justification', () => {
    expect(() =>
      auditor.validateOverride('actor-001', ['approval:override'], validJustification),
    ).not.toThrow();
  });

  it('throws InsufficientScopeError when actor lacks approval:override', () => {
    expect(() =>
      auditor.validateOverride('actor-001', ['approval:decide'], validJustification),
    ).toThrow(InsufficientScopeError);
  });

  it('throws InsufficientScopeError with empty scopes', () => {
    expect(() => auditor.validateOverride('actor-001', [], validJustification)).toThrow(
      InsufficientScopeError,
    );
  });

  it('throws InsufficientJustificationError for justification < 20 chars', () => {
    expect(() => auditor.validateOverride('actor-001', ['approval:override'], 'too short')).toThrow(
      InsufficientJustificationError,
    );
  });

  it('throws InsufficientJustificationError for empty justification', () => {
    expect(() => auditor.validateOverride('actor-001', ['approval:override'], '')).toThrow(
      InsufficientJustificationError,
    );
  });

  it('checks scope before justification (scope error takes precedence)', () => {
    expect(() => auditor.validateOverride('actor-001', [], 'short')).toThrow(
      InsufficientScopeError,
    );
  });
});
