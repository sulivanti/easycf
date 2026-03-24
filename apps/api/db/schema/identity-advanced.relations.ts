/**
 * @contract DATA-001 (ERD), DOC-FND-000
 *
 * Drizzle ORM relations for the Identity Advanced module (MOD-004).
 * Enables the relational query builder (db.query.userOrgScopes.findMany({ with: ... })).
 */

import { relations } from 'drizzle-orm';
import { userOrgScopes, accessShares, accessDelegations } from './identity-advanced.js';
import { users, tenants, roles } from './foundation.js';
import { orgUnits } from './org-units.js';

// ---------------------------------------------------------------------------
// user_org_scopes relations
// ---------------------------------------------------------------------------
export const userOrgScopesRelations = relations(userOrgScopes, ({ one }) => ({
  /** N:1 — tenant (RLS) */
  tenant: one(tenants, {
    fields: [userOrgScopes.tenantId],
    references: [tenants.id],
  }),
  /** N:1 — usuário vinculado */
  user: one(users, {
    fields: [userOrgScopes.userId],
    references: [users.id],
    relationName: 'userOrgScopeUser',
  }),
  /** N:1 — nó organizacional */
  orgUnit: one(orgUnits, {
    fields: [userOrgScopes.orgUnitId],
    references: [orgUnits.id],
  }),
  /** N:1 — admin que concedeu */
  grantedByUser: one(users, {
    fields: [userOrgScopes.grantedBy],
    references: [users.id],
    relationName: 'userOrgScopeGrantedBy',
  }),
}));

// ---------------------------------------------------------------------------
// access_shares relations
// ---------------------------------------------------------------------------
export const accessSharesRelations = relations(accessShares, ({ one }) => ({
  /** N:1 — tenant (RLS) */
  tenant: one(tenants, {
    fields: [accessShares.tenantId],
    references: [tenants.id],
  }),
  /** N:1 — quem compartilha */
  grantor: one(users, {
    fields: [accessShares.grantorId],
    references: [users.id],
    relationName: 'accessShareGrantor',
  }),
  /** N:1 — quem recebe */
  grantee: one(users, {
    fields: [accessShares.granteeId],
    references: [users.id],
    relationName: 'accessShareGrantee',
  }),
  /** N:1 — aprovador */
  authorizedByUser: one(users, {
    fields: [accessShares.authorizedBy],
    references: [users.id],
    relationName: 'accessShareAuthorizedBy',
  }),
  /** N:1 — quem revogou */
  revokedByUser: one(users, {
    fields: [accessShares.revokedBy],
    references: [users.id],
    relationName: 'accessShareRevokedBy',
  }),
}));

// ---------------------------------------------------------------------------
// access_delegations relations
// ---------------------------------------------------------------------------
export const accessDelegationsRelations = relations(accessDelegations, ({ one }) => ({
  /** N:1 — tenant (RLS) */
  tenant: one(tenants, {
    fields: [accessDelegations.tenantId],
    references: [tenants.id],
  }),
  /** N:1 — quem delega */
  delegator: one(users, {
    fields: [accessDelegations.delegatorId],
    references: [users.id],
    relationName: 'accessDelegationDelegator',
  }),
  /** N:1 — quem recebe */
  delegatee: one(users, {
    fields: [accessDelegations.delegateeId],
    references: [users.id],
    relationName: 'accessDelegationDelegatee',
  }),
  /** N:1 — role base (opcional) */
  role: one(roles, {
    fields: [accessDelegations.roleId],
    references: [roles.id],
  }),
  /** N:1 — escopo org (opcional) */
  orgUnit: one(orgUnits, {
    fields: [accessDelegations.orgUnitId],
    references: [orgUnits.id],
  }),
}));
