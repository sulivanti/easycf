/**
 * @contract DATA-006, ADR-003
 *
 * Drizzle ORM relations for the Case Execution module (MOD-006).
 * Defines relational queries between the 5 case execution tables
 * and cross-module references (MOD-000, MOD-003, MOD-004, MOD-005).
 */

import { relations } from 'drizzle-orm';
import {
  caseInstances,
  stageHistory,
  gateInstances,
  caseAssignments,
  caseEvents,
} from './case-execution.js';
import { users, tenants } from './foundation.js';
import { orgUnits } from './org-units.js';
import { accessDelegations } from './identity-advanced.js';
import {
  processCycles,
  processStages,
  processGates,
  processRoles,
  stageTransitions,
} from './process-modeling.js';

// ---------------------------------------------------------------------------
// case_instances relations
// ---------------------------------------------------------------------------
export const caseInstancesRelations = relations(caseInstances, ({ one, many }) => ({
  // FK → MOD-005 (blueprint)
  cycle: one(processCycles, {
    fields: [caseInstances.cycleId],
    references: [processCycles.id],
    relationName: 'caseInstanceCycle',
  }),
  cycleVersion: one(processCycles, {
    fields: [caseInstances.cycleVersionId],
    references: [processCycles.id],
    relationName: 'caseInstanceCycleVersion',
  }),
  currentStage: one(processStages, {
    fields: [caseInstances.currentStageId],
    references: [processStages.id],
  }),

  // FK → MOD-000 (foundation)
  openedByUser: one(users, {
    fields: [caseInstances.openedBy],
    references: [users.id],
    relationName: 'caseInstanceOpenedBy',
  }),
  tenant: one(tenants, {
    fields: [caseInstances.tenantId],
    references: [tenants.id],
  }),

  // FK → MOD-003 (org structure)
  orgUnit: one(orgUnits, {
    fields: [caseInstances.orgUnitId],
    references: [orgUnits.id],
  }),

  // Children (1:N)
  stageHistoryEntries: many(stageHistory),
  gateInstanceEntries: many(gateInstances),
  assignments: many(caseAssignments),
  events: many(caseEvents),
}));

// ---------------------------------------------------------------------------
// stage_history relations
// ---------------------------------------------------------------------------
export const stageHistoryRelations = relations(stageHistory, ({ one }) => ({
  case: one(caseInstances, {
    fields: [stageHistory.caseId],
    references: [caseInstances.id],
  }),
  fromStage: one(processStages, {
    fields: [stageHistory.fromStageId],
    references: [processStages.id],
    relationName: 'stageHistoryFromStage',
  }),
  toStage: one(processStages, {
    fields: [stageHistory.toStageId],
    references: [processStages.id],
    relationName: 'stageHistoryToStage',
  }),
  transition: one(stageTransitions, {
    fields: [stageHistory.transitionId],
    references: [stageTransitions.id],
  }),
  transitionedByUser: one(users, {
    fields: [stageHistory.transitionedBy],
    references: [users.id],
    relationName: 'stageHistoryTransitionedBy',
  }),
}));

// ---------------------------------------------------------------------------
// gate_instances relations
// ---------------------------------------------------------------------------
export const gateInstancesRelations = relations(gateInstances, ({ one }) => ({
  case: one(caseInstances, {
    fields: [gateInstances.caseId],
    references: [caseInstances.id],
  }),
  gate: one(processGates, {
    fields: [gateInstances.gateId],
    references: [processGates.id],
  }),
  stage: one(processStages, {
    fields: [gateInstances.stageId],
    references: [processStages.id],
  }),
  resolvedByUser: one(users, {
    fields: [gateInstances.resolvedBy],
    references: [users.id],
    relationName: 'gateInstanceResolvedBy',
  }),
}));

// ---------------------------------------------------------------------------
// case_assignments relations
// ---------------------------------------------------------------------------
export const caseAssignmentsRelations = relations(caseAssignments, ({ one }) => ({
  case: one(caseInstances, {
    fields: [caseAssignments.caseId],
    references: [caseInstances.id],
  }),
  stage: one(processStages, {
    fields: [caseAssignments.stageId],
    references: [processStages.id],
  }),
  processRole: one(processRoles, {
    fields: [caseAssignments.processRoleId],
    references: [processRoles.id],
  }),
  user: one(users, {
    fields: [caseAssignments.userId],
    references: [users.id],
    relationName: 'caseAssignmentUser',
  }),
  assignedByUser: one(users, {
    fields: [caseAssignments.assignedBy],
    references: [users.id],
    relationName: 'caseAssignmentAssignedBy',
  }),
  delegation: one(accessDelegations, {
    fields: [caseAssignments.delegationId],
    references: [accessDelegations.id],
  }),
}));

// ---------------------------------------------------------------------------
// case_events relations
// ---------------------------------------------------------------------------
export const caseEventsRelations = relations(caseEvents, ({ one }) => ({
  case: one(caseInstances, {
    fields: [caseEvents.caseId],
    references: [caseInstances.id],
  }),
  stage: one(processStages, {
    fields: [caseEvents.stageId],
    references: [processStages.id],
  }),
  createdByUser: one(users, {
    fields: [caseEvents.createdBy],
    references: [users.id],
    relationName: 'caseEventCreatedBy',
  }),
}));
