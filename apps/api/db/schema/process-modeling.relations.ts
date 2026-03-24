/**
 * @contract DATA-005 (ERD), DOC-FND-000
 *
 * Drizzle ORM relations for the Process Modeling module (MOD-005).
 * Enables the relational query builder (db.query.processCycles.findMany({ with: ... })).
 */

import { relations } from 'drizzle-orm';
import {
  processCycles,
  processMacroStages,
  processStages,
  processGates,
  processRoles,
  stageRoleLinks,
  stageTransitions,
} from './process-modeling.js';
import { users, tenants } from './foundation.js';

// ---------------------------------------------------------------------------
// process_cycles relations
// ---------------------------------------------------------------------------
export const processCyclesRelations = relations(processCycles, ({ one, many }) => ({
  /** N:1 — tenant (multi-tenant isolation) */
  tenant: one(tenants, {
    fields: [processCycles.tenantId],
    references: [tenants.id],
  }),
  /** N:1 — creator */
  createdByUser: one(users, {
    fields: [processCycles.createdBy],
    references: [users.id],
  }),
  /** N:1 — parent cycle (fork chain) */
  parentCycle: one(processCycles, {
    fields: [processCycles.parentCycleId],
    references: [processCycles.id],
    relationName: 'cycleForkChain',
  }),
  /** 1:N — forked versions */
  forkedVersions: many(processCycles, {
    relationName: 'cycleForkChain',
  }),
  /** 1:N — macroetapas do ciclo */
  macroStages: many(processMacroStages),
  /** 1:N — estágios (denormalized cycle_id, ADR-001) */
  stages: many(processStages),
}));

// ---------------------------------------------------------------------------
// process_macro_stages relations
// ---------------------------------------------------------------------------
export const processMacroStagesRelations = relations(processMacroStages, ({ one, many }) => ({
  /** N:1 — ciclo proprietário */
  cycle: one(processCycles, {
    fields: [processMacroStages.cycleId],
    references: [processCycles.id],
  }),
  /** N:1 — creator */
  createdByUser: one(users, {
    fields: [processMacroStages.createdBy],
    references: [users.id],
  }),
  /** 1:N — estágios da macroetapa */
  stages: many(processStages),
}));

// ---------------------------------------------------------------------------
// process_stages relations
// ---------------------------------------------------------------------------
export const processStagesRelations = relations(processStages, ({ one, many }) => ({
  /** N:1 — macroetapa proprietária */
  macroStage: one(processMacroStages, {
    fields: [processStages.macroStageId],
    references: [processMacroStages.id],
  }),
  /** N:1 — ciclo (denormalized, ADR-001) */
  cycle: one(processCycles, {
    fields: [processStages.cycleId],
    references: [processCycles.id],
  }),
  /** N:1 — creator */
  createdByUser: one(users, {
    fields: [processStages.createdBy],
    references: [users.id],
  }),
  /** 1:N — gates do estágio */
  gates: many(processGates),
  /** 1:N — vínculos de papéis */
  roleLinks: many(stageRoleLinks),
  /** 1:N — transições de saída */
  transitionsOut: many(stageTransitions, {
    relationName: 'stageTransitionFrom',
  }),
  /** 1:N — transições de entrada */
  transitionsIn: many(stageTransitions, {
    relationName: 'stageTransitionTo',
  }),
}));

// ---------------------------------------------------------------------------
// process_gates relations
// ---------------------------------------------------------------------------
export const processGatesRelations = relations(processGates, ({ one }) => ({
  /** N:1 — estágio proprietário */
  stage: one(processStages, {
    fields: [processGates.stageId],
    references: [processStages.id],
  }),
  /** N:1 — creator */
  createdByUser: one(users, {
    fields: [processGates.createdBy],
    references: [users.id],
  }),
}));

// ---------------------------------------------------------------------------
// process_roles relations
// ---------------------------------------------------------------------------
export const processRolesRelations = relations(processRoles, ({ one, many }) => ({
  /** N:1 — tenant */
  tenant: one(tenants, {
    fields: [processRoles.tenantId],
    references: [tenants.id],
  }),
  /** N:1 — creator */
  createdByUser: one(users, {
    fields: [processRoles.createdBy],
    references: [users.id],
  }),
  /** 1:N — vínculos com estágios */
  stageLinks: many(stageRoleLinks),
}));

// ---------------------------------------------------------------------------
// stage_role_links relations
// ---------------------------------------------------------------------------
export const stageRoleLinksRelations = relations(stageRoleLinks, ({ one }) => ({
  /** N:1 — estágio */
  stage: one(processStages, {
    fields: [stageRoleLinks.stageId],
    references: [processStages.id],
  }),
  /** N:1 — papel de processo */
  role: one(processRoles, {
    fields: [stageRoleLinks.roleId],
    references: [processRoles.id],
  }),
  /** N:1 — creator */
  createdByUser: one(users, {
    fields: [stageRoleLinks.createdBy],
    references: [users.id],
  }),
}));

// ---------------------------------------------------------------------------
// stage_transitions relations
// ---------------------------------------------------------------------------
export const stageTransitionsRelations = relations(stageTransitions, ({ one }) => ({
  /** N:1 — estágio de origem */
  fromStage: one(processStages, {
    fields: [stageTransitions.fromStageId],
    references: [processStages.id],
    relationName: 'stageTransitionFrom',
  }),
  /** N:1 — estágio de destino */
  toStage: one(processStages, {
    fields: [stageTransitions.toStageId],
    references: [processStages.id],
    relationName: 'stageTransitionTo',
  }),
  /** N:1 — creator */
  createdByUser: one(users, {
    fields: [stageTransitions.createdBy],
    references: [users.id],
  }),
}));
