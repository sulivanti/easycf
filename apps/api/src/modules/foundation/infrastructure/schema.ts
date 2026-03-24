/**
 * @contract DATA-000, DOC-FND-000
 *
 * Module-level re-export of Foundation Drizzle tables with inferred
 * TypeScript types and Zod validation schemas for use in domain/application layers.
 *
 * Usage:
 *   import { type SelectUser, insertUserSchema, users } from "@modules/foundation/infrastructure/schema.js";
 */

import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Re-export tables for direct usage
export {
  users,
  contentUsers,
  userSessions,
  tenants,
  roles,
  rolePermissions,
  tenantUsers,
  domainEvents,
} from '../../../../db/schema/foundation.js';

// Re-export relations
export {
  usersRelations,
  contentUsersRelations,
  userSessionsRelations,
  tenantsRelations,
  rolesRelations,
  rolePermissionsRelations,
  tenantUsersRelations,
  domainEventsRelations,
} from '../../../../db/schema/foundation.relations.js';

// ---------------------------------------------------------------------------
// Inferred Types — Select (read from DB)
// ---------------------------------------------------------------------------
import {
  users,
  contentUsers,
  userSessions,
  tenants,
  roles,
  rolePermissions,
  tenantUsers,
  domainEvents,
} from '../../../../db/schema/foundation.js';

export type SelectUser = InferSelectModel<typeof users>;
export type SelectContentUser = InferSelectModel<typeof contentUsers>;
export type SelectUserSession = InferSelectModel<typeof userSessions>;
export type SelectTenant = InferSelectModel<typeof tenants>;
export type SelectRole = InferSelectModel<typeof roles>;
export type SelectRolePermission = InferSelectModel<typeof rolePermissions>;
export type SelectTenantUser = InferSelectModel<typeof tenantUsers>;
export type SelectDomainEvent = InferSelectModel<typeof domainEvents>;

// ---------------------------------------------------------------------------
// Inferred Types — Insert (write to DB)
// ---------------------------------------------------------------------------
export type InsertUser = InferInsertModel<typeof users>;
export type InsertContentUser = InferInsertModel<typeof contentUsers>;
export type InsertUserSession = InferInsertModel<typeof userSessions>;
export type InsertTenant = InferInsertModel<typeof tenants>;
export type InsertRole = InferInsertModel<typeof roles>;
export type InsertRolePermission = InferInsertModel<typeof rolePermissions>;
export type InsertTenantUser = InferInsertModel<typeof tenantUsers>;
export type InsertDomainEvent = InferInsertModel<typeof domainEvents>;

// ---------------------------------------------------------------------------
// Zod Validation Schemas — Insert (validate-drizzle Rule 3)
// ---------------------------------------------------------------------------
export const insertUserSchema = createInsertSchema(users);
export const insertContentUserSchema = createInsertSchema(contentUsers);
export const insertUserSessionSchema = createInsertSchema(userSessions);
export const insertTenantSchema = createInsertSchema(tenants);
export const insertRoleSchema = createInsertSchema(roles);
export const insertRolePermissionSchema = createInsertSchema(rolePermissions);
export const insertTenantUserSchema = createInsertSchema(tenantUsers);
export const insertDomainEventSchema = createInsertSchema(domainEvents);

// ---------------------------------------------------------------------------
// Zod Validation Schemas — Select (for API response typing)
// ---------------------------------------------------------------------------
export const selectUserSchema = createSelectSchema(users);
export const selectContentUserSchema = createSelectSchema(contentUsers);
export const selectUserSessionSchema = createSelectSchema(userSessions);
export const selectTenantSchema = createSelectSchema(tenants);
export const selectRoleSchema = createSelectSchema(roles);
export const selectRolePermissionSchema = createSelectSchema(rolePermissions);
export const selectTenantUserSchema = createSelectSchema(tenantUsers);
export const selectDomainEventSchema = createSelectSchema(domainEvents);

// ---------------------------------------------------------------------------
// Status literal types (derived from DATA-000 CHECK constraints)
// ---------------------------------------------------------------------------
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'PENDING' | 'INACTIVE';
export type EntityStatus = 'ACTIVE' | 'BLOCKED' | 'INACTIVE';
export type RoleStatus = 'ACTIVE' | 'INACTIVE';
