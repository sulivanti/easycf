/**
 * @contract DATA-005 §2.6
 *
 * Drizzle implementation of StageRoleLinkRepository.
 * Hard delete (no soft delete — DATA-005 §2.8).
 */

import { eq, and, inArray } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { stageRoleLinks, processStages } from '../../../../../../db/schema/process-modeling.js';
import type { StageRoleLinkData } from '../../../domain/domain-services/cycle-fork.service.js';
import type { StageRoleLinkRepository as IStageRoleLinkRepository } from '../../../application/ports/repositories.js';
import type { TransactionContext } from '../../../../foundation/application/ports/repositories.js';
import { isNull } from 'drizzle-orm';

type Db = PostgresJsDatabase<Record<string, never>>;

export class StageRoleLinkRepository implements IStageRoleLinkRepository {
  constructor(private readonly db: Db) {}

  private conn(tx?: TransactionContext): Db {
    return (tx as Db) ?? this.db;
  }

  async findById(id: string, tx?: TransactionContext): Promise<StageRoleLinkData | null> {
    const [row] = await this.conn(tx)
      .select()
      .from(stageRoleLinks)
      .where(eq(stageRoleLinks.id, id))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findByPair(
    stageId: string,
    roleId: string,
    tx?: TransactionContext,
  ): Promise<StageRoleLinkData | null> {
    const [row] = await this.conn(tx)
      .select()
      .from(stageRoleLinks)
      .where(and(eq(stageRoleLinks.stageId, stageId), eq(stageRoleLinks.roleId, roleId)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async listByStage(
    stageId: string,
    tx?: TransactionContext,
  ): Promise<readonly StageRoleLinkData[]> {
    const rows = await this.conn(tx)
      .select()
      .from(stageRoleLinks)
      .where(eq(stageRoleLinks.stageId, stageId));
    return rows.map((r) => this.toDomain(r));
  }

  async listByCycle(
    cycleId: string,
    tx?: TransactionContext,
  ): Promise<readonly StageRoleLinkData[]> {
    const stageRows = await this.conn(tx)
      .select({ id: processStages.id })
      .from(processStages)
      .where(and(eq(processStages.cycleId, cycleId), isNull(processStages.deletedAt)));

    if (stageRows.length === 0) return [];

    const stageIds = stageRows.map((s) => s.id);
    const rows = await this.conn(tx)
      .select()
      .from(stageRoleLinks)
      .where(inArray(stageRoleLinks.stageId, stageIds));
    return rows.map((r) => this.toDomain(r));
  }

  async create(link: StageRoleLinkData, tx?: TransactionContext): Promise<StageRoleLinkData> {
    const [row] = await this.conn(tx)
      .insert(stageRoleLinks)
      .values({
        id: link.id,
        stageId: link.stageId,
        roleId: link.roleId,
        required: link.required,
        maxAssignees: link.maxAssignees,
        createdBy: link.createdBy,
      })
      .returning();
    return this.toDomain(row!);
  }

  async delete(id: string, tx?: TransactionContext): Promise<void> {
    await this.conn(tx).delete(stageRoleLinks).where(eq(stageRoleLinks.id, id));
  }

  private toDomain(row: typeof stageRoleLinks.$inferSelect): StageRoleLinkData {
    return {
      id: row.id,
      stageId: row.stageId,
      roleId: row.roleId,
      required: row.required,
      maxAssignees: row.maxAssignees,
      createdBy: row.createdBy,
    };
  }
}
