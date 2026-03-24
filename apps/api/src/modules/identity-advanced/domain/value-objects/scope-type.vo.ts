/**
 * @contract BR-001.2, DATA-001 §user_org_scopes
 *
 * Value Object: ScopeType (PRIMARY | SECONDARY).
 * Encapsulates the org scope type with the invariant that
 * only one PRIMARY is allowed per user (validated at aggregate level).
 */

export const SCOPE_TYPES = ['PRIMARY', 'SECONDARY'] as const;
export type ScopeType = (typeof SCOPE_TYPES)[number];

export function isScopeType(value: unknown): value is ScopeType {
  return typeof value === 'string' && SCOPE_TYPES.includes(value as ScopeType);
}

export function parseScopeType(value: unknown): ScopeType {
  if (!isScopeType(value)) {
    throw new Error(
      `Valor inválido para scope_type: "${String(value)}". Esperado: ${SCOPE_TYPES.join(', ')}.`,
    );
  }
  return value;
}
