import { describe, it, expect } from 'vitest';
import {
  ApprovalInstance,
  type ApprovalInstanceProps,
} from '../../../../src/modules/movement-approval/domain/entities/approval-instance.entity.js';
import { InsufficientOpinionError } from '../../../../src/modules/movement-approval/domain/errors/movement-approval-errors.js';

function makeInstance(
  overrides: Partial<ApprovalInstanceProps> = {},
): ApprovalInstance {
  return ApprovalInstance.create({
    id: 'inst-001',
    tenantId: 'tenant-001',
    movementId: 'mov-001',
    level: 1,
    approverId: null,
    status: 'PENDING',
    opinion: null,
    decidedAt: null,
    timeoutAt: new Date('2026-01-02'),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });
}

describe('ApprovalInstance entity', () => {
  describe('create', () => {
    it('creates a valid pending instance', () => {
      const inst = makeInstance();
      expect(inst.id).toBe('inst-001');
      expect(inst.status).toBe('PENDING');
      expect(inst.approverId).toBeNull();
      expect(inst.opinion).toBeNull();
    });
  });

  describe('approve', () => {
    it('transitions to APPROVED with opinion >= 10 chars', () => {
      const inst = makeInstance();
      const approved = inst.approve('approver-001', 'Looks good, approved this request.');
      expect(approved.status).toBe('APPROVED');
      expect(approved.approverId).toBe('approver-001');
      expect(approved.opinion).toContain('Looks good');
      expect(approved.decidedAt).toBeInstanceOf(Date);
    });

    it('rejects opinion < 10 chars', () => {
      const inst = makeInstance();
      expect(() => inst.approve('approver-001', 'ok')).toThrow(InsufficientOpinionError);
    });

    it('is immutable — original unchanged', () => {
      const inst = makeInstance();
      inst.approve('approver-001', 'This is approved now.');
      expect(inst.status).toBe('PENDING');
    });
  });

  describe('reject', () => {
    it('transitions to REJECTED with opinion >= 10 chars', () => {
      const inst = makeInstance();
      const rejected = inst.reject('approver-001', 'Does not meet the requirements.');
      expect(rejected.status).toBe('REJECTED');
      expect(rejected.approverId).toBe('approver-001');
      expect(rejected.decidedAt).toBeInstanceOf(Date);
    });

    it('rejects opinion < 10 chars', () => {
      const inst = makeInstance();
      expect(() => inst.reject('approver-001', 'no')).toThrow(InsufficientOpinionError);
    });
  });

  describe('timeout', () => {
    it('transitions to TIMEOUT', () => {
      const inst = makeInstance();
      const timed = inst.timeout();
      expect(timed.status).toBe('TIMEOUT');
      expect(timed.decidedAt).toBeInstanceOf(Date);
    });
  });

  describe('escalate', () => {
    it('transitions to ESCALATED', () => {
      const inst = makeInstance();
      const escalated = inst.escalate();
      expect(escalated.status).toBe('ESCALATED');
    });
  });

  describe('toProps', () => {
    it('returns plain props', () => {
      const inst = makeInstance();
      const props = inst.toProps();
      expect(props.id).toBe('inst-001');
      expect(props.status).toBe('PENDING');
    });
  });
});
