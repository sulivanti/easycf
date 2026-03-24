/**
 * @contract DATA-008 §2.1, BR-002
 *
 * Value Object for authentication types supported by integration services.
 */

export const AUTH_TYPES = ['NONE', 'BASIC', 'BEARER', 'OAUTH2'] as const;
export type AuthType = (typeof AUTH_TYPES)[number];

export function isValidAuthType(value: string): value is AuthType {
  return (AUTH_TYPES as readonly string[]).includes(value);
}
