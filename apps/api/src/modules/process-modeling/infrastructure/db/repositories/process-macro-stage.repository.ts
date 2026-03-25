/**
 * @contract DATA-005 §2.2, BR-005, BR-012
 *
 * Drizzle implementation of ProcessMacroStageRepository.
 * Soft-delete via deleted_at. Reorder support (BR-012).
 */

import { eq, and, isNull, asc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { processMacroStages } from '../../../../../../db/schema/process-modeling.js';
import { processStages } from '../../../../../../db/schema/process-modeling.js';
import type { MacroStageProps } from '../../../domain/entities/macro-stage.js';
import type { ProcessMacroStageRepository as IProcessMacroStageRepository } from '../../../application/ports/repositories.js';
import type { TransactionContext } from '../../../../foundation/application/ports/repositories.js';

type Db = PostgresJsDatabase<Record<string, never>>;

export class ProcessMacroStageRepository implements IProcessMacroStageRepository {
  constructor(private readonly db: Db) {}

  private conn(tx?: TransactionContext): Db {
    return (tx as Db) ?? this.db;
  }

  async findById(id: string, tx?: TransactionContext): Promise<MacroStageProps | null> {
    const [row] = await this.conn(tx)
      .select()
      .from(processMacroStages)
      .where(and(eq(processMacroStages.id, id), isNull(processMacroStages.deletedAt)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async listByCycle(cycleId: string, tx?: TransactionContext): Promise<readonly MacroStageProps[]> {
    const rows = await this.conn(tx)
      .select()
      .from(processMacroStages)
      .where(and(eq(processMacroStages.cycleId, cycleId), isNull(processMacroStages.deletedAt)))
      .orderBy(asc(processMacroStages.ordem));
    return rows.map((r) => this.toDomain(r));
  }

  async hasActiveStages(macroStageId: string, tx?: TransactionContext): Promise<boolean> {
    const [row] = await this.conn(tx)
      .select({ id: processStages.id })
      .from(processStages)
      .where(and(eq(processStages.macroStageId, macroStageId), isNull(processStages.deletedAt)))
      .limit(1);
    return !!row;
  }

  async create(macroStage: MacroStageProps, tx?: TransactionContext): Promise<MacroStageProps> {
    const [row] = await this.conn(tx)
      .insert(processMacroStages)
      .values({
        id: macroStage.id,
        cycleId: macroStage.cycleId,
        codigo: macroStage.codigo,
        nome: macroStage.nome,
        ordem: macroStage.ordem,
        createdBy: macroStage.createdBy,
        createdAt: macroStage.createdAt,
        updatedAt: macroStage.updatedAt,
      })
      .returning();
    return this.toDomain(row!);
  }

  async update(macroStage: MacroStageProps, tx?: TransactionContext): Promise<MacroStageProps> {
    const [row] = await this.conn(tx)
      .update(processMacroStages)
      .set({
        nome: macroStage.nome,
        ordem: macroStage.ordem,
        updatedAt: new Date(),
      })
      .where(and(eq(processMacroStages.id, macroStage.id), isNull(processMacroStages.deletedAt)))
      .returning();
    return this.toDomain(row!);
  }

  async softDelete(id: string, tx?: TransactionContext): Promise<void> {
    await this.conn(tx)
      .update(processMacroStages)
      .set({ deletedAt: new Date() })
      .where(and(eq(processMacroStages.id, id), isNull(processMacroStages.deletedAt)));
  }

  async reorder(cycleId: string, tx?: TransactionContext): Promise<void> {
    const rows = await this.conn(tx)
      .select({ id: processMacroStages.id })
      .from(processMacroStages)
      .where(and(eq(processMacroStages.cycleId, cycleId), isNull(processMacroStages.deletedAt)))
      .orderBy(asc(processMacroStages.ordem));

    for (let i = 0; i < rows.length; i++) {
      await this.conn(tx)
        .update(processMacroStages)
        .set({ ordem: i + 1, updatedAt: new Date() })
        .where(eq(processMacroStages.id, rows[i]!.id));
    }
  }

  private toDomain(row: typeof processMacroStages.$inferSelect): MacroStageProps {
    return {
      id: row.id,
      cycleId: row.cycleId,
      codigo: row.codigo,
      nome: row.nome,
      ordem: row.ordem,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
