/**
 * @contract DATA-008 §2.1, BR-002, BR-003
 *
 * Entity representing a destination service (Protheus/TOTVS).
 * Enforces invariants: auth_config masking (BR-002),
 * inactive service blocking (BR-003).
 */

import type { AuthType } from '../value-objects/auth-type.js';
import {
  ServiceInactiveError,
  ServiceHasActiveRoutinesError,
} from '../errors/integration-errors.js';

export interface IntegrationServiceProps {
  id: string;
  tenantId: string;
  codigo: string;
  nome: string;
  baseUrl: string;
  authType: AuthType;
  authConfig: Record<string, unknown> | null;
  timeoutMs: number;
  status: 'ACTIVE' | 'INACTIVE';
  environment: 'PROD' | 'HML' | 'DEV';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class IntegrationService {
  constructor(private props: IntegrationServiceProps) {}

  get id() {
    return this.props.id;
  }
  get tenantId() {
    return this.props.tenantId;
  }
  get codigo() {
    return this.props.codigo;
  }
  get nome() {
    return this.props.nome;
  }
  get baseUrl() {
    return this.props.baseUrl;
  }
  get authType() {
    return this.props.authType;
  }
  get timeoutMs() {
    return this.props.timeoutMs;
  }
  get status() {
    return this.props.status;
  }
  get environment() {
    return this.props.environment;
  }
  get createdBy() {
    return this.props.createdBy;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  /** BR-003: Assert the service is active before executing routines */
  assertActive(): void {
    if (this.props.status === 'INACTIVE') {
      throw new ServiceInactiveError(this.props.id, this.props.codigo);
    }
  }

  /** BR-003: Block soft-delete if active routines reference this service */
  assertCanDelete(activeRoutineCount: number): void {
    if (activeRoutineCount > 0) {
      throw new ServiceHasActiveRoutinesError(this.props.id, activeRoutineCount);
    }
  }

  isActive(): boolean {
    return this.props.status === 'ACTIVE';
  }

  isHml(): boolean {
    return this.props.environment === 'HML';
  }

  /**
   * BR-002: Return a sanitized view — auth_config is NEVER exposed.
   * Used by GET endpoints and domain events.
   */
  toSanitizedProps(): Omit<IntegrationServiceProps, 'authConfig'> & {
    authConfig: string;
  } {
    return {
      ...this.props,
      authConfig: '***',
    };
  }
}
