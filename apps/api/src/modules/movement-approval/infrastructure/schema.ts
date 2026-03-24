/**
 * @contract DATA-009, DOC-FND-000
 *
 * Module-level re-export of Movement Approval Drizzle tables with inferred
 * TypeScript types and Zod validation schemas for use in domain/application layers.
 *
 * Usage:
 *   import { type SelectControlledMovement, insertControlledMovementSchema, controlledMovements } from "@modules/movement-approval/infrastructure/schema.js";
 */

import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Re-export tables for direct usage
export {
  movementControlRules,
  approvalRules,
  controlledMovements,
  approvalInstances,
  movementExecutions,
  movementHistory,
  movementOverrideLog,
} from '../../../../db/schema/movement-approval.js';

// Re-export relations
export {
  movementControlRulesRelations,
  approvalRulesRelations,
  controlledMovementsRelations,
  approvalInstancesRelations,
  movementExecutionsRelations,
  movementHistoryRelations,
  movementOverrideLogRelations,
} from '../../../../db/schema/movement-approval.relations.js';

// ---------------------------------------------------------------------------
// Inferred Types — Select (read from DB)
// ---------------------------------------------------------------------------
import {
  movementControlRules,
  approvalRules,
  controlledMovements,
  approvalInstances,
  movementExecutions,
  movementHistory,
  movementOverrideLog,
} from '../../../../db/schema/movement-approval.js';

export type SelectMovementControlRule = InferSelectModel<typeof movementControlRules>;
export type SelectApprovalRule = InferSelectModel<typeof approvalRules>;
export type SelectControlledMovement = InferSelectModel<typeof controlledMovements>;
export type SelectApprovalInstance = InferSelectModel<typeof approvalInstances>;
export type SelectMovementExecution = InferSelectModel<typeof movementExecutions>;
export type SelectMovementHistory = InferSelectModel<typeof movementHistory>;
export type SelectMovementOverrideLog = InferSelectModel<typeof movementOverrideLog>;

// ---------------------------------------------------------------------------
// Inferred Types — Insert (write to DB)
// ---------------------------------------------------------------------------
export type InsertMovementControlRule = InferInsertModel<typeof movementControlRules>;
export type InsertApprovalRule = InferInsertModel<typeof approvalRules>;
export type InsertControlledMovement = InferInsertModel<typeof controlledMovements>;
export type InsertApprovalInstance = InferInsertModel<typeof approvalInstances>;
export type InsertMovementExecution = InferInsertModel<typeof movementExecutions>;
export type InsertMovementHistory = InferInsertModel<typeof movementHistory>;
export type InsertMovementOverrideLog = InferInsertModel<typeof movementOverrideLog>;

// ---------------------------------------------------------------------------
// Zod Validation Schemas — Insert (validate-drizzle Rule 3)
// ---------------------------------------------------------------------------
export const insertMovementControlRuleSchema = createInsertSchema(movementControlRules);
export const insertApprovalRuleSchema = createInsertSchema(approvalRules);
export const insertControlledMovementSchema = createInsertSchema(controlledMovements);
export const insertApprovalInstanceSchema = createInsertSchema(approvalInstances);
export const insertMovementExecutionSchema = createInsertSchema(movementExecutions);
export const insertMovementHistorySchema = createInsertSchema(movementHistory);
export const insertMovementOverrideLogSchema = createInsertSchema(movementOverrideLog);

// ---------------------------------------------------------------------------
// Zod Validation Schemas — Select (for API response typing)
// ---------------------------------------------------------------------------
export const selectMovementControlRuleSchema = createSelectSchema(movementControlRules);
export const selectApprovalRuleSchema = createSelectSchema(approvalRules);
export const selectControlledMovementSchema = createSelectSchema(controlledMovements);
export const selectApprovalInstanceSchema = createSelectSchema(approvalInstances);
export const selectMovementExecutionSchema = createSelectSchema(movementExecutions);
export const selectMovementHistorySchema = createSelectSchema(movementHistory);
export const selectMovementOverrideLogSchema = createSelectSchema(movementOverrideLog);

// ---------------------------------------------------------------------------
// Status literal types (derived from DATA-009 CHECK constraints)
// ---------------------------------------------------------------------------
export type ControlRuleStatus = 'ACTIVE' | 'INACTIVE';
export type CriteriaType = 'VALUE' | 'HIERARCHY' | 'ORIGIN' | 'OBJECT';
export type OriginType = 'HUMAN' | 'API' | 'MCP' | 'AGENT';
export type ApproverType = 'ROLE' | 'USER' | 'SCOPE';
export type MovementStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'AUTO_APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'OVERRIDDEN'
  | 'EXECUTED'
  | 'FAILED';
export type ApprovalInstanceStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'TIMEOUT' | 'ESCALATED';
export type ExecutionStatus = 'SUCCESS' | 'FAILED';
