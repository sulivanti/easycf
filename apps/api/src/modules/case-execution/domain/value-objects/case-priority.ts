/**
 * @contract DATA-006-M01, DATA-006 §2.1
 *
 * Value Object representing case priority.
 * Informational field — no business rules attached.
 */

export const CASE_PRIORITIES = ['NORMAL', 'HIGH', 'URGENT'] as const;
export type CasePriority = (typeof CASE_PRIORITIES)[number];

export function isValidPriority(value: string): value is CasePriority {
  return (CASE_PRIORITIES as readonly string[]).includes(value);
}
