/**
 * @contract DATA-009 (ERD), DOC-FND-000
 *
 * Drizzle ORM relations for the Movement Approval module (MOD-009).
 * Enables the relational query builder (db.query.movementControlRules.findMany({ with: ... })).
 */

import { relations } from 'drizzle-orm';
import {
  movementControlRules,
  approvalRules,
  controlledMovements,
  approvalInstances,
  movementExecutions,
  movementHistory,
  movementOverrideLog,
} from './movement-approval.js';

// ---------------------------------------------------------------------------
// movementControlRules relations
// ---------------------------------------------------------------------------
export const movementControlRulesRelations = relations(movementControlRules, ({ many }) => ({
  /** 1:N — regras de aprovação vinculadas */
  approvalRules: many(approvalRules),
  /** 1:N — movimentações controladas por esta regra */
  controlledMovements: many(controlledMovements),
}));

// ---------------------------------------------------------------------------
// approvalRules relations
// ---------------------------------------------------------------------------
export const approvalRulesRelations = relations(approvalRules, ({ one }) => ({
  /** N:1 — regra de controle proprietária */
  controlRule: one(movementControlRules, {
    fields: [approvalRules.controlRuleId],
    references: [movementControlRules.id],
  }),
  /** N:1 — regra de escalação (self-ref opcional) */
  escalationRule: one(approvalRules, {
    fields: [approvalRules.escalationRuleId],
    references: [approvalRules.id],
    relationName: 'escalation',
  }),
}));

// ---------------------------------------------------------------------------
// controlledMovements relations
// ---------------------------------------------------------------------------
export const controlledMovementsRelations = relations(controlledMovements, ({ one, many }) => ({
  /** N:1 — regra de controle que gerou a movimentação */
  controlRule: one(movementControlRules, {
    fields: [controlledMovements.controlRuleId],
    references: [movementControlRules.id],
  }),
  /** 1:N — instâncias de aprovação */
  approvalInstances: many(approvalInstances),
  /** 1:N — execuções */
  executions: many(movementExecutions),
  /** 1:N — histórico de eventos */
  history: many(movementHistory),
  /** 1:N — log de overrides */
  overrides: many(movementOverrideLog),
}));

// ---------------------------------------------------------------------------
// approvalInstances relations
// ---------------------------------------------------------------------------
export const approvalInstancesRelations = relations(approvalInstances, ({ one }) => ({
  /** N:1 — movimentação controlada */
  movement: one(controlledMovements, {
    fields: [approvalInstances.movementId],
    references: [controlledMovements.id],
  }),
}));

// ---------------------------------------------------------------------------
// movementExecutions relations
// ---------------------------------------------------------------------------
export const movementExecutionsRelations = relations(movementExecutions, ({ one }) => ({
  /** N:1 — movimentação controlada */
  movement: one(controlledMovements, {
    fields: [movementExecutions.movementId],
    references: [controlledMovements.id],
  }),
}));

// ---------------------------------------------------------------------------
// movementHistory relations
// ---------------------------------------------------------------------------
export const movementHistoryRelations = relations(movementHistory, ({ one }) => ({
  /** N:1 — movimentação controlada */
  movement: one(controlledMovements, {
    fields: [movementHistory.movementId],
    references: [controlledMovements.id],
  }),
}));

// ---------------------------------------------------------------------------
// movementOverrideLog relations
// ---------------------------------------------------------------------------
export const movementOverrideLogRelations = relations(movementOverrideLog, ({ one }) => ({
  /** N:1 — movimentação controlada */
  movement: one(controlledMovements, {
    fields: [movementOverrideLog.movementId],
    references: [controlledMovements.id],
  }),
}));
