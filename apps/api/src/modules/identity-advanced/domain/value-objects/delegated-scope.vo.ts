/**
 * @contract BR-001.4, BR-001.5, BR-001.6
 *
 * Value Object: DelegatedScopes.
 * Validates that a list of scopes is safe for delegation:
 *   - No prohibited suffixes (:approve, :execute, :sign) — BR-001.4
 *   - All scopes are owned by the delegator — BR-001.5
 *   - No scopes were obtained via delegation (re-delegation) — BR-001.6
 */

import {
  ProhibitedDelegationScopeError,
  ScopesNotOwnedError,
  ReDelegationNotAllowedError,
} from '../errors/identity-errors.js';

/** Regex matching prohibited delegation suffixes (BR-001.4). */
const PROHIBITED_SUFFIX_RE = /:(approve|execute|sign)$/;

/**
 * Validates scopes against prohibited suffixes.
 * @returns The validated scopes array (pass-through if valid).
 * @throws ProhibitedDelegationScopeError if any scope is prohibited.
 */
export function validateNoProhibitedScopes(scopes: string[]): string[] {
  const prohibited = scopes.filter((s) => PROHIBITED_SUFFIX_RE.test(s));
  if (prohibited.length > 0) {
    throw new ProhibitedDelegationScopeError(prohibited);
  }
  return scopes;
}

/**
 * Validates that all scopes are owned by the delegator.
 * @param scopesToDelegate - Scopes the delegator wants to delegate.
 * @param ownedScopes - Scopes the delegator actually owns (from JWT).
 * @throws ScopesNotOwnedError if any scope is not owned.
 */
export function validateScopesOwned(scopesToDelegate: string[], ownedScopes: string[]): void {
  const ownedSet = new Set(ownedScopes);
  const missing = scopesToDelegate.filter((s) => !ownedSet.has(s));
  if (missing.length > 0) {
    throw new ScopesNotOwnedError(missing);
  }
}

/**
 * Validates that no scopes come from delegation (prevents re-delegation).
 * @param scopesToDelegate - Scopes the delegator wants to delegate.
 * @param delegatedToUser - Scopes the user received via active delegations.
 * @throws ReDelegationNotAllowedError if any scope was obtained via delegation.
 */
export function validateNoReDelegation(
  scopesToDelegate: string[],
  delegatedToUser: readonly string[],
): void {
  const delegatedSet = new Set(delegatedToUser);
  const reDelegated = scopesToDelegate.some((s) => delegatedSet.has(s));
  if (reDelegated) {
    throw new ReDelegationNotAllowedError();
  }
}
