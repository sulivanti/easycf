/**
 * @contract BR-002, DATA-007 E-002
 *
 * Value Object for context framer status: ACTIVE | INACTIVE.
 * Framers transition ACTIVE → INACTIVE via expiration job (BR-002)
 * or manual deactivation.
 */

export const FRAMER_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type FramerStatus = (typeof FRAMER_STATUSES)[number];
