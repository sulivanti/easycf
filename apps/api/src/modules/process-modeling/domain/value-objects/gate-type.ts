/**
 * @contract DATA-005 §2.4, BR-007
 *
 * Value Object for gate types.
 * INFORMATIVE gates never block transitions (BR-007).
 */

export const GATE_TYPES = ['APPROVAL', 'DOCUMENT', 'CHECKLIST', 'INFORMATIVE'] as const;
export type GateType = (typeof GATE_TYPES)[number];

export function isBlockingGate(type: GateType): boolean {
  return type !== 'INFORMATIVE';
}
