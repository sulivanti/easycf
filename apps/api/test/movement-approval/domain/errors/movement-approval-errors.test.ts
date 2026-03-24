import { describe, it, expect } from 'vitest';
import { DomainError } from '../../../../src/modules/foundation/domain/errors/domain-errors.js';
import {
  MovementNotFoundError,
  ControlRuleNotFoundError,
  InvalidMovementTransitionError,
  MovementNotPendingError,
  InsufficientJustificationError,
  InsufficientOpinionError,
  ControlRuleInactiveError,
  SegregationViolationError,
} from '../../../../src/modules/movement-approval/domain/errors/movement-approval-errors.js';

describe('Movement Approval error hierarchy', () => {
  it('all errors extend DomainError', () => {
    const errors = [
      new MovementNotFoundError('mov-001'),
      new ControlRuleNotFoundError('rule-001'),
      new InvalidMovementTransitionError('PENDING_APPROVAL', 'EXECUTED'),
      new MovementNotPendingError('mov-001'),
      new InsufficientJustificationError(),
      new InsufficientOpinionError(),
      new ControlRuleInactiveError('rule-001'),
      new SegregationViolationError(),
    ];

    for (const err of errors) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err).toBeInstanceOf(Error);
      expect(err.type).toBeTruthy();
      expect(typeof err.statusHint).toBe('number');
    }
  });

  describe('MovementNotFoundError (404)', () => {
    it('carries the movement id in the message', () => {
      const err = new MovementNotFoundError('mov-abc');
      expect(err.statusHint).toBe(404);
      expect(err.type).toBe('/problems/movement-not-found');
      expect(err.message).toContain('mov-abc');
    });
  });

  describe('ControlRuleNotFoundError (404)', () => {
    it('carries the rule id in the message', () => {
      const err = new ControlRuleNotFoundError('rule-xyz');
      expect(err.statusHint).toBe(404);
      expect(err.type).toBe('/problems/control-rule-not-found');
      expect(err.message).toContain('rule-xyz');
    });
  });

  describe('InvalidMovementTransitionError (422)', () => {
    it('includes from→to in message', () => {
      const err = new InvalidMovementTransitionError('PENDING_APPROVAL', 'EXECUTED');
      expect(err.statusHint).toBe(422);
      expect(err.message).toContain('PENDING_APPROVAL');
      expect(err.message).toContain('EXECUTED');
    });
  });

  describe('MovementNotPendingError (422)', () => {
    it('carries movement id', () => {
      const err = new MovementNotPendingError('mov-001');
      expect(err.statusHint).toBe(422);
      expect(err.message).toContain('mov-001');
    });
  });

  describe('InsufficientJustificationError (422)', () => {
    it('mentions 20 character minimum', () => {
      const err = new InsufficientJustificationError();
      expect(err.statusHint).toBe(422);
      expect(err.message).toContain('20');
    });
  });

  describe('InsufficientOpinionError (422)', () => {
    it('mentions 10 character minimum', () => {
      const err = new InsufficientOpinionError();
      expect(err.statusHint).toBe(422);
      expect(err.message).toContain('10');
    });
  });

  describe('ControlRuleInactiveError (422)', () => {
    it('carries rule id', () => {
      const err = new ControlRuleInactiveError('rule-001');
      expect(err.statusHint).toBe(422);
      expect(err.message).toContain('rule-001');
    });
  });

  describe('SegregationViolationError (403)', () => {
    it('has 403 status', () => {
      const err = new SegregationViolationError();
      expect(err.statusHint).toBe(403);
      expect(err.type).toBe('/problems/segregation-violation');
    });
  });
});
