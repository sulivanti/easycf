/**
 * @contract BR-007, BR-013, DATA-010
 *
 * Entity: McpAction
 * Represents an action in the MCP catalog.
 * codigo is immutable after creation (BR-013).
 * execution_policy=DIRECT requires action_type.can_be_direct=true (BR-007).
 */

import type { ExecutionPolicy } from '../value-objects/execution-policy.js';
import { DirectPolicyNotAllowedError } from '../errors/mcp-errors.js';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface McpActionProps {
  readonly id: string;
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly actionTypeId: string;
  readonly executionPolicy: ExecutionPolicy;
  readonly targetObjectType: string;
  readonly requiredScopes: readonly string[];
  readonly linkedRoutineId: string | null;
  readonly linkedIntegrationId: string | null;
  readonly description: string | null;
  readonly status: 'ACTIVE' | 'INACTIVE';
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------
export class McpAction {
  private readonly props: McpActionProps;

  constructor(props: McpActionProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }
  get tenantId(): string {
    return this.props.tenantId;
  }
  get codigo(): string {
    return this.props.codigo;
  }
  get nome(): string {
    return this.props.nome;
  }
  get actionTypeId(): string {
    return this.props.actionTypeId;
  }
  get executionPolicy(): ExecutionPolicy {
    return this.props.executionPolicy;
  }
  get targetObjectType(): string {
    return this.props.targetObjectType;
  }
  get requiredScopes(): readonly string[] {
    return this.props.requiredScopes;
  }
  get linkedRoutineId(): string | null {
    return this.props.linkedRoutineId;
  }
  get linkedIntegrationId(): string | null {
    return this.props.linkedIntegrationId;
  }
  get status(): 'ACTIVE' | 'INACTIVE' {
    return this.props.status;
  }

  isActive(): boolean {
    return this.props.status === 'ACTIVE';
  }

  /**
   * Validate that DIRECT policy is allowed for the given action type (BR-007).
   * Must be called with the resolved action type's can_be_direct flag.
   */
  static validatePolicyForType(
    executionPolicy: ExecutionPolicy,
    canBeDirect: boolean,
    actionTypeCodigo: string,
  ): void {
    if (executionPolicy === 'DIRECT' && !canBeDirect) {
      throw new DirectPolicyNotAllowedError(actionTypeCodigo);
    }
  }
}
