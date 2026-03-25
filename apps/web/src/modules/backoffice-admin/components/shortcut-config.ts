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
    id: 'shortcut-org',
    label: 'Estrutura Organizacional',
    description: 'Gerencie a árvore organizacional',
    icon: 'network',
    route: '/org-units',
    requiredScope: 'org:unit:read',
  },
  {
    id: 'shortcut-process',
    label: 'Processos',
    description: 'Modele ciclos e fluxos de trabalho',
    icon: 'workflow',
    route: '/processos/ciclos',
    requiredScope: 'process:cycle:read',
  },
  {
    id: 'shortcut-cases',
    label: 'Casos',
    description: 'Acompanhe casos em andamento',
    icon: 'briefcase',
    route: '/cases',
    requiredScope: 'process:case:read',
  },
  {
    id: 'shortcut-approvals',
    label: 'Aprovações',
    description: 'Gerencie aprovações pendentes',
    icon: 'inbox',
    route: '/approvals/inbox',
    requiredScope: 'approval:movement:read',
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
