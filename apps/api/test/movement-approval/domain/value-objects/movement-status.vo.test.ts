import { describe, it, expect } from 'vitest';
import {
  isValidMovementTransition,
  MOVEMENT_STATUS_TRANSITIONS,
  type MovementStatus,
} from '../../../../src/modules/movement-approval/domain/value-objects/movement-status.vo.js';

describe('MovementStatus value object', () => {
  describe('valid transitions from PENDING_APPROVAL', () => {
    const validTargets: MovementStatus[] = [
      'APPROVED',
      'AUTO_APPROVED',
      'REJECTED',
      'CANCELLED',
      'OVERRIDDEN',
    ];

    for (const target of validTargets) {
      it(`PENDING_APPROVAL → ${target}`, () => {
        expect(isValidMovementTransition('PENDING_APPROVAL', target)).toBe(true);
      });
    }

    it('PENDING_APPROVAL → EXECUTED is invalid', () => {
      expect(isValidMovementTransition('PENDING_APPROVAL', 'EXECUTED')).toBe(false);
    });

    it('PENDING_APPROVAL → FAILED is invalid', () => {
      expect(isValidMovementTransition('PENDING_APPROVAL', 'FAILED')).toBe(false);
    });
  });

  describe('valid transitions from APPROVED', () => {
    it('APPROVED → EXECUTED', () => {
      expect(isValidMovementTransition('APPROVED', 'EXECUTED')).toBe(true);
    });

    it('APPROVED → FAILED', () => {
      expect(isValidMovementTransition('APPROVED', 'FAILED')).toBe(true);
    });

    it('APPROVED → REJECTED is invalid', () => {
      expect(isValidMovementTransition('APPROVED', 'REJECTED')).toBe(false);
    });
  });

  describe('valid transitions from OVERRIDDEN', () => {
    it('OVERRIDDEN → EXECUTED', () => {
      expect(isValidMovementTransition('OVERRIDDEN', 'EXECUTED')).toBe(true);
    });

    it('OVERRIDDEN → FAILED', () => {
      expect(isValidMovementTransition('OVERRIDDEN', 'FAILED')).toBe(true);
    });
  });

  describe('terminal statuses have no transitions', () => {
    const terminals: MovementStatus[] = [
      'AUTO_APPROVED',
      'REJECTED',
      'CANCELLED',
      'EXECUTED',
      'FAILED',
    ];

    for (const status of terminals) {
      it(`${status} is terminal`, () => {
        expect(MOVEMENT_STATUS_TRANSITIONS[status]).toHaveLength(0);
      });
    }
  });
});
