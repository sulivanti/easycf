/**
 * @contract BR-002, BR-003, BR-012
 *
 * Domain Service: ScopeBlocklistValidator
 * Pure function — no IO. Validates scopes against Phase 1 blocklist
 * and Phase 2 create rules.
 *
 * Phase 1 (Permanent, BR-002):
 *   *:delete, *:approve, approval:decide, approval:override, *:sign, *:execute
 *
 * Phase 2 (per-agent, BR-003):
 *   *:create — allowed only if phase2_create_enabled=true for the agent
 *
 * Wildcard matching: "*:delete" blocks any scope ending in ":delete"
 * (e.g., "org:unit:delete", "process:case:delete").
 */

// ---------------------------------------------------------------------------
// Phase 1 blocklist — permanent and irrevocable
// ---------------------------------------------------------------------------
const PHASE1_BLOCKED_PATTERNS: readonly string[] = [
  '*:delete',
  '*:approve',
  'approval:decide',
  'approval:override',
  '*:sign',
  '*:execute',
];

// ---------------------------------------------------------------------------
// Matching logic
// ---------------------------------------------------------------------------

/**
 * Check if a scope matches a blocklist pattern.
 * Supports wildcard prefix: "*:action" matches any scope ending in ":action".
 * Exact match for patterns without wildcard.
 */
function matchesPattern(scope: string, pattern: string): boolean {
  if (pattern.startsWith('*:')) {
    const suffix = pattern.slice(1); // ":delete", ":approve", etc.
    return scope.endsWith(suffix);
  }
  return scope === pattern;
}

/**
 * Find which Phase 1 pattern a scope matches, if any.
 */
function findBlockedPattern(scope: string): string | undefined {
  return PHASE1_BLOCKED_PATTERNS.find((pattern) => matchesPattern(scope, pattern));
}

/**
 * Check if a scope is a create scope (ends with ":create").
 */
function isCreateScope(scope: string): boolean {
  return scope.endsWith(':create');
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------
export interface ScopeValidationResult {
  readonly valid: boolean;
  readonly blockedScopes: string[];
  readonly reason?: string;
}

export class ScopeBlocklistValidator {
  /**
   * Validate proposed scopes against blocklist rules.
   *
   * @param scopes - Proposed allowed_scopes for the agent
   * @param phase2CreateEnabled - Whether Phase 2 create is enabled for this agent
   * @returns Validation result with blocked scopes and reason
   */
  static validate(scopes: readonly string[], phase2CreateEnabled: boolean): ScopeValidationResult {
    const blockedScopes: string[] = [];
    const reasons: string[] = [];

    for (const scope of scopes) {
      // Phase 1: permanent blocklist (BR-002)
      const blockedPattern = findBlockedPattern(scope);
      if (blockedPattern) {
        blockedScopes.push(scope);
        reasons.push(
          `Escopo bloqueado para agentes MCP: ${scope} (corresponde ao padrão ${blockedPattern})`,
        );
        continue;
      }

      // Phase 2: *:create requires phase2_create_enabled (BR-003)
      if (isCreateScope(scope) && !phase2CreateEnabled) {
        blockedScopes.push(scope);
        reasons.push(`Escopo *:create requer liberação Phase 2 para este agente: ${scope}`);
      }
    }

    if (blockedScopes.length > 0) {
      return {
        valid: false,
        blockedScopes,
        reason: reasons.join('; '),
      };
    }

    return { valid: true, blockedScopes: [] };
  }

  /**
   * Check if any of the given scopes would trigger a privilege escalation
   * detection (BR-012). Used at the gateway level.
   * sensitivity_level=2 for escalation attempts.
   */
  static detectEscalation(
    requiredScopes: readonly string[],
    agentScopes: readonly string[],
  ): { escalation: boolean; attemptedScopes: string[] } {
    const attemptedScopes: string[] = [];

    for (const required of requiredScopes) {
      // Check if the required scope is in the blocklist
      const isBlocked = PHASE1_BLOCKED_PATTERNS.some((pattern) =>
        matchesPattern(required, pattern),
      );
      if (isBlocked) {
        attemptedScopes.push(required);
        continue;
      }

      // Check if the agent doesn't have the required scope
      if (!agentScopes.includes(required)) {
        attemptedScopes.push(required);
      }
    }

    return {
      escalation: attemptedScopes.length > 0,
      attemptedScopes,
    };
  }
}
