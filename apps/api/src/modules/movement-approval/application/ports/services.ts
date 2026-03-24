/**
 * @contract DOC-GNP-00, DOC-MOD-009
 *
 * Service port interfaces for the Movement Approval module.
 * These abstract external/cross-module dependencies so use cases
 * remain framework-agnostic.
 */

import type { DomainEventBase } from '../../../foundation/domain/events/foundation-events.js';

// ---------------------------------------------------------------------------
// DomainEventRepository — re-exported for convenience
// ---------------------------------------------------------------------------

export interface DomainEventRepository {
  create(event: DomainEventBase, tx?: unknown): Promise<void>;
  createMany(events: readonly DomainEventBase[], tx?: unknown): Promise<void>;
}

// ---------------------------------------------------------------------------
// IdGeneratorService — UUID generation abstraction
// ---------------------------------------------------------------------------

export interface IdGeneratorService {
  /** Generate a UUID v4 */
  generate(): string;
}

// ---------------------------------------------------------------------------
// CodigoGeneratorService — sequential code generation
// ---------------------------------------------------------------------------

export interface CodigoGeneratorService {
  /** Generate next sequential codigo for a movement within a tenant */
  nextMovementCodigo(tenantId: string, tx?: unknown): Promise<string>;
}
