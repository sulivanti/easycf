/**
 * @contract DATA-008
 *
 * Drizzle ORM relations for the Integration Protheus module (MOD-008).
 * Defines relational queries between the 6 integration tables
 * and cross-module references (MOD-000, MOD-006, MOD-007).
 */

import { relations } from 'drizzle-orm';
import {
  integrationServices,
  integrationRoutines,
  integrationFieldMappings,
  integrationParams,
  integrationCallLogs,
  integrationReprocessRequests,
} from './integration-protheus.js';
import { users, tenants } from './foundation.js';
import { behaviorRoutines } from './contextual-params.js';
import { caseInstances, caseEvents } from './case-execution.js';

// ---------------------------------------------------------------------------
// integration_services relations
// ---------------------------------------------------------------------------
export const integrationServicesRelations = relations(integrationServices, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [integrationServices.tenantId],
    references: [tenants.id],
  }),
  createdByUser: one(users, {
    fields: [integrationServices.createdBy],
    references: [users.id],
    relationName: 'integrationServiceCreatedBy',
  }),

  // Children (1:N)
  routines: many(integrationRoutines),
}));

// ---------------------------------------------------------------------------
// integration_routines relations
// ---------------------------------------------------------------------------
export const integrationRoutinesRelations = relations(integrationRoutines, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [integrationRoutines.tenantId],
    references: [tenants.id],
  }),

  // FK → MOD-007 (behavior_routines — extensão 1:1)
  routine: one(behaviorRoutines, {
    fields: [integrationRoutines.routineId],
    references: [behaviorRoutines.id],
  }),

  // FK → integration_services
  service: one(integrationServices, {
    fields: [integrationRoutines.serviceId],
    references: [integrationServices.id],
  }),

  // Children (1:N)
  fieldMappings: many(integrationFieldMappings),
  params: many(integrationParams),
  callLogs: many(integrationCallLogs),
}));

// ---------------------------------------------------------------------------
// integration_field_mappings relations
// ---------------------------------------------------------------------------
export const integrationFieldMappingsRelations = relations(integrationFieldMappings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [integrationFieldMappings.tenantId],
    references: [tenants.id],
  }),

  // FK → MOD-007 (behavior_routines)
  routine: one(behaviorRoutines, {
    fields: [integrationFieldMappings.routineId],
    references: [behaviorRoutines.id],
    relationName: 'fieldMappingRoutine',
  }),
}));

// ---------------------------------------------------------------------------
// integration_params relations
// ---------------------------------------------------------------------------
export const integrationParamsRelations = relations(integrationParams, ({ one }) => ({
  tenant: one(tenants, {
    fields: [integrationParams.tenantId],
    references: [tenants.id],
  }),

  // FK → MOD-007 (behavior_routines)
  routine: one(behaviorRoutines, {
    fields: [integrationParams.routineId],
    references: [behaviorRoutines.id],
    relationName: 'integrationParamRoutine',
  }),
}));

// ---------------------------------------------------------------------------
// integration_call_logs relations
// ---------------------------------------------------------------------------
export const integrationCallLogsRelations = relations(integrationCallLogs, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [integrationCallLogs.tenantId],
    references: [tenants.id],
  }),

  // FK → MOD-007 (behavior_routines)
  routine: one(behaviorRoutines, {
    fields: [integrationCallLogs.routineId],
    references: [behaviorRoutines.id],
    relationName: 'callLogRoutine',
  }),

  // FK → MOD-006 (case execution)
  case: one(caseInstances, {
    fields: [integrationCallLogs.caseId],
    references: [caseInstances.id],
  }),
  caseEvent: one(caseEvents, {
    fields: [integrationCallLogs.caseEventId],
    references: [caseEvents.id],
  }),

  // Self-referencing FK (chain de reprocessamento)
  parentLog: one(integrationCallLogs, {
    fields: [integrationCallLogs.parentLogId],
    references: [integrationCallLogs.id],
    relationName: 'callLogReprocessChain',
  }),
  childLogs: many(integrationCallLogs, {
    relationName: 'callLogReprocessChain',
  }),

  // FK → MOD-000 (users)
  reprocessedByUser: one(users, {
    fields: [integrationCallLogs.reprocessedBy],
    references: [users.id],
    relationName: 'callLogReprocessedBy',
  }),

  // Children (1:N)
  reprocessRequests: many(integrationReprocessRequests),
}));

// ---------------------------------------------------------------------------
// integration_reprocess_requests relations
// ---------------------------------------------------------------------------
export const integrationReprocessRequestsRelations = relations(
  integrationReprocessRequests,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [integrationReprocessRequests.tenantId],
      references: [tenants.id],
    }),

    // FK → integration_call_logs (original)
    originalLog: one(integrationCallLogs, {
      fields: [integrationReprocessRequests.originalLogId],
      references: [integrationCallLogs.id],
      relationName: 'reprocessOriginalLog',
    }),

    // FK → integration_call_logs (new attempt)
    newLog: one(integrationCallLogs, {
      fields: [integrationReprocessRequests.newLogId],
      references: [integrationCallLogs.id],
      relationName: 'reprocessNewLog',
    }),

    // FK → MOD-000 (users)
    requestedByUser: one(users, {
      fields: [integrationReprocessRequests.requestedBy],
      references: [users.id],
      relationName: 'reprocessRequestedBy',
    }),
  }),
);
