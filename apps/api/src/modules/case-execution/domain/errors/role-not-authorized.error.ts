/**
 * @contract BR-008
 *
 * Thrown when a user attempts an action requiring a role they don't have.
 * Example: resolving an APPROVAL gate without can_approve=true.
 */

export class RoleNotAuthorizedError extends Error {
  public readonly code = "ROLE_NOT_AUTHORIZED";
  public readonly statusCode = 403;

  constructor(userId: string, requiredCapability: string) {
    super(
      `User ${userId} does not have the required capability: ${requiredCapability}.`,
    );
    this.name = "RoleNotAuthorizedError";
  }
}
