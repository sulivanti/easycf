/**
 * @contract DATA-008 §2.4
 *
 * Value Object for integration parameter types.
 * Determines how the parameter value is resolved at execution time.
 */

export const PARAM_TYPES = [
  'FIXED',
  'DERIVED_FROM_TENANT',
  'DERIVED_FROM_CONTEXT',
  'HEADER',
] as const;
export type IntegrationParamType = (typeof PARAM_TYPES)[number];

export function isValidParamType(value: string): value is IntegrationParamType {
  return (PARAM_TYPES as readonly string[]).includes(value);
}
