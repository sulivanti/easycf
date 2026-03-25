/**
 * @contract DATA-005, DOC-GNP-00
 *
 * Module-level re-export of Process Modeling Drizzle tables with inferred
 * TypeScript types and Zod validation schemas for use in domain/application layers.
 */

import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Re-export tables for direct usage
export {
  processCycles,
  processMacroStages,
  processStages,
  processGates,
  processRoles,
  stageRoleLinks,
  stageTransitions,
} from '../../../../db/schema/process-modeling.js';

// Re-export relations
export {
  processCyclesRelations,
  processMacroStagesRelations,
  processStagesRelations,
  processGatesRelations,
  processRolesRelations,
  stageRoleLinksRelations,
  stageTransitionsRelations,
} from '../../../../db/schema/process-modeling.relations.js';

// ---------------------------------------------------------------------------
// Inferred Types — Select (read from DB)
// ---------------------------------------------------------------------------
import {
  processCycles,
  processMacroStages,
  processStages,
  processGates,
  processRoles,
  stageRoleLinks,
  stageTransitions,
} from '../../../../db/schema/process-modeling.js';

export type SelectProcessCycle = InferSelectModel<typeof processCycles>;
export type SelectProcessMacroStage = InferSelectModel<typeof processMacroStages>;
export type SelectProcessStage = InferSelectModel<typeof processStages>;
export type SelectProcessGate = InferSelectModel<typeof processGates>;
export type SelectProcessRole = InferSelectModel<typeof processRoles>;
export type SelectStageRoleLink = InferSelectModel<typeof stageRoleLinks>;
export type SelectStageTransition = InferSelectModel<typeof stageTransitions>;

// ---------------------------------------------------------------------------
// Inferred Types — Insert (write to DB)
// ---------------------------------------------------------------------------
export type InsertProcessCycle = InferInsertModel<typeof processCycles>;
export type InsertProcessMacroStage = InferInsertModel<typeof processMacroStages>;
export type InsertProcessStage = InferInsertModel<typeof processStages>;
export type InsertProcessGate = InferInsertModel<typeof processGates>;
export type InsertProcessRole = InferInsertModel<typeof processRoles>;
export type InsertStageRoleLink = InferInsertModel<typeof stageRoleLinks>;
export type InsertStageTransition = InferInsertModel<typeof stageTransitions>;

// ---------------------------------------------------------------------------
// Zod Validation Schemas — Insert (validate-drizzle Rule 3)
// ---------------------------------------------------------------------------
export const insertProcessCycleSchema = createInsertSchema(processCycles);
export const insertProcessMacroStageSchema = createInsertSchema(processMacroStages);
export const insertProcessStageSchema = createInsertSchema(processStages);
export const insertProcessGateSchema = createInsertSchema(processGates);
export const insertProcessRoleSchema = createInsertSchema(processRoles);
export const insertStageRoleLinkSchema = createInsertSchema(stageRoleLinks);
export const insertStageTransitionSchema = createInsertSchema(stageTransitions);

// ---------------------------------------------------------------------------
// Zod Validation Schemas — Select (for API response typing)
// ---------------------------------------------------------------------------
export const selectProcessCycleSchema = createSelectSchema(processCycles);
export const selectProcessMacroStageSchema = createSelectSchema(processMacroStages);
export const selectProcessStageSchema = createSelectSchema(processStages);
export const selectProcessGateSchema = createSelectSchema(processGates);
export const selectProcessRoleSchema = createSelectSchema(processRoles);
export const selectStageRoleLinkSchema = createSelectSchema(stageRoleLinks);
export const selectStageTransitionSchema = createSelectSchema(stageTransitions);

// ---------------------------------------------------------------------------
// Status / Type literal types (derived from DATA-005 CHECK constraints)
// ---------------------------------------------------------------------------
export type { CycleStatus } from '../../process-modeling/domain/value-objects/cycle-status.js';
export type { GateType } from '../../process-modeling/domain/value-objects/gate-type.js';
