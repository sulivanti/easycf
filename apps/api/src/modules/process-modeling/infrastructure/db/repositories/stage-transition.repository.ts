/**
 * @contract DATA-005 §2.7, BR-008
 *
 * Drizzle implementation of StageTransitionRepository.
 * Hard delete (no soft delete — DATA-005 §2.8).
 */

import { eq, and, inArray, isNull } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { stageTransitions, processStages } from '../../../../../../db/schema/process-modeling.js';
import type { StageTransitionProps } from '../../../domain/entities/stage-transition.js';
import type { StageTransitionRepository as IStageTransitionRepository } from '../../../application/ports/repositories.js';
import type { TransactionContext } from '../../../../foundation/application/ports/repositories.js';

type Db = PostgresJsDatabase<Record<string, never>>;

export class StageTransitionRepository implements IStageTransitionRepository {
  constructor(private readonly db: Db) {}

  private conn(tx?: TransactionContext): Db {
    return (tx as Db) ?? this.db;
  }

  async findById(id: string, tx?: TransactionContext): Promise<StageTransitionProps | null> {
    const [row] = await this.conn(tx)
      .select()
      .from(stageTransitions)
      .where(eq(stageTransitions.id, id))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async listByCycle(
    cycleId: string,
    tx?: TransactionContext,
  ): Promise<readonly StageTransitionProps[]> {
    const stageRows = await this.conn(tx)
      .select({ id: processStages.id })
      .from(processStages)
      .where(and(eq(processStages.cycleId, cycleId), isNull(processStages.deletedAt)));

    if (stageRows.length === 0) return [];

    const stageIds = stageRows.map((s) => s.id);
    const rows = await this.conn(tx)
      .select()
      .from(stageTransitions)
      .where(inArray(stageTransitions.fromStageId, stageIds));
    return rows.map((r) => this.toDomain(r));
  }

  async listByFromStage(
    fromStageId: string,
    tx?: TransactionContext,
  ): Promise<readonly StageTransitionProps[]> {
    const rows = await this.conn(tx)
      .select()
      .from(stageTransitions)
      .where(eq(stageTransitions.fromStageId, fromStageId));
    return rows.map((r) => this.toDomain(r));
  }

  async create(
    transition: StageTransitionProps,
    tx?: TransactionContext,
  ): Promise<StageTransitionProps> {
    const [row] = await this.conn(tx)
      .insert(stageTransitions)
      .values({
        id: transition.id,
        fromStageId: transition.fromStageId,
        toStageId: transition.toStageId,
        nome: transition.nome,
        condicao: transition.condicao,
        gateRequired: transition.gateRequired,
        evidenceRequired: transition.evidenceRequired,
        allowedRoles: transition.allowedRoles,
        createdBy: transition.createdBy,
        createdAt: transition.createdAt,
        updatedAt: transition.updatedAt,
      })
      .returning();
    return this.toDomain(row!);
  }

  async delete(id: string, tx?: TransactionContext): Promise<void> {
    await this.conn(tx).delete(stageTransitions).where(eq(stageTransitions.id, id));
  }

  private toDomain(row: typeof stageTransitions.$inferSelect): StageTransitionProps {
    return {
      id: row.id,
      fromStageId: row.fromStageId,
      toStageId: row.toStageId,
      nome: row.nome,
      condicao: row.condicao,
      gateRequired: row.gateRequired,
      evidenceRequired: row.evidenceRequired,
      allowedRoles: row.allowedRoles as string[] | null,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
