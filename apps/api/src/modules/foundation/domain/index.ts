/**
 * @contract DATA-000, BR-000
 *
 * Foundation domain layer — central re-export.
 */

// Entities
export { User } from './entities/user.entity.js';
export type { UserProps, UserProfile, UserStatus } from './entities/user.entity.js';

export { Session } from './entities/session.entity.js';
export type { SessionProps } from './entities/session.entity.js';

export { Tenant } from './entities/tenant.entity.js';
export type { TenantProps, TenantStatus } from './entities/tenant.entity.js';

export { Role } from './entities/role.entity.js';
export type { RoleProps, RoleStatus } from './entities/role.entity.js';

export { TenantUser } from './entities/tenant-user.entity.js';
export type { TenantUserProps, TenantUserStatus } from './entities/tenant-user.entity.js';

// Value Objects
export { Email } from './value-objects/email.vo.js';
export { Scope } from './value-objects/scope.vo.js';
export { PasswordResetToken } from './value-objects/password-reset-token.vo.js';
export type { PasswordResetTokenProps } from './value-objects/password-reset-token.vo.js';

// Events
export { createFoundationEvent, EVENT_SENSITIVITY } from './events/foundation-events.js';
export type {
  DomainEventBase,
  FoundationEventType,
  FoundationEntityType,
} from './events/foundation-events.js';

// Errors
export {
  DomainError,
  DomainValidationError,
  AuthenticationFailedError,
  SessionRevokedError,
  SessionExpiredError,
  RateLimitExceededError,
  CurrentPasswordMismatchError,
  TokenExpiredError,
  TokenAlreadyUsedError,
  MfaRequiredError,
  MfaCodeInvalidError,
  TenantIsolationError,
  InsufficientScopeError,
  EntityNotFoundError,
  EntityBlockedError,
  InvalidStatusTransitionError,
} from './errors/domain-errors.js';
