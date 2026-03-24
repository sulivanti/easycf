/**
 * @contract BR-007, BR-008, BR-009
 *
 * Value Object: ExecutionPolicy
 * DIRECT — execução imediata (baixo risco, BR-007).
 * CONTROLLED — passa pelo MOD-009 para aprovação humana (BR-008).
 * EVENT_ONLY — apenas emite domain_event, zero escrita (BR-009).
 */

export type ExecutionPolicy = 'DIRECT' | 'CONTROLLED' | 'EVENT_ONLY';
