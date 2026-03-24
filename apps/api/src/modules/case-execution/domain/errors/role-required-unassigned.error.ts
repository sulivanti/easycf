/**
 * @contract BR-006
 *
 * Thrown when a stage has required roles (stage_role_links.required=true)
 * but no active case_assignment exists for that role.
 */

export class RoleRequiredUnassignedError extends Error {
  public readonly code = "ROLE_REQUIRED_UNASSIGNED";
  public readonly statusCode = 422;

  constructor(
    public readonly caseId: string,
    public readonly roleName: string,
  ) {
    super(
      `Role '${roleName}' is required in this stage but has no active assignment.`,
    );
    this.name = "RoleRequiredUnassignedError";
  }
}
