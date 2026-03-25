/**
 * @contract DATA-005 §2.3, BR-002, BR-012, ADR-001
 *
 * Drizzle implementation of ProcessStageRepository.
 * Soft-delete via deleted_at. BR-002: hasInitialStage check.
 * ADR-001: cycle_id denormalized from macro_stage.
 */

import { eq, and, isNull, ne, asc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { processStages } from '../../../../../../db/schema/process-modeling.js';
import type { StageProps } from '../../../domain/entities/stage.js';
import type { ProcessStageRepository as IProcessStageRepository } from '../../../application/ports/repositories.js';
import type { TransactionContext } from '../../../../foundation/application/ports/repositories.js';

type Db = PostgresJsDatabase<Record<string, never>>;

export class ProcessStageRepository implements IProcessStageRepository {
  constructor(private readonly db: Db) {}

  private conn(tx?: TransactionContext): Db {
    return (tx as Db) ?? this.db;
  }

  async findById(id: string, tx?: TransactionContext): Promise<StageProps | null> {
    const [row] = await this.conn(tx)
      .select()
      .from(processStages)
      .where(and(eq(processStages.id, id), isNull(processStages.deletedAt)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async listByMacroStage(
    macroStageId: string,
    tx?: TransactionContext,
  ): Promise<readonly StageProps[]> {
    const rows = await this.conn(tx)
      .select()
      .from(processStages)
      .where(and(eq(processStages.macroStageId, macroStageId), isNull(processStages.deletedAt)))
      .orderBy(asc(processStages.ordem));
    return rows.map((r) => this.toDomain(r));
  }

  async listByCycle(cycleId: string, tx?: TransactionContext): Promise<readonly StageProps[]> {
    const rows = await this.conn(tx)
      .select()
      .from(processStages)
      .where(and(eq(processStages.cycleId, cycleId), isNull(processStages.deletedAt)))
      .orderBy(asc(processStages.ordem));
    return rows.map((r) => this.toDomain(r));
  }

  async hasInitialStage(
    cycleId: string,
    excludeStageId?: string,
    tx?: TransactionContext,
  ): Promise<boolean> {
    const conditions = [
      eq(processStages.cycleId, cycleId),
      eq(processStages.isInitial, true),
      isNull(processStages.deletedAt),
    ];
    if (excludeStageId) {
      conditions.push(ne(processStages.id, excludeStageId));
    }

    const [row] = await this.conn(tx)
      .select({ id: processStages.id })
      .from(processStages)
      .where(and(...conditions))
      .limit(1);
    return !!row;
  }

  async create(stage: StageProps, tx?: TransactionContext): Promise<StageProps> {
    const [row] = await this.conn(tx)
      .insert(processStages)
      .values({
        id: stage.id,
        macroStageId: stage.macroStageId,
        cycleId: stage.cycleId,
        codigo: stage.codigo,
        nome: stage.nome,
        descricao: stage.descricao,
        ordem: stage.ordem,
        isInitial: stage.isInitial,
        isTerminal: stage.isTerminal,
        canvasX: stage.canvasX,
        canvasY: stage.canvasY,
        createdBy: stage.createdBy,
        createdAt: stage.createdAt,
        updatedAt: stage.updatedAt,
      })
      .returning();
    return this.toDomain(row!);
  }

  async update(stage: StageProps, tx?: TransactionContext): Promise<StageProps> {
    const [row] = await this.conn(tx)
      .update(processStages)
      .set({
        nome: stage.nome,
        descricao: stage.descricao,
        ordem: stage.ordem,
        isInitial: stage.isInitial,
        isTerminal: stage.isTerminal,
        canvasX: stage.canvasX,
        canvasY: stage.canvasY,
        updatedAt: new Date(),
      })
      .where(and(eq(processStages.id, stage.id), isNull(processStages.deletedAt)))
      .returning();
    return this.toDomain(row!);
  }

  async softDelete(id: string, tx?: TransactionContext): Promise<void> {
    await this.conn(tx)
      .update(processStages)
      .set({ deletedAt: new Date() })
      .where(and(eq(processStages.id, id), isNull(processStages.deletedAt)));
  }

  async reorder(macroStageId: string, tx?: TransactionContext): Promise<void> {
    const rows = await this.conn(tx)
      .select({ id: processStages.id })
      .from(processStages)
      .where(and(eq(processStages.macroStageId, macroStageId), isNull(processStages.deletedAt)))
      .orderBy(asc(processStages.ordem));

    for (let i = 0; i < rows.length; i++) {
      await this.conn(tx)
        .update(processStages)
        .set({ ordem: i + 1, updatedAt: new Date() })
        .where(eq(processStages.id, rows[i]!.id));
    }
  }

  private toDomain(row: typeof processStages.$inferSelect): StageProps {
    return {
      id: row.id,
      macroStageId: row.macroStageId,
      cycleId: row.cycleId,
      codigo: row.codigo,
      nome: row.nome,
      descricao: row.descricao,
      ordem: row.ordem,
      isInitial: row.isInitial,
      isTerminal: row.isTerminal,
      canvasX: row.canvasX,
      canvasY: row.canvasY,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
