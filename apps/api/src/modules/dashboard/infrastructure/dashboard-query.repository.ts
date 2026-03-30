/**
 * @contract UX-DASH-001
 *
 * Read-only query repository for dashboard aggregations.
 * All queries filtered by tenantId. No write operations.
 */

import { eq, and, sql, desc, inArray, isNull, lte } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { caseInstances } from '../../../../db/schema/case-execution.js';
import { approvalInstances } from '../../../../db/schema/movement-approval.js';
import { tenantUsers } from '../../../../db/schema/foundation.js';
import { mcpAgents } from '../../../../db/schema/mcp-automation.js';
import { domainEvents, users, contentUsers } from '../../../../db/schema/foundation.js';

// ── Types ──

export interface DashboardMetrics {
  active_cases: number;
  pending_approvals: number;
  active_users: number;
  active_agents: number;
}

export interface StatusDistributionItem {
  label: string;
  value: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  dot_color: string;
  actor: string;
  description: string;
  badge?: { code: string; variant?: string };
  timestamp: string;
}

// ── Status → label/color mapping ──

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Andamento', color: '#E67E22' },
  COMPLETED: { label: 'Concluído', color: '#27AE60' },
  CANCELLED: { label: 'Cancelado', color: '#E74C3C' },
  ON_HOLD: { label: 'Planejado', color: '#2E86C1' },
};

// ── Event type → color/description mapping ──

const EVENT_COLOR_MAP: Record<string, string> = {
  'case.opened': '#2E86C1',
  'case.completed': '#27AE60',
  'case.cancelled': '#E74C3C',
  'movement.approved': '#27AE60',
  'movement.rejected': '#E74C3C',
  'movement.created': '#E67E22',
  'user.created': '#2E86C1',
  'user.deleted': '#E74C3C',
  'mcp.executed': '#E67E22',
  'mcp.failed': '#E74C3C',
};

function eventDescription(eventType: string, entityType: string): string {
  const map: Record<string, string> = {
    'case.opened': 'abriu um caso',
    'case.completed': 'concluiu o processo',
    'case.cancelled': 'cancelou o processo',
    'movement.approved': 'aprovou o movimento',
    'movement.rejected': 'rejeitou o movimento',
    'movement.created': 'criou movimento controlado',
    'user.created': 'cadastrou novo usuário',
    'user.deleted': 'desativou usuário',
    'mcp.executed': 'executou ação automatizada',
    'mcp.failed': 'detectou falha no agente',
  };
  return map[eventType] ?? `realizou ação em ${entityType}`;
}

// ── Repository ──

export class DashboardQueryRepository {
  constructor(private readonly db: PostgresJsDatabase) {}

  async countMetrics(tenantId: string): Promise<DashboardMetrics> {
    const [cases, approvals, usersCount, agents] = await Promise.all([
      // Active cases: OPEN or ON_HOLD
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(caseInstances)
        .where(
          and(
            eq(caseInstances.tenantId, tenantId),
            inArray(caseInstances.status, ['OPEN', 'ON_HOLD']),
          ),
        ),

      // Pending approvals
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(approvalInstances)
        .where(
          and(eq(approvalInstances.tenantId, tenantId), eq(approvalInstances.status, 'PENDING')),
        ),

      // Active users
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(tenantUsers)
        .where(
          and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.status, 'ACTIVE'),
            isNull(tenantUsers.deletedAt),
          ),
        ),

      // Active MCP agents
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(mcpAgents)
        .where(and(eq(mcpAgents.tenantId, tenantId), eq(mcpAgents.status, 'ACTIVE'))),
    ]);

    return {
      active_cases: cases[0]?.count ?? 0,
      pending_approvals: approvals[0]?.count ?? 0,
      active_users: usersCount[0]?.count ?? 0,
      active_agents: agents[0]?.count ?? 0,
    };
  }

  async getStatusDistribution(
    tenantId: string,
  ): Promise<{ data: StatusDistributionItem[]; total: number }> {
    const rows = await this.db
      .select({
        status: caseInstances.status,
        count: sql<number>`count(*)::int`,
      })
      .from(caseInstances)
      .where(eq(caseInstances.tenantId, tenantId))
      .groupBy(caseInstances.status);

    const data: StatusDistributionItem[] = rows
      .filter((r) => STATUS_MAP[r.status])
      .map((r) => ({
        label: STATUS_MAP[r.status]!.label,
        value: r.count,
        color: STATUS_MAP[r.status]!.color,
      }));

    const total = data.reduce((sum, d) => sum + d.value, 0);
    return { data, total };
  }

  async listRecentActivities(tenantId: string, limit = 10): Promise<ActivityItem[]> {
    const rows = await this.db
      .select({
        id: domainEvents.id,
        eventType: domainEvents.eventType,
        entityType: domainEvents.entityType,
        entityId: domainEvents.entityId,
        createdAt: domainEvents.createdAt,
        createdBy: domainEvents.createdBy,
        fullName: contentUsers.fullName,
      })
      .from(domainEvents)
      .leftJoin(contentUsers, eq(domainEvents.createdBy, contentUsers.userId))
      .where(and(eq(domainEvents.tenantId, tenantId), lte(domainEvents.sensitivityLevel, 1)))
      .orderBy(desc(domainEvents.createdAt))
      .limit(limit);

    return rows.map((row) => {
      const dotColor = EVENT_COLOR_MAP[row.eventType] ?? '#888888';
      const actor = row.fullName ?? 'Sistema';
      const description = eventDescription(row.eventType, row.entityType);

      return {
        id: row.id,
        dot_color: dotColor,
        actor,
        description,
        timestamp: row.createdAt.toISOString(),
      };
    });
  }
}
