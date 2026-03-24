/**
 * @contract FR-000, BR-000, SEC-000
 *
 * Foundation application layer — central re-export.
 */

// Ports
export type {
  UserRepository,
  SessionRepository,
  TenantRepository,
  RoleRepository,
  TenantUserRepository,
  DomainEventRepository,
  PasswordResetTokenRepository,
  UnitOfWork,
  TransactionContext,
  PaginationParams,
  PaginatedResult,
} from './ports/repositories.js';

export type {
  PasswordHashService,
  TokenService,
  TokenPayload,
  TokenPair,
  TempTokenPayload,
  CacheService,
  IdempotencyService,
  IdempotencyResult,
  HashUtilService,
  EmailService,
} from './ports/services.js';

// Use Cases — Auth
export { LoginUseCase } from './use-cases/auth/login.use-case.js';
export type {
  LoginInput,
  LoginOutput,
  LoginMfaOutput,
  LoginResult,
} from './use-cases/auth/login.use-case.js';

export { LogoutUseCase } from './use-cases/auth/logout.use-case.js';
export type { LogoutInput } from './use-cases/auth/logout.use-case.js';

export { RefreshTokenUseCase } from './use-cases/auth/refresh-token.use-case.js';
export type {
  RefreshTokenInput,
  RefreshTokenOutput,
} from './use-cases/auth/refresh-token.use-case.js';

export { ChangePasswordUseCase } from './use-cases/auth/change-password.use-case.js';
export type { ChangePasswordInput } from './use-cases/auth/change-password.use-case.js';

export { ForgotPasswordUseCase } from './use-cases/auth/forgot-password.use-case.js';
export type { ForgotPasswordInput } from './use-cases/auth/forgot-password.use-case.js';

export { ResetPasswordUseCase } from './use-cases/auth/reset-password.use-case.js';
export type { ResetPasswordInput } from './use-cases/auth/reset-password.use-case.js';

export { GetProfileUseCase } from './use-cases/auth/get-profile.use-case.js';
export type { GetProfileInput, ProfileOutput } from './use-cases/auth/get-profile.use-case.js';

export { UpdateProfileUseCase } from './use-cases/auth/update-profile.use-case.js';
export type { UpdateProfileInput } from './use-cases/auth/update-profile.use-case.js';

// Use Cases — Users
export { CreateUserUseCase } from './use-cases/users/create-user.use-case.js';
export type { CreateUserInput, CreateUserOutput } from './use-cases/users/create-user.use-case.js';

export { DeleteUserUseCase } from './use-cases/users/delete-user.use-case.js';
export type { DeleteUserInput } from './use-cases/users/delete-user.use-case.js';

// Use Cases — Roles
export { CreateRoleUseCase } from './use-cases/roles/create-role.use-case.js';
export type { CreateRoleInput, CreateRoleOutput } from './use-cases/roles/create-role.use-case.js';

export { UpdateRoleUseCase } from './use-cases/roles/update-role.use-case.js';
export type { UpdateRoleInput } from './use-cases/roles/update-role.use-case.js';

// Use Cases — Tenants
export { CreateTenantUseCase } from './use-cases/tenants/create-tenant.use-case.js';
export type {
  CreateTenantInput,
  CreateTenantOutput,
} from './use-cases/tenants/create-tenant.use-case.js';

// Use Cases — Tenant Users
export { AddTenantUserUseCase } from './use-cases/tenant-users/add-tenant-user.use-case.js';
export type { AddTenantUserInput } from './use-cases/tenant-users/add-tenant-user.use-case.js';
