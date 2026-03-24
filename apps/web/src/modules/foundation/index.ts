/**
 * @contract MOD-000
 * Foundation module barrel export — types, API clients, hooks, pages.
 */

// Types
export * from './types/index.js';

// API clients
export { httpClient, ApiError } from './api/http-client.js';
export { authApi } from './api/auth.api.js';
export { usersApi } from './api/users.api.js';
export { rolesApi } from './api/roles.api.js';
export { tenantsApi } from './api/tenants.api.js';

// Hooks
export {
  useLogin,
  useLogout,
  useProfile,
  useMfaVerify,
  useMfaSetup,
  useChangePassword,
  useForgotPassword,
  useResetPassword,
  authKeys,
} from './hooks/use-auth.js';
export { useSessions, sessionKeys } from './hooks/use-sessions.js';
export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  userKeys,
} from './hooks/use-users.js';
export {
  useRoles,
  useRole,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  roleKeys,
} from './hooks/use-roles.js';
export {
  useTenants,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
  useTenantUsers,
  tenantKeys,
} from './hooks/use-tenants.js';

// Pages
export { LoginPage } from './pages/login/LoginPage.js';
export { SessionsPage } from './pages/sessions/SessionsPage.js';
export { ProfilePage } from './pages/profile/ProfilePage.js';
export { UsersListPage } from './pages/users/UsersListPage.js';
export { UserFormPage } from './pages/users/UserFormPage.js';
export { RolesPage } from './pages/roles/RolesPage.js';
export { TenantsPage } from './pages/tenants/TenantsPage.js';
