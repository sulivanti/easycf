/**
 * @contract BR-007, BR-014, DATA-010
 *
 * Value Object: ActionType
 * Tipifica ações MCP. can_approve é SEMPRE false (BR-014, invariante estrutural).
 * can_be_direct controla elegibilidade para política DIRECT (BR-007).
 */

export type ActionTypeCode = 'CONSULTAR' | 'PREPARAR' | 'SUBMETER' | 'EXECUTAR' | 'MONITORAR';

export interface ActionTypeProps {
  readonly codigo: ActionTypeCode;
  readonly canBeDirect: boolean;
  readonly canApprove: false; // invariante estrutural — SEMPRE false (BR-014)
}

/**
 * Seed data canônica (DATA-010 §2).
 * PREPARAR: can_be_direct=false (conservador, PEN-010/PENDENTE-002).
 */
export const ACTION_TYPE_SEEDS: readonly ActionTypeProps[] = [
  { codigo: 'CONSULTAR', canBeDirect: true, canApprove: false },
  { codigo: 'PREPARAR', canBeDirect: false, canApprove: false },
  { codigo: 'SUBMETER', canBeDirect: false, canApprove: false },
  { codigo: 'EXECUTAR', canBeDirect: false, canApprove: false },
  { codigo: 'MONITORAR', canBeDirect: true, canApprove: false },
] as const;
