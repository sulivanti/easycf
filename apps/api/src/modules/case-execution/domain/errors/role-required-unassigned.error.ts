/**
 * @contract BR-006
 *
 * Thrown when a stage has required roles (stage_role_links.required=true)
 * but no active case_assignment exists for that role.
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

export class RoleRequiredUnassignedError extends DomainError {
  readonly type = '/problems/role-required-unassigned';
  readonly statusHint = 422;

  constructor(
    public readonly caseId: string,
    public readonly roleName: string,
  ) {
    super(`Role '${roleName}' is required in this stage but has no active assignment.`);
  }
}
