/**
 * @contract DATA-006, DATA-003, DOC-FND-000, DOC-GNP-00, ADR-001, ADR-002, ADR-003, ADR-004
 *
 * Drizzle ORM schema definitions for the Case Execution module (MOD-006).
 * 5 tables: case_instances, stage_history, gate_instances,
 * case_assignments, case_events.
 *
 * Aggregate Root: case_instances — all operations go through this entity.
 * stage_history and case_events are append-only (ADR-003).
 * case_assignments use soft-toggle via is_active (never deleted).
 * All FKs use ON DELETE RESTRICT except child tables which use CASCADE (DATA-006).
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users, tenants } from "./foundation.js";
import { orgUnits } from "./org-units.js";
import { accessDelegations } from "./identity-advanced.js";
import {
  processCycles,
  processStages,
  processGates,
  processRoles,
  stageTransitions,
} from "./process-modeling.js";

// ---------------------------------------------------------------------------
// 1. case_instances — Instância do Caso / Aggregate Root (DATA-006 §2.1)
// ---------------------------------------------------------------------------
export const caseInstances = pgTable(
  "case_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    codigo: varchar("codigo", { length: 50 }).notNull(),
    cycleId: uuid("cycle_id")
      .notNull()
      .references(() => processCycles.id, { onDelete: "restrict" }),
    cycleVersionId: uuid("cycle_version_id")
      .notNull()
      .references(() => processCycles.id, { onDelete: "restrict" }),
    currentStageId: uuid("current_stage_id")
      .notNull()
      .references(() => processStages.id, { onDelete: "restrict" }),
    status: text("status")
      .notNull()
      .default("OPEN")
      .$type<"OPEN" | "COMPLETED" | "CANCELLED" | "ON_HOLD">(),
    objectType: varchar("object_type", { length: 100 }),
    objectId: uuid("object_id"),
    orgUnitId: uuid("org_unit_id").references(() => orgUnits.id, {
      onDelete: "restrict",
    }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    openedBy: uuid("opened_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    openedAt: timestamp("opened_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Status enum check (BR-012)
    check(
      "case_instances_status_check",
      sql`${table.status} IN ('OPEN', 'COMPLETED', 'CANCELLED', 'ON_HOLD')`,
    ),

    // UNIQUE codigo — identificador amigável (BR-010)
    uniqueIndex("case_instances_codigo_idx").on(table.codigo),

    // Filtro principal da listagem (tenant + status)
    index("idx_case_instances_tenant_status").on(
      table.tenantId,
      table.status,
    ),

    // Filtro por ciclo
    index("idx_case_instances_cycle").on(table.cycleId),

    // Ordenação padrão da listagem (tenant + opened_at DESC)
    index("idx_case_instances_tenant_opened_at").on(
      table.tenantId,
      table.openedAt,
    ),

    // Busca por objeto de negócio vinculado (PENDENTE-003 — query param dedicado)
    index("idx_case_instances_object")
      .on(table.objectType, table.objectId)
      .where(sql`${table.objectId} IS NOT NULL`),

    // Filtro por área organizacional
    index("idx_case_instances_org_unit")
      .on(table.orgUnitId)
      .where(sql`${table.orgUnitId} IS NOT NULL`),
  ],
);

// ---------------------------------------------------------------------------
// 2. stage_history — Histórico de Estágio / Append-only (DATA-006 §2.2, ADR-003)
// ---------------------------------------------------------------------------
export const stageHistory = pgTable(
  "stage_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => caseInstances.id, { onDelete: "cascade" }),
    fromStageId: uuid("from_stage_id").references(() => processStages.id, {
      onDelete: "restrict",
    }),
    toStageId: uuid("to_stage_id")
      .notNull()
      .references(() => processStages.id, { onDelete: "restrict" }),
    transitionId: uuid("transition_id").references(
      () => stageTransitions.id,
      { onDelete: "restrict" },
    ),
    transitionedBy: uuid("transitioned_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    transitionedAt: timestamp("transitioned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    motivo: text("motivo"),
    evidence: jsonb("evidence").$type<{
      type: "note" | "file";
      content?: string;
      url?: string;
    }>(),
  },
  (table) => [
    // Timeline por caso (ordenação cronológica reversa)
    index("idx_stage_history_case").on(
      table.caseId,
      table.transitionedAt,
    ),
  ],
);

// ---------------------------------------------------------------------------
// 3. gate_instances — Instância de Gate (DATA-006 §2.3)
// ---------------------------------------------------------------------------
export const gateInstances = pgTable(
  "gate_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => caseInstances.id, { onDelete: "cascade" }),
    gateId: uuid("gate_id")
      .notNull()
      .references(() => processGates.id, { onDelete: "restrict" }),
    stageId: uuid("stage_id")
      .notNull()
      .references(() => processStages.id, { onDelete: "restrict" }),
    status: text("status")
      .notNull()
      .default("PENDING")
      .$type<"PENDING" | "RESOLVED" | "WAIVED" | "REJECTED">(),
    resolvedBy: uuid("resolved_by").references(() => users.id, {
      onDelete: "restrict",
    }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    decision: text("decision").$type<"APPROVED" | "REJECTED" | "WAIVED">(),
    parecer: text("parecer"),
    evidence: jsonb("evidence").$type<{
      type: "file";
      url: string;
      filename: string;
    }>(),
    checklistItems: jsonb("checklist_items").$type<
      Array<{ id: string; label: string; checked: boolean }>
    >(),
  },
  (table) => [
    // Status enum check
    check(
      "gate_instances_status_check",
      sql`${table.status} IN ('PENDING', 'RESOLVED', 'WAIVED', 'REJECTED')`,
    ),

    // Decision enum check (when not null)
    check(
      "gate_instances_decision_check",
      sql`${table.decision} IS NULL OR ${table.decision} IN ('APPROVED', 'REJECTED', 'WAIVED')`,
    ),

    // UNIQUE(case_id, gate_id) — um gate por caso (DATA-006 §2.3)
    uniqueIndex("gate_instances_case_gate_idx").on(
      table.caseId,
      table.gateId,
    ),

    // Verificação de gates pendentes no motor de transição (hot path)
    index("idx_gate_instances_case_status").on(table.caseId, table.status),

    // Listagem de gates por estágio
    index("idx_gate_instances_case_stage").on(table.caseId, table.stageId),
  ],
);

// ---------------------------------------------------------------------------
// 4. case_assignments — Atribuição de Responsáveis (DATA-006 §2.4)
// Soft-toggle via is_active — registros nunca deletados
// ---------------------------------------------------------------------------
export const caseAssignments = pgTable(
  "case_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => caseInstances.id, { onDelete: "cascade" }),
    stageId: uuid("stage_id")
      .notNull()
      .references(() => processStages.id, { onDelete: "restrict" }),
    processRoleId: uuid("process_role_id")
      .notNull()
      .references(() => processRoles.id, { onDelete: "restrict" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    assignedBy: uuid("assigned_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    substitutionReason: text("substitution_reason"),
    delegationId: uuid("delegation_id").references(
      () => accessDelegations.id,
      { onDelete: "restrict" },
    ),
  },
  (table) => [
    // Atribuições ativas do caso
    index("idx_case_assignments_case_active")
      .on(table.caseId, table.isActive)
      .where(sql`${table.isActive} = true`),

    // Filtro "Minha responsabilidade" (FR-009)
    index("idx_case_assignments_user")
      .on(table.userId, table.isActive)
      .where(sql`${table.isActive} = true`),

    // Expiração via delegação (background job — ADR-005)
    index("idx_case_assignments_delegation")
      .on(table.delegationId)
      .where(sql`${table.delegationId} IS NOT NULL`),

    // Job de expiração por valid_until (BR-017, ADR-005)
    index("idx_case_assignments_valid_until")
      .on(table.validUntil)
      .where(
        sql`${table.isActive} = true AND ${table.validUntil} IS NOT NULL`,
      ),
  ],
);

// ---------------------------------------------------------------------------
// 5. case_events — Eventos Avulsos do Caso / Append-only (DATA-006 §2.5, ADR-003)
// ---------------------------------------------------------------------------
export const caseEvents = pgTable(
  "case_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => caseInstances.id, { onDelete: "cascade" }),
    eventType: text("event_type")
      .notNull()
      .$type<
        | "COMMENT"
        | "EXCEPTION"
        | "REOPENED"
        | "EVIDENCE"
        | "REASSIGNED"
        | "ON_HOLD"
        | "RESUMED"
        | "STAGE_TRANSITIONED"
      >(),
    descricao: text("descricao").notNull(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    metadata: jsonb("metadata"),
    stageId: uuid("stage_id")
      .notNull()
      .references(() => processStages.id, { onDelete: "restrict" }),
  },
  (table) => [
    // Event type enum check
    check(
      "case_events_type_check",
      sql`${table.eventType} IN ('COMMENT', 'EXCEPTION', 'REOPENED', 'EVIDENCE', 'REASSIGNED', 'ON_HOLD', 'RESUMED', 'STAGE_TRANSITIONED')`,
    ),

    // Timeline por caso (ordenação cronológica reversa)
    index("idx_case_events_case").on(table.caseId, table.createdAt),

    // Filtragem por tipo de evento
    index("idx_case_events_type").on(table.caseId, table.eventType),
  ],
);
