/**
 * @contract BR-004, DATA-007 E-007
 *
 * Value Object for the 8 possible item actions.
 * Includes the restrictiveness map used by the runtime safety net (BR-004):
 *   HIDE > SHOW, SET_REQUIRED > SET_OPTIONAL,
 *   smaller domain wins for RESTRICT_DOMAIN.
 */

export const ITEM_ACTIONS = [
  'SHOW',
  'HIDE',
  'SET_REQUIRED',
  'SET_OPTIONAL',
  'SET_DEFAULT',
  'RESTRICT_DOMAIN',
  'VALIDATE',
  'REQUIRE_EVIDENCE',
] as const;

export type ItemAction = (typeof ITEM_ACTIONS)[number];

/**
 * Restrictiveness ranking for conflict resolution (BR-004).
 * Higher value = more restrictive = wins in conflict.
 *
 * Applies only to pairs that can conflict on the same field:
 *   - FIELD_VISIBILITY: HIDE(2) > SHOW(1)
 *   - REQUIRED:         SET_REQUIRED(2) > SET_OPTIONAL(1)
 *
 * Other actions (SET_DEFAULT, RESTRICT_DOMAIN, VALIDATE, REQUIRE_EVIDENCE)
 * are resolved by specific logic in ConflictResolver, not by rank.
 */
export const ACTION_RESTRICTIVENESS: Partial<Record<ItemAction, number>> = {
  SHOW: 1,
  HIDE: 2,
  SET_OPTIONAL: 1,
  SET_REQUIRED: 2,
};

/**
 * Returns the more restrictive action between two conflicting actions.
 * For actions not in the ranking, returns the first (caller decides).
 */
export function moreRestrictive(a: ItemAction, b: ItemAction): ItemAction {
  const rankA = ACTION_RESTRICTIVENESS[a] ?? 0;
  const rankB = ACTION_RESTRICTIVENESS[b] ?? 0;
  return rankB > rankA ? b : a;
}
