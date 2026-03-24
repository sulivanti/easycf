import { describe, it, expect } from 'vitest';
import {
  ControlledMovement,
  type ControlledMovementProps,
} from '../../../../src/modules/movement-approval/domain/entities/controlled-movement.entity.js';
import {
  InvalidMovementTransitionError,
  MovementNotPendingError,
  SegregationViolationError,
  InsufficientJustificationError,
} from '../../../../src/modules/movement-approval/domain/errors/movement-approval-errors.js';

function makeMovement(
  overrides: Partial<ControlledMovementProps> = {},
): ControlledMovement {
  return ControlledMovement.create({
    id: 'mov-001',
    tenantId: 'tenant-001',
    controlRuleId: 'rule-001',
    codigo: 'MOV-2026-0001',
    requesterId: 'user-requester',
    requesterOrigin: 'HUMAN',
    objectType: 'purchase_order',
    objectId: 'po-001',
    operationType: 'CREATE',
    operationPayload: { amount: 50000 },
    caseId: null,
    currentLevel: 1,
    totalLevels: 2,
    status: 'PENDING_APPROVAL',
    idempotencyKey: 'idem-001',
    errorMessage: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });
}

describe('ControlledMovement aggregate root', () => {
  describe('create', () => {
    it('creates a valid movement', () => {
      const mov = makeMovement();
      expect(mov.id).toBe('mov-001');
      expect(mov.status).toBe('PENDING_APPROVAL');
      expect(mov.requesterId).toBe('user-requester');
      expect(mov.requesterOrigin).toBe('HUMAN');
      expect(mov.operationPayload).toEqual({ amount: 50000 });
    });
  });

  describe('approve (FR-003)', () => {
    it('transitions PENDING_APPROVAL → APPROVED', () => {
      const mov = makeMovement();
      const approved = mov.approve();
      expect(approved.status).toBe('APPROVED');
    });

    it('rejects if not PENDING_APPROVAL', () => {
      const mov = makeMovement({ status: 'APPROVED' });
      expect(() => mov.approve()).toThrow(MovementNotPendingError);
    });

    it('is immutable — original unchanged', () => {
      const mov = makeMovement();
      mov.approve();
      expect(mov.status).toBe('PENDING_APPROVAL');
    });
  });

  describe('autoApprove (ADR-002)', () => {
    it('transitions PENDING_APPROVAL → AUTO_APPROVED', () => {
      const mov = makeMovement();
      const auto = mov.autoApprove();
      expect(auto.status).toBe('AUTO_APPROVED');
    });

    it('rejects if not PENDING_APPROVAL', () => {
      const mov = makeMovement({ status: 'REJECTED' });
      expect(() => mov.autoApprove()).toThrow(MovementNotPendingError);
    });
  });

  describe('reject', () => {
    it('transitions PENDING_APPROVAL → REJECTED', () => {
      const mov = makeMovement();
      const rejected = mov.reject();
      expect(rejected.status).toBe('REJECTED');
    });

    it('rejects if not PENDING_APPROVAL', () => {
      const mov = makeMovement({ status: 'APPROVED' });
      expect(() => mov.reject()).toThrow(MovementNotPendingError);
    });
  });

  describe('cancel', () => {
    it('allows requester to cancel', () => {
      const mov = makeMovement();
      const cancelled = mov.cancel('user-requester');
      expect(cancelled.status).toBe('CANCELLED');
    });

    it('rejects cancel from non-requester (segregation)', () => {
      const mov = makeMovement();
      expect(() => mov.cancel('user-other')).toThrow(SegregationViolationError);
    });

    it('rejects if not PENDING_APPROVAL', () => {
      const mov = makeMovement({ status: 'APPROVED' });
      expect(() => mov.cancel('user-requester')).toThrow(MovementNotPendingError);
    });
  });

  describe('override (ADR-004)', () => {
    const validJustification = 'This override is justified because of urgency and compliance.';

    it('transitions PENDING_APPROVAL → OVERRIDDEN with valid justification', () => {
      const mov = makeMovement();
      const overridden = mov.override('user-admin', validJustification);
      expect(overridden.status).toBe('OVERRIDDEN');
    });

    it('rejects justification < 20 chars', () => {
      const mov = makeMovement();
      expect(() => mov.override('user-admin', 'too short')).toThrow(
        InsufficientJustificationError,
      );
    });

    it('rejects if not PENDING_APPROVAL', () => {
      const mov = makeMovement({ status: 'REJECTED' });
      expect(() => mov.override('user-admin', validJustification)).toThrow(
        MovementNotPendingError,
      );
    });
  });

  describe('markExecuted', () => {
    it('APPROVED → EXECUTED', () => {
      const mov = makeMovement({ status: 'APPROVED' });
      const executed = mov.markExecuted();
      expect(executed.status).toBe('EXECUTED');
    });

    it('OVERRIDDEN → EXECUTED', () => {
      const mov = makeMovement({ status: 'OVERRIDDEN' });
      const executed = mov.markExecuted();
      expect(executed.status).toBe('EXECUTED');
    });

    it('PENDING_APPROVAL → EXECUTED is invalid', () => {
      const mov = makeMovement();
      expect(() => mov.markExecuted()).toThrow(InvalidMovementTransitionError);
    });
  });

  describe('markFailed', () => {
    it('APPROVED → FAILED with error message', () => {
      const mov = makeMovement({ status: 'APPROVED' });
      const failed = mov.markFailed('Integration timeout');
      expect(failed.status).toBe('FAILED');
      expect(failed.errorMessage).toBe('Integration timeout');
    });

    it('OVERRIDDEN → FAILED', () => {
      const mov = makeMovement({ status: 'OVERRIDDEN' });
      const failed = mov.markFailed('Service unavailable');
      expect(failed.status).toBe('FAILED');
    });
  });

  describe('advanceLevel', () => {
    it('increments currentLevel', () => {
      const mov = makeMovement({ currentLevel: 1 });
      const advanced = mov.advanceLevel();
      expect(advanced.currentLevel).toBe(2);
    });

    it('is immutable', () => {
      const mov = makeMovement({ currentLevel: 1 });
      mov.advanceLevel();
      expect(mov.currentLevel).toBe(1);
    });
  });

  describe('assertCanDecide (segregation)', () => {
    it('allows different actor', () => {
      const mov = makeMovement({ requesterId: 'user-requester' });
      expect(() => mov.assertCanDecide('user-approver')).not.toThrow();
    });

    it('rejects same actor as requester', () => {
      const mov = makeMovement({ requesterId: 'user-requester' });
      expect(() => mov.assertCanDecide('user-requester')).toThrow(
        SegregationViolationError,
      );
    });
  });

  describe('toProps', () => {
    it('returns a plain copy of props', () => {
      const mov = makeMovement();
      const props = mov.toProps();
      expect(props.id).toBe('mov-001');
      expect(props.status).toBe('PENDING_APPROVAL');
    });
  });
});
