/**
 * @contract DATA-000 (ERD), DOC-FND-000
 *
 * Drizzle ORM relations for the Foundation module.
 * Enables the relational query builder (db.query.users.findMany({ with: ... })).
 */

import { relations } from 'drizzle-orm';
import {
  users,
  contentUsers,
  userSessions,
  tenants,
  roles,
  rolePermissions,
  tenantUsers,
  domainEvents,
} from './foundation.js';

// ---------------------------------------------------------------------------
// users relations
// ---------------------------------------------------------------------------
export const usersRelations = relations(users, ({ one, many }) => ({
  /** 1:1 — perfil de exibição */
  content: one(contentUsers, {
    fields: [users.id],
    references: [contentUsers.userId],
  }),
  /** 1:N — sessões do usuário */
  sessions: many(userSessions),
  /** M:N — vínculos com tenants (pivot) */
  tenantUsers: many(tenantUsers),
}));

// ---------------------------------------------------------------------------
// content_users relations
// ---------------------------------------------------------------------------
export const contentUsersRelations = relations(contentUsers, ({ one }) => ({
  /** 1:1 — usuário proprietário */
  user: one(users, {
    fields: [contentUsers.userId],
    references: [users.id],
  }),
}));

// ---------------------------------------------------------------------------
// user_sessions relations
// ---------------------------------------------------------------------------
export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  /** N:1 — usuário da sessão */
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

// ---------------------------------------------------------------------------
// tenants relations
// ---------------------------------------------------------------------------
export const tenantsRelations = relations(tenants, ({ many }) => ({
  /** 1:N — usuários vinculados */
  tenantUsers: many(tenantUsers),
}));

// ---------------------------------------------------------------------------
// roles relations
// ---------------------------------------------------------------------------
export const rolesRelations = relations(roles, ({ many }) => ({
  /** 1:N — permissões (scopes) atribuídas */
  permissions: many(rolePermissions),
  /** 1:N — vínculos tenant_users que usam esta role */
  tenantUsers: many(tenantUsers),
}));

// ---------------------------------------------------------------------------
// role_permissions relations
// ---------------------------------------------------------------------------
export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  /** N:1 — role proprietária */
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
}));

// ---------------------------------------------------------------------------
// tenant_users relations
// ---------------------------------------------------------------------------
export const tenantUsersRelations = relations(tenantUsers, ({ one }) => ({
  /** N:1 — usuário */
  user: one(users, {
    fields: [tenantUsers.userId],
    references: [users.id],
  }),
  /** N:1 — tenant/filial */
  tenant: one(tenants, {
    fields: [tenantUsers.tenantId],
    references: [tenants.id],
  }),
  /** N:1 — role atribuída */
  role: one(roles, {
    fields: [tenantUsers.roleId],
    references: [roles.id],
  }),
}));

// ---------------------------------------------------------------------------
// domain_events relations (sem FKs — lookup references apenas)
// ---------------------------------------------------------------------------
export const domainEventsRelations = relations(domainEvents, () => ({
  // domain_events não possui FKs formais.
  // tenant_id é usado para isolamento mas sem FK (performance/particionamento).
}));
