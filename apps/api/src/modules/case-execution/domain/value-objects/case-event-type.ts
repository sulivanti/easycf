/**
 * @contract DATA-006 §2.5
 *
 * Event types for case_events (append-only log).
 * STAGE_TRANSITIONED is auto-recorded by the transition engine.
 * REOPENED triggers side-effects on the aggregate (BR-016).
 */

export const CASE_EVENT_TYPES = [
  'COMMENT',
  'EXCEPTION',
  'REOPENED',
  'EVIDENCE',
  'REASSIGNED',
  'ON_HOLD',
  'RESUMED',
  'STAGE_TRANSITIONED',
] as const;
export type CaseEventType = (typeof CASE_EVENT_TYPES)[number];
