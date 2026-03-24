// Barrel export — public interface of module foundation (MOD-000)

export * from './domain/index.js';
export * from './application/index.js';

// Presentation (no barrel — re-export routes individually)
export { authRoutes } from './presentation/routes/auth.route.js';
export { infoRoute } from './presentation/routes/info.route.js';
export { rolesRoutes } from './presentation/routes/roles.route.js';
export { tenantsRoutes } from './presentation/routes/tenants.route.js';
export { usersRoutes } from './presentation/routes/users.route.js';
export { foundationErrorHandler } from './presentation/error-handler.js';
