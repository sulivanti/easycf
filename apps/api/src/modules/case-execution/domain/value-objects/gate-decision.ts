/**
 * @contract DATA-006 §5.3
 *
 * Value Object for gate decisions on APPROVAL gates.
 * APPROVED — gate approved (status → RESOLVED).
 * REJECTED — gate rejected (status → REJECTED, motor does NOT advance).
 * WAIVED — gate dispensed (status → WAIVED, requires special scope — BR-014).
 */

export const GATE_DECISIONS = ['APPROVED', 'REJECTED', 'WAIVED'] as const;
export type GateDecision = (typeof GATE_DECISIONS)[number];
