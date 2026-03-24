/**
 * @contract FR-005, UX-DASH-001, BR-005
 *
 * Catálogo de atalhos (shortcut cards) do Dashboard + filtro por scopes.
 */

import type { ShortcutCard } from '../types/backoffice-admin.types';

const SHORTCUT_CATALOG: ShortcutCard[] = [
  {
    id: 'shortcut-users',
    label: 'Usuários',
    description: 'Gerencie usuários do sistema',
    icon: 'users',
    route: '/usuarios',
    requiredScope: 'users:user:read',
  },
  {
    id: 'shortcut-roles',
    label: 'Perfis e Permissões',
    description: 'Configure perfis e controle de acesso',
    icon: 'shield',
    route: '/perfis',
    requiredScope: 'users:role:read',
  },
  {
    id: 'shortcut-branches',
    label: 'Filiais',
    description: 'Gerencie filiais e configurações',
    icon: 'building',
    route: '/filiais',
    requiredScope: 'tenants:branch:read',
  },
  {
    id: 'shortcut-audit',
    label: 'Auditoria',
    description: 'Consulte logs e trilha de auditoria',
    icon: 'activity',
    route: '/auditoria',
    requiredScope: 'system:audit:read',
  },
];

export function filterShortcutsByScopes(scopes: string[]): ShortcutCard[] {
  const scopeSet = new Set(scopes);
  return SHORTCUT_CATALOG.filter((card) => scopeSet.has(card.requiredScope));
}
