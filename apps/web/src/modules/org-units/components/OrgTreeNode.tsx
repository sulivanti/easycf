/**
 * @contract UX-001, DOC-UX-010
 * Recursive tree node component for the organizational hierarchy.
 * ARIA: role="treeitem", aria-expanded, aria-level, aria-setsize, aria-posinset.
 * Icons by level, tenant chips on N4, context menu for actions.
 * Tailwind CSS v4 + shared UI (Badge, Button, DropdownMenu).
 */

import { useState, useCallback } from 'react';
import { Button } from '@shared/ui/button.js';
import { Badge } from '@shared/ui/badge.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@shared/ui/dropdown-menu.js';
import type { OrgUnitTreeNodeVM } from '../types/org-units.types.js';
import { TENANT_LEVEL_INFO } from '../types/org-units.types.js';

export interface OrgTreeNodeProps {
  node: OrgUnitTreeNodeVM;
  level: number;
  posInSet: number;
  setSize: number;
  defaultExpanded?: boolean;
  showInactive: boolean;
  userScopes: readonly string[];
  onCreateChild: (parentId: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, codigo: string, nome: string) => void;
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
  userScopes,
  onCreateChild,
  onEdit,
  onDelete,
  onRestore,
  onLinkTenant,
  onUnlinkTenant,
  onViewHistory,
}: OrgTreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpand = useCallback(() => {
    if (node.canExpand) setExpanded((prev) => !prev);
  }, [node.canExpand]);

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
          onEdit(node.id);
          e.preventDefault();
          break;
      }
    },
    [expanded, node.canExpand, node.id, onEdit],
  );

  const visibleChildren = showInactive ? node.children : node.children.filter((c) => !c.isInactive);

  const hasWrite = userScopes.includes('org:unit:write');
  const hasDelete = userScopes.includes('org:unit:delete');

  return (
    <li
      role="treeitem"
      aria-expanded={node.canExpand ? expanded : undefined}
      aria-level={level}
      aria-setsize={setSize}
      aria-posinset={posInSet}
      aria-label={`${node.levelInfo.shortLabel} ${node.nome} — ${node.statusBadge.label}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={node.isInactive ? 'opacity-50' : ''}
    >
      {/* Node header */}
      <div
        className="flex items-center gap-2 py-1 rounded-md hover:bg-muted/50 transition-colors"
        style={{ paddingLeft: `${(level - 1) * 1.5}rem` }}
        onClick={toggleExpand}
        role="button"
        tabIndex={-1}
      >
        {/* Expand/collapse indicator */}
        {node.canExpand ? (
          <span
            aria-hidden="true"
            className="w-4 text-center text-muted-foreground text-xs select-none"
          >
            {expanded ? '▾' : '▸'}
          </span>
        ) : (
          <span className="w-4" aria-hidden="true" />
        )}

        {/* Level icon placeholder */}
        <span className="text-muted-foreground text-sm" title={node.levelInfo.label}>
          [{node.levelInfo.icon}]
        </span>

        {/* Node info */}
        <span className="font-semibold text-sm">{node.codigo}</span>
        <span className="text-sm text-muted-foreground">— {node.nome}</span>

        {/* Status badge */}
        {node.isInactive && (
          <Badge variant="outline" className="text-xs">
            Inativo
          </Badge>
        )}

        {/* Child count */}
        {node.childCount > 0 && (
          <span className="text-xs text-muted-foreground">({node.childCount})</span>
        )}

        {/* Context menu */}
        <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <span className="sr-only">Ações de {node.nome}</span>⋯
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
                <DropdownMenuItem onClick={() => onDelete(node.id, node.codigo, node.nome)}>
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
        <ul className="list-none" style={{ paddingLeft: `${level * 1.5 + 1.5}rem` }}>
          {node.tenants.map((t) => (
            <li key={t.tenantId} className="flex items-center gap-1.5 py-0.5">
              <span className="text-muted-foreground text-xs" title={TENANT_LEVEL_INFO.label}>
                [{TENANT_LEVEL_INFO.icon}]
              </span>
              <span className="text-sm">
                {t.codigo} — {t.name}
              </span>
              {hasDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-xs text-destructive"
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
              userScopes={userScopes}
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
