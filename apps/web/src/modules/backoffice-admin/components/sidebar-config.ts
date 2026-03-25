/**
 * @contract BR-005, FR-004, UX-SHELL-001, DOC-FND-000 §2
 *
 * Catálogo de itens da Sidebar + filtro por scopes.
 * Itens sem scope correspondente NÃO aparecem (BR-005).
 */

import type { SidebarGroup } from '../types/backoffice-admin.types';

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: 'admin',
    label: 'Administração',
    icon: 'settings',
    items: [
      {
        id: 'nav-users',
        label: 'Usuários',
        icon: 'users',
        route: '/usuarios',
        requiredScope: 'users:user:read',
        activeMatch: '/usuarios',
      },
      {
        id: 'nav-roles',
        label: 'Perfis e Permissões',
        icon: 'shield',
        route: '/perfis',
        requiredScope: 'users:role:read',
        activeMatch: '/perfis',
      },
      {
        id: 'nav-branches',
        label: 'Filiais',
        icon: 'building',
        route: '/filiais',
        requiredScope: 'tenants:branch:read',
        activeMatch: '/filiais',
      },
    ],
  },
  {
    id: 'org',
    label: 'Organização',
    icon: 'network',
    items: [
      {
        id: 'nav-org-units',
        label: 'Estrutura Organizacional',
        icon: 'network',
        route: '/org-units',
        requiredScope: 'org:unit:read',
        activeMatch: '/org-units',
      },
    ],
  },
  {
    id: 'identity',
    label: 'Identidade',
    icon: 'fingerprint',
    items: [
      {
        id: 'nav-org-scope',
        label: 'Escopos Organizacionais',
        icon: 'fingerprint',
        route: '/identity/org-scope',
        requiredScope: 'identity:org_scope:read',
        activeMatch: '/identity/org-scope',
      },
      {
        id: 'nav-delegations',
        label: 'Compartilhamentos',
        icon: 'fingerprint',
        route: '/identity/delegations',
        requiredScope: 'identity:share:read',
        activeMatch: '/identity/delegations',
      },
    ],
  },
  {
    id: 'process',
    label: 'Processos',
    icon: 'workflow',
    items: [
      {
        id: 'nav-cycles',
        label: 'Modelagem',
        icon: 'workflow',
        route: '/processos/ciclos',
        requiredScope: 'process:cycle:read',
        activeMatch: '/processos',
      },
      {
        id: 'nav-cases',
        label: 'Casos',
        icon: 'briefcase',
        route: '/cases',
        requiredScope: 'process:case:read',
        activeMatch: '/cases',
      },
    ],
  },
  {
    id: 'params',
    label: 'Parametrização',
    icon: 'sliders',
    items: [
      {
        id: 'nav-framers',
        label: 'Enquadradores',
        icon: 'sliders',
        route: '/framers',
        requiredScope: 'param:framer:read',
        activeMatch: '/framers',
      },
      {
        id: 'nav-routines',
        label: 'Rotinas',
        icon: 'sliders',
        route: '/routines',
        requiredScope: 'param:routine:read',
        activeMatch: '/routines',
      },
    ],
  },
  {
    id: 'integration',
    label: 'Integrações',
    icon: 'plug',
    items: [
      {
        id: 'nav-integration-monitor',
        label: 'Monitor',
        icon: 'plug',
        route: '/integration/monitor',
        requiredScope: 'integration:log:read',
        activeMatch: '/integration/monitor',
      },
      {
        id: 'nav-integration-routines',
        label: 'Rotinas de Integração',
        icon: 'plug',
        route: '/integration/routines',
        requiredScope: 'integration:routine:write',
        activeMatch: '/integration/routines',
      },
    ],
  },
  {
    id: 'approval',
    label: 'Aprovações',
    icon: 'inbox',
    items: [
      {
        id: 'nav-approval-inbox',
        label: 'Caixa de Entrada',
        icon: 'inbox',
        route: '/approvals/inbox',
        requiredScope: 'approval:movement:read',
        activeMatch: '/approvals/inbox',
      },
      {
        id: 'nav-approval-config',
        label: 'Regras',
        icon: 'inbox',
        route: '/approvals/config',
        requiredScope: 'approval:rule:read',
        activeMatch: '/approvals/config',
      },
    ],
  },
  {
    id: 'mcp',
    label: 'Automação',
    icon: 'bot',
    items: [
      {
        id: 'nav-mcp-agents',
        label: 'Agentes MCP',
        icon: 'bot',
        route: '/mcp/agents',
        requiredScope: 'mcp:agent:read',
        activeMatch: '/mcp/agents',
      },
      {
        id: 'nav-mcp-executions',
        label: 'Execuções',
        icon: 'bot',
        route: '/mcp/executions',
        requiredScope: 'mcp:log:read',
        activeMatch: '/mcp/executions',
      },
    ],
  },
  {
    id: 'system',
    label: 'Sistema',
    icon: 'cpu',
    items: [
      {
        id: 'nav-audit',
        label: 'Auditoria',
        icon: 'activity',
        route: '/auditoria',
        requiredScope: 'system:audit:read',
        activeMatch: '/auditoria',
      },
    ],
  },
];

export function filterSidebarByScopes(scopes: string[]): SidebarGroup[] {
  const scopeSet = new Set(scopes);

  return SIDEBAR_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => scopeSet.has(item.requiredScope)),
  })).filter((group) => group.items.length > 0);
}
