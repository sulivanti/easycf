/**
 * Catálogo canônico de scopes — DOC-FND-000 §2.2
 *
 * Fonte única de verdade para scopes no código. Exportado para:
 * - seed-admin.ts (INSERT em role_permissions)
 * - Testes de consistência (CI valida contra Scope.create())
 *
 * DEVE ser mantido em sincronia com DOC-FND-000 §2.2.
 * Ref: FR-000-C01, FR-000-C11, DOC-PADRAO-001-C01.
 */

export const SCOPES = [
  // ── MOD-000 Foundation ──
  'users:user:read',
  'users:user:write',
  'users:user:delete',
  'users:user:import',
  'users:user:export',
  'users:user:comment',
  'users:role:read',
  'users:role:write',
  'tenants:branch:read',
  'tenants:branch:write',
  'system:audit:read',
  'system:audit:sensitive',
  'storage:file:upload',
  'storage:file:read',
  // ── MOD-003 Estrutura Organizacional ──
  'org:unit:read',
  'org:unit:write',
  'org:unit:delete',
  // ── MOD-004 Identidade Avançada ──
  'identity:org_scope:read',
  'identity:org_scope:write',
  'identity:share:read',
  'identity:share:write',
  'identity:share:revoke',
  'identity:share:authorize',
  'identity:delegation:read',
  'identity:delegation:write',
  // ── MOD-005 Modelagem de Processos ──
  'process:cycle:read',
  'process:cycle:write',
  'process:cycle:publish',
  'process:cycle:delete',
  // ── MOD-006 Execução de Casos (DOC-FND-000-M01, M02) ──
  'process:case:read',
  'process:case:write',
  'process:case:cancel',
  'process:case:gate_resolve',
  'process:case:gate_waive',
  'process:case:assign',
  'process:case:reopen',
  // ── MOD-007 Parametrização Contextual ──
  'param:framer:read',
  'param:framer:write',
  'param:framer:delete',
  'param:routine:read',
  'param:routine:write',
  'param:routine:publish',
  'param:engine:evaluate',
  // ── MOD-008 Integração Protheus ──
  'integration:service:read',
  'integration:service:write',
  'integration:routine:write',
  'integration:execute',
  'integration:log:read',
  'integration:log:reprocess',
  // ── MOD-009 Movimentos sob Aprovação (DOC-FND-000-M03) ──
  'approval:rule:read',
  'approval:rule:write',
  'approval:engine:evaluate',
  'approval:movement:read',
  'approval:movement:write',
  'approval:decide',
  'approval:override',
  // ── MOD-010 MCP e Automação (DOC-FND-000-M04) ──
  'mcp:agent:read',
  'mcp:agent:write',
  'mcp:agent:revoke',
  'mcp:agent:phase2_enable',
  'mcp:action:read',
  'mcp:action:write',
  'mcp:log:read',
] as const;

export type ScopeString = (typeof SCOPES)[number];
