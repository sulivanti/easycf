/**
 * @contract BR-001.7, ADR-001
 *
 * Value Object: ShareAuthorization.
 * Validates the auto-authorization rule for access_shares:
 *   - With scope `identity:share:authorize`: grantor can be authorized_by (self-auth)
 *   - Without scope: authorized_by MUST differ from grantor_id
 */

import { SelfAuthorizationNotAllowedError } from '../errors/identity-errors.js';

const SELF_AUTH_SCOPE = 'identity:share:authorize';

/**
 * Validates the grantor/authorized_by relationship.
 * @param grantorId - User creating the share.
 * @param authorizedById - User authorizing the share.
 * @param callerScopes - Scopes of the caller (from JWT).
 * @throws SelfAuthorizationNotAllowedError if self-auth without scope.
 */
export function validateShareAuthorization(
  grantorId: string,
  authorizedById: string,
  callerScopes: string[],
): void {
  if (grantorId === authorizedById) {
    const hasSelfAuthScope = callerScopes.includes(SELF_AUTH_SCOPE);
    if (!hasSelfAuthScope) {
      throw new SelfAuthorizationNotAllowedError();
    }
  }
}
