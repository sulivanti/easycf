/**
 * @contract DATA-010 (ERD), DOC-FND-000
 *
 * Drizzle ORM relations for the MCP Automation module (MOD-010).
 * Enables the relational query builder (db.query.mcpAgents.findMany({ with: ... })).
 */

import { relations } from 'drizzle-orm';
import {
  mcpActionTypes,
  mcpAgents,
  mcpActions,
  mcpAgentActionLinks,
  mcpExecutions,
} from './mcp-automation.js';

// ---------------------------------------------------------------------------
// mcpActionTypes relations
// ---------------------------------------------------------------------------
export const mcpActionTypesRelations = relations(mcpActionTypes, ({ many }) => ({
  /** 1:N — ações que usam este tipo */
  actions: many(mcpActions),
}));

// ---------------------------------------------------------------------------
// mcpAgents relations
// ---------------------------------------------------------------------------
export const mcpAgentsRelations = relations(mcpAgents, ({ many }) => ({
  /** 1:N — vínculos agente↔ação */
  actionLinks: many(mcpAgentActionLinks),
  /** 1:N — execuções realizadas por este agente */
  executions: many(mcpExecutions),
}));

// ---------------------------------------------------------------------------
// mcpActions relations
// ---------------------------------------------------------------------------
export const mcpActionsRelations = relations(mcpActions, ({ one, many }) => ({
  /** N:1 — tipo da ação */
  actionType: one(mcpActionTypes, {
    fields: [mcpActions.actionTypeId],
    references: [mcpActionTypes.id],
  }),
  /** 1:N — vínculos agente↔ação */
  agentLinks: many(mcpAgentActionLinks),
  /** 1:N — execuções desta ação */
  executions: many(mcpExecutions),
}));

// ---------------------------------------------------------------------------
// mcpAgentActionLinks relations
// ---------------------------------------------------------------------------
export const mcpAgentActionLinksRelations = relations(mcpAgentActionLinks, ({ one }) => ({
  /** N:1 — agente vinculado */
  agent: one(mcpAgents, {
    fields: [mcpAgentActionLinks.agentId],
    references: [mcpAgents.id],
  }),
  /** N:1 — ação vinculada */
  action: one(mcpActions, {
    fields: [mcpAgentActionLinks.actionId],
    references: [mcpActions.id],
  }),
}));

// ---------------------------------------------------------------------------
// mcpExecutions relations
// ---------------------------------------------------------------------------
export const mcpExecutionsRelations = relations(mcpExecutions, ({ one }) => ({
  /** N:1 — agente que executou */
  agent: one(mcpAgents, {
    fields: [mcpExecutions.agentId],
    references: [mcpAgents.id],
  }),
  /** N:1 — ação executada */
  action: one(mcpActions, {
    fields: [mcpExecutions.actionId],
    references: [mcpActions.id],
  }),
}));
