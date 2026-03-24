/**
 * @contract DATA-007 (ERD), DOC-FND-000
 *
 * Drizzle ORM relations for the Contextual Params module (MOD-007).
 * Enables the relational query builder (db.query.contextFramerTypes.findMany({ with: ... })).
 */

import { relations } from 'drizzle-orm';
import {
  contextFramerTypes,
  contextFramers,
  targetObjects,
  targetFields,
  incidenceRules,
  behaviorRoutines,
  routineItems,
  routineIncidenceLinks,
  routineVersionHistory,
} from './contextual-params.js';
import { users, tenants } from './foundation.js';

// ---------------------------------------------------------------------------
// context_framer_types relations
// ---------------------------------------------------------------------------
export const contextFramerTypesRelations = relations(contextFramerTypes, ({ one, many }) => ({
  /** N:1 — tenant (multi-tenant isolation) */
  tenant: one(tenants, {
    fields: [contextFramerTypes.tenantId],
    references: [tenants.id],
  }),
  /** N:1 — creator */
  createdByUser: one(users, {
    fields: [contextFramerTypes.createdBy],
    references: [users.id],
  }),
  /** 1:N — enquadradores deste tipo */
  framers: many(contextFramers),
}));

// ---------------------------------------------------------------------------
// context_framers relations
// ---------------------------------------------------------------------------
export const contextFramersRelations = relations(contextFramers, ({ one, many }) => ({
  /** N:1 — tipo de enquadrador */
  framerType: one(contextFramerTypes, {
    fields: [contextFramers.framerTypeId],
    references: [contextFramerTypes.id],
  }),
  /** N:1 — tenant */
  tenant: one(tenants, {
    fields: [contextFramers.tenantId],
    references: [tenants.id],
  }),
  /** N:1 — creator */
  createdByUser: one(users, {
    fields: [contextFramers.createdBy],
    references: [users.id],
  }),
  /** 1:N — regras de incidência vinculadas */
  incidenceRules: many(incidenceRules),
}));

// ---------------------------------------------------------------------------
// target_objects relations
// ---------------------------------------------------------------------------
export const targetObjectsRelations = relations(targetObjects, ({ one, many }) => ({
  /** N:1 — tenant */
  tenant: one(tenants, {
    fields: [targetObjects.tenantId],
    references: [tenants.id],
  }),
  /** 1:N — campos deste objeto */
  fields: many(targetFields),
  /** 1:N — regras de incidência vinculadas */
  incidenceRules: many(incidenceRules),
}));

// ---------------------------------------------------------------------------
// target_fields relations
// ---------------------------------------------------------------------------
export const targetFieldsRelations = relations(targetFields, ({ one, many }) => ({
  /** N:1 — objeto-alvo pai */
  targetObject: one(targetObjects, {
    fields: [targetFields.targetObjectId],
    references: [targetObjects.id],
  }),
  /** N:1 — tenant */
  tenant: one(tenants, {
    fields: [targetFields.tenantId],
    references: [tenants.id],
  }),
  /** 1:N — itens de rotina que referenciam este campo */
  routineItems: many(routineItems),
}));

// ---------------------------------------------------------------------------
// incidence_rules relations
// ---------------------------------------------------------------------------
export const incidenceRulesRelations = relations(incidenceRules, ({ one, many }) => ({
  /** N:1 — enquadrador vinculado */
  framer: one(contextFramers, {
    fields: [incidenceRules.framerId],
    references: [contextFramers.id],
  }),
  /** N:1 — objeto-alvo vinculado */
  targetObject: one(targetObjects, {
    fields: [incidenceRules.targetObjectId],
    references: [targetObjects.id],
  }),
  /** N:1 — tenant */
  tenant: one(tenants, {
    fields: [incidenceRules.tenantId],
    references: [tenants.id],
  }),
  /** N:1 — creator */
  createdByUser: one(users, {
    fields: [incidenceRules.createdBy],
    references: [users.id],
  }),
  /** 1:N — links para rotinas PUBLISHED */
  routineLinks: many(routineIncidenceLinks),
}));

// ---------------------------------------------------------------------------
// behavior_routines relations (Aggregate Root)
// ---------------------------------------------------------------------------
export const behaviorRoutinesRelations = relations(behaviorRoutines, ({ one, many }) => ({
  /** N:1 — parent routine (fork chain) */
  parentRoutine: one(behaviorRoutines, {
    fields: [behaviorRoutines.parentRoutineId],
    references: [behaviorRoutines.id],
    relationName: 'routineForkChain',
  }),
  /** 1:N — forked versions */
  forkedVersions: many(behaviorRoutines, {
    relationName: 'routineForkChain',
  }),
  /** N:1 — user who published */
  approvedByUser: one(users, {
    fields: [behaviorRoutines.approvedBy],
    references: [users.id],
    relationName: 'routineApprover',
  }),
  /** N:1 — creator */
  createdByUser: one(users, {
    fields: [behaviorRoutines.createdBy],
    references: [users.id],
    relationName: 'routineCreator',
  }),
  /** N:1 — tenant */
  tenant: one(tenants, {
    fields: [behaviorRoutines.tenantId],
    references: [tenants.id],
  }),
  /** 1:N — itens parametrizáveis */
  items: many(routineItems),
  /** 1:N — links para regras de incidência */
  incidenceLinks: many(routineIncidenceLinks),
  /** 1:N — histórico de versões (como nova versão) */
  versionHistory: many(routineVersionHistory, {
    relationName: 'routineNewVersion',
  }),
  /** 1:N — histórico de versões (como versão anterior) */
  previousVersionHistory: many(routineVersionHistory, {
    relationName: 'routinePreviousVersion',
  }),
}));

// ---------------------------------------------------------------------------
// routine_items relations
// ---------------------------------------------------------------------------
export const routineItemsRelations = relations(routineItems, ({ one }) => ({
  /** N:1 — rotina pai */
  routine: one(behaviorRoutines, {
    fields: [routineItems.routineId],
    references: [behaviorRoutines.id],
  }),
  /** N:1 — campo-alvo (nullable) */
  targetField: one(targetFields, {
    fields: [routineItems.targetFieldId],
    references: [targetFields.id],
  }),
}));

// ---------------------------------------------------------------------------
// routine_incidence_links relations
// ---------------------------------------------------------------------------
export const routineIncidenceLinksRelations = relations(routineIncidenceLinks, ({ one }) => ({
  /** N:1 — rotina PUBLISHED */
  routine: one(behaviorRoutines, {
    fields: [routineIncidenceLinks.routineId],
    references: [behaviorRoutines.id],
  }),
  /** N:1 — regra de incidência */
  incidenceRule: one(incidenceRules, {
    fields: [routineIncidenceLinks.incidenceRuleId],
    references: [incidenceRules.id],
  }),
}));

// ---------------------------------------------------------------------------
// routine_version_history relations
// ---------------------------------------------------------------------------
export const routineVersionHistoryRelations = relations(routineVersionHistory, ({ one }) => ({
  /** N:1 — nova versão (rotina criada pelo fork) */
  routine: one(behaviorRoutines, {
    fields: [routineVersionHistory.routineId],
    references: [behaviorRoutines.id],
    relationName: 'routineNewVersion',
  }),
  /** N:1 — versão anterior (rotina original) */
  previousVersion: one(behaviorRoutines, {
    fields: [routineVersionHistory.previousVersionId],
    references: [behaviorRoutines.id],
    relationName: 'routinePreviousVersion',
  }),
  /** N:1 — user who forked */
  changedByUser: one(users, {
    fields: [routineVersionHistory.changedBy],
    references: [users.id],
  }),
}));
