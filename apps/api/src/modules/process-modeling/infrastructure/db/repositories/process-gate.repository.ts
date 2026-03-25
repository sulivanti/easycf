/**
 * @contract DATA-005 §2.4, BR-012
 *
 * Drizzle implementation of ProcessGateRepository.
 * Soft-delete via deleted_at. Reorder support within stage (BR-012).
 */

import { eq, and, isNull, asc, inArray } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { processGates, processStages } from '../../../../../../db/schema/process-modeling.js';
import type { GateProps } from '../../../domain/entities/gate.js';
import type { GateType } from '../../../domain/value-objects/gate-type.js';
import type { ProcessGateRepository as IProcessGateRepository } from '../../../application/ports/repositories.js';
import type { TransactionContext } from '../../../../foundation/application/ports/repositories.js';

type Db = PostgresJsDatabase<Record<string, never>>;

export class ProcessGateRepository implements IProcessGateRepository {
  constructor(private readonly db: Db) {}

  private conn(tx?: TransactionContext): Db {
    return (tx as Db) ?? this.db;
  }

  async findById(id: string, tx?: TransactionContext): Promise<GateProps | null> {
    const [row] = await this.conn(tx)
      .select()
      .from(processGates)
      .where(and(eq(processGates.id, id), isNull(processGates.deletedAt)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async listByStage(stageId: string, tx?: TransactionContext): Promise<readonly GateProps[]> {
    const rows = await this.conn(tx)
      .select()
      .from(processGates)
      .where(and(eq(processGates.stageId, stageId), isNull(processGates.deletedAt)))
      .orderBy(asc(processGates.ordem));
    return rows.map((r) => this.toDomain(r));
  }

  async listByCycle(cycleId: string, tx?: TransactionContext): Promise<readonly GateProps[]> {
    const stageRows = await this.conn(tx)
      .select({ id: processStages.id })
      .from(processStages)
      .where(and(eq(processStages.cycleId, cycleId), isNull(processStages.deletedAt)));

    if (stageRows.length === 0) return [];

    const stageIds = stageRows.map((s) => s.id);
    const rows = await this.conn(tx)
      .select()
      .from(processGates)
      .where(and(inArray(processGates.stageId, stageIds), isNull(processGates.deletedAt)))
      .orderBy(asc(processGates.ordem));
    return rows.map((r) => this.toDomain(r));
  }

  async create(gate: GateProps, tx?: TransactionContext): Promise<GateProps> {
    const [row] = await this.conn(tx)
      .insert(processGates)
      .values({
        id: gate.id,
        stageId: gate.stageId,
        nome: gate.nome,
        descricao: gate.descricao,
        gateType: gate.gateType,
        required: gate.required,
        ordem: gate.ordem,
        createdBy: gate.createdBy,
        createdAt: gate.createdAt,
        updatedAt: gate.updatedAt,
      })
      .returning();
    return this.toDomain(row!);
  }

  async update(gate: GateProps, tx?: TransactionContext): Promise<GateProps> {
    const [row] = await this.conn(tx)
      .update(processGates)
      .set({
        nome: gate.nome,
        descricao: gate.descricao,
        gateType: gate.gateType,
        required: gate.required,
        ordem: gate.ordem,
        updatedAt: new Date(),
      })
      .where(and(eq(processGates.id, gate.id), isNull(processGates.deletedAt)))
      .returning();
    return this.toDomain(row!);
  }

  async softDelete(id: string, tx?: TransactionContext): Promise<void> {
    await this.conn(tx)
      .update(processGates)
      .set({ deletedAt: new Date() })
      .where(and(eq(processGates.id, id), isNull(processGates.deletedAt)));
  }

  async reorder(stageId: string, tx?: TransactionContext): Promise<void> {
    const rows = await this.conn(tx)
      .select({ id: processGates.id })
      .from(processGates)
      .where(and(eq(processGates.stageId, stageId), isNull(processGates.deletedAt)))
      .orderBy(asc(processGates.ordem));

    for (let i = 0; i < rows.length; i++) {
      await this.conn(tx)
        .update(processGates)
        .set({ ordem: i + 1, updatedAt: new Date() })
        .where(eq(processGates.id, rows[i]!.id));
    }
  }

  private toDomain(row: typeof processGates.$inferSelect): GateProps {
    return {
      id: row.id,
      stageId: row.stageId,
      nome: row.nome,
      descricao: row.descricao,
      gateType: row.gateType as GateType,
      required: row.required,
      ordem: row.ordem,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
