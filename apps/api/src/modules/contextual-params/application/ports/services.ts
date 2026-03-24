/**
 * @contract DOC-ARC-003, DATA-003, DOC-FND-000
 *
 * Service port interfaces for the Contextual Params module (MOD-007).
 * EventBus for domain event emission, IdGenerator for UUID creation.
 */

// ---------------------------------------------------------------------------
// IdGeneratorService — UUID v4 generation
// ---------------------------------------------------------------------------
export interface IdGeneratorService {
  generate(): string;
}
