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
