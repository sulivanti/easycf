/**
 * @contract UX-001, UX-001-M01 D8, DOC-UX-010
 * Recursive tree node component for the organizational hierarchy.
 * ARIA: role="treeitem", aria-expanded, aria-level, aria-setsize, aria-posinset.
 * Visual: selected state (#E3F2FD), dot for leaves, chevrons, Lucide icons.
 * Tailwind CSS v4 + shared UI (Badge, Button, DropdownMenu).
 */

import { useState, useCallback } from 'react';
import {
  BuildingIcon,
  BriefcaseIcon,
  LayersIcon,
  FolderIcon,
  MapPinIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import { Button } from '@shared/ui/button.js';
import { Badge } from '@shared/ui/badge.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@shared/ui/dropdown-menu.js';
import type { OrgUnitTreeNodeVM, OrgUnitNivel } from '../types/org-units.types.js';
import { TENANT_LEVEL_INFO } from '../types/org-units.types.js';

// ── Level icon map (UX-001-M01 D8) ─────────────────────────

const LEVEL_ICON_MAP: Record<OrgUnitNivel, React.ComponentType<{ className?: string }>> = {
  1: BuildingIcon,
  2: BriefcaseIcon,
  3: LayersIcon,
  4: FolderIcon,
};

function getLevelIcon(nivel: OrgUnitNivel) {
  return LEVEL_ICON_MAP[nivel] ?? BuildingIcon;
}

// ── Props ───────────────────────────────────────────────────

export interface OrgTreeNodeProps {
  node: OrgUnitTreeNodeVM;
  level: number;
  posInSet: number;
  setSize: number;
  defaultExpanded?: boolean;
  showInactive: boolean;
  selectedId: string | null;
  userScopes: readonly string[];
  onSelect: (id: string) => void;
  onCreateChild: (parentId: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, codigo: string, nome: string, activeChildCount: number) => void;
  onRestore: (id: string, codigo: string, nome: string) => void;
  onLinkTenant: (id: string) => void;
  onUnlinkTenant: (
    orgUnitId: string,
    tenantId: string,
    tenantCodigo: string,
    orgUnitNome: string,
  ) => void;
  onViewHistory: (id: string) => void;
}

export function OrgTreeNode({
  node,
  level,
  posInSet,
  setSize,
  defaultExpanded = false,
  showInactive,
  selectedId,
  userScopes,
  onSelect,
  onCreateChild,
  onEdit,
  onDelete,
  onRestore,
  onLinkTenant,
  onUnlinkTenant,
  onViewHistory,
}: OrgTreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isSelected = selectedId === node.id;
  const isLeaf = !node.canExpand;
  const Icon = getLevelIcon(node.nivel);

  const toggleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (node.canExpand) setExpanded((prev) => !prev);
    },
    [node.canExpand],
  );

  const handleSelect = useCallback(() => {
    onSelect(node.id);
    if (node.canExpand && !expanded) setExpanded(true);
  }, [node.id, node.canExpand, expanded, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          if (node.canExpand && !expanded) {
            setExpanded(true);
            e.preventDefault();
          }
          break;
        case 'ArrowLeft':
          if (expanded) {
            setExpanded(false);
            e.preventDefault();
          }
          break;
        case 'Enter':
          onSelect(node.id);
          e.preventDefault();
          break;
      }
    },
    [expanded, node.canExpand, node.id, onSelect],
  );

  const visibleChildren = showInactive ? node.children : node.children.filter((c) => !c.isInactive);

  const hasWrite = userScopes.includes('org:unit:write');
  const hasDelete = userScopes.includes('org:unit:delete');
  const activeChildCount = node.children.filter((c) => !c.isInactive).length;

  return (
    <li
      role="treeitem"
      aria-expanded={node.canExpand ? expanded : undefined}
      aria-level={level}
      aria-setsize={setSize}
      aria-posinset={posInSet}
      aria-label={`${node.levelInfo.shortLabel} ${node.nome} — ${node.statusBadge.label}`}
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={node.isInactive ? 'opacity-50' : ''}
    >
      {/* Node row */}
      <div
        className={`group flex cursor-pointer items-center gap-2 rounded-md py-1.5 pr-2 transition-colors ${
          isSelected ? 'bg-primary-50 text-primary-700' : 'hover:bg-[var(--color-neutral-50)]'
        }`}
        style={{ paddingLeft: `${(level - 1) * 1.25 + 0.5}rem` }}
        onClick={handleSelect}
        role="button"
        tabIndex={-1}
      >
        {/* Expand/collapse chevron or leaf dot */}
        {!isLeaf ? (
          <button
            type="button"
            aria-hidden="true"
            className="flex size-5 shrink-0 items-center justify-center rounded text-a1-text-hint hover:text-a1-text-secondary"
            onClick={toggleExpand}
          >
            {expanded ? (
              <ChevronDownIcon className="size-3.5" />
            ) : (
              <ChevronRightIcon className="size-3.5" />
            )}
          </button>
        ) : (
          <span className="flex size-5 shrink-0 items-center justify-center">
            <span className="size-2 rounded-full bg-a1-text-hint" />
          </span>
        )}

        {/* Level icon */}
        <Icon
          className={`size-4 shrink-0 ${isSelected ? 'text-primary-600' : 'text-a1-text-hint'}`}
        />

        {/* Name */}
        <span
          className={`truncate text-[13px] ${
            isSelected ? 'font-bold text-primary-700' : 'font-medium text-a1-text-secondary'
          }`}
        >
          {node.nome}
        </span>

        {/* Inactive badge */}
        {node.isInactive && (
          <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">
            Inativo
          </Badge>
        )}

        {/* Child count */}
        {node.childCount > 0 && !node.isInactive && (
          <span className="ml-auto shrink-0 text-[11px] text-a1-text-hint">
            ({node.childCount})
          </span>
        )}

        {/* Context menu */}
        <div
          className="shrink-0 opacity-0 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <span className="sr-only">Ações de {node.nome}</span>
                <MoreHorizontalIcon className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {hasWrite && !node.isInactive && node.nivel < 4 && (
                <DropdownMenuItem onClick={() => onCreateChild(node.id)}>
                  Novo filho
                </DropdownMenuItem>
              )}
              {hasWrite && !node.isInactive && (
                <DropdownMenuItem onClick={() => onEdit(node.id)}>Editar</DropdownMenuItem>
              )}
              {hasDelete && !node.isInactive && (
                <DropdownMenuItem
                  onClick={() => onDelete(node.id, node.codigo, node.nome, activeChildCount)}
                >
                  Desativar
                </DropdownMenuItem>
              )}
              {hasWrite && node.isInactive && (
                <DropdownMenuItem onClick={() => onRestore(node.id, node.codigo, node.nome)}>
                  Restaurar
                </DropdownMenuItem>
              )}
              {hasWrite && node.nivel === 4 && !node.isInactive && (
                <DropdownMenuItem onClick={() => onLinkTenant(node.id)}>
                  Vincular tenant
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewHistory(node.id)}>
                Ver histórico
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tenant chips (N4 only) */}
      {expanded && node.tenants.length > 0 && (
        <ul className="list-none" style={{ paddingLeft: `${level * 1.25 + 2}rem` }}>
          {node.tenants.map((t) => (
            <li key={t.tenantId} className="flex items-center gap-1.5 py-0.5">
              <MapPinIcon
                className="size-3.5 text-a1-text-hint"
                aria-label={TENANT_LEVEL_INFO.label}
              />
              <span className="text-[13px] text-a1-text-auxiliary">
                {t.codigo} — {t.name}
              </span>
              {hasDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-xs text-danger-500"
                  onClick={() => onUnlinkTenant(node.id, t.tenantId, t.codigo, node.nome)}
                  aria-label={`Desvincular ${t.codigo} de ${node.nome}`}
                >
                  ✕
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Children (recursive) */}
      {expanded && visibleChildren.length > 0 && (
        <ul role="group" className="list-none p-0">
          {visibleChildren.map((child, idx) => (
            <OrgTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              posInSet={idx + 1}
              setSize={visibleChildren.length}
              showInactive={showInactive}
              selectedId={selectedId}
              userScopes={userScopes}
              onSelect={onSelect}
              onCreateChild={onCreateChild}
              onEdit={onEdit}
              onDelete={onDelete}
              onRestore={onRestore}
              onLinkTenant={onLinkTenant}
              onUnlinkTenant={onUnlinkTenant}
              onViewHistory={onViewHistory}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
