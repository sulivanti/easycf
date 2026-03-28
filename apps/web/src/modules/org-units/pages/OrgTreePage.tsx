/**
 * @contract UX-001, FR-002, DOC-UX-010
 * Page: Organizational Tree (UX-ORG-001)
 * Route: /organizacao
 *
 * States: loading (skeleton), empty, empty_search, error, loaded.
 * Features: tree view, client-side search, toggle inactive, context-menu CRUD.
 * Tailwind CSS v4 + shared UI (Button, Input, Skeleton, Dialog).
 */

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@shared/ui/button.js';
import { Skeleton } from '@shared/ui/skeleton.js';
import { ConfirmationModal } from '@shared/ui/confirmation-modal';
import { PageHeader } from '@shared/ui/page-header';
import { SearchBar } from '@shared/ui/search-bar';
import { EmptyState } from '@shared/ui/empty-state';
import { toast } from 'sonner';
import { useOrgTree } from '../hooks/use-org-tree.js';
import {
  useDeleteOrgUnit,
  useRestoreOrgUnit,
  useUnlinkTenant,
} from '../hooks/use-org-unit-actions.js';
import { filterTree, canWriteOrgUnit, COPY } from '../types/org-units.types.js';
import { OrgTreeNode } from '../components/OrgTreeNode.js';

export interface OrgTreePageProps {
  userScopes: readonly string[];
  onNavigateCreate: (parentId?: string) => void;
  onNavigateEdit: (id: string) => void;
  onNavigateHistory: (id: string) => void;
}

interface ConfirmState {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}

const CONFIRM_INITIAL: ConfirmState = {
  open: false,
  title: '',
  description: '',
  confirmLabel: '',
  onConfirm: () => {},
};

export function OrgTreePage({
  userScopes,
  onNavigateCreate,
  onNavigateEdit,
  onNavigateHistory,
}: OrgTreePageProps) {
  const { data: tree, isLoading, isError, refetch } = useOrgTree();
  const deleteMutation = useDeleteOrgUnit();
  const restoreMutation = useRestoreOrgUnit();
  const unlinkMutation = useUnlinkTenant();

  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(CONFIRM_INITIAL);

  const filteredTree = useMemo(() => filterTree(tree ?? [], searchTerm), [tree, searchTerm]);

  const closeConfirm = useCallback(() => setConfirm(CONFIRM_INITIAL), []);

  const handleCreateChild = useCallback(
    (parentId: string) => onNavigateCreate(parentId),
    [onNavigateCreate],
  );

  const handleDelete = useCallback(
    (id: string, codigo: string, nome: string) => {
      setConfirm({
        open: true,
        title: COPY.modal.deleteTitle,
        description: COPY.modal.deleteBody(codigo, nome),
        confirmLabel: COPY.modal.deleteConfirm,
        onConfirm: () => {
          closeConfirm();
          deleteMutation.mutate(id, {
            onSuccess: () => toast.success(COPY.toast.deleteSuccess(codigo, nome)),
            onError: (err) =>
              toast.error(err instanceof Error ? err.message : COPY.error.unexpected),
          });
        },
      });
    },
    [deleteMutation, closeConfirm],
  );

  const handleRestore = useCallback(
    (id: string, codigo: string, nome: string) => {
      setConfirm({
        open: true,
        title: COPY.modal.restoreTitle,
        description: COPY.modal.restoreBody(codigo, nome),
        confirmLabel: COPY.modal.restoreConfirm,
        onConfirm: () => {
          closeConfirm();
          restoreMutation.mutate(id, {
            onSuccess: () => toast.success(COPY.toast.restoreSuccess(codigo, nome)),
            onError: (err) =>
              toast.error(err instanceof Error ? err.message : COPY.error.unexpected),
          });
        },
      });
    },
    [restoreMutation, closeConfirm],
  );

  const handleUnlinkTenant = useCallback(
    (orgUnitId: string, tenantId: string, tenantCodigo: string, orgUnitNome: string) => {
      setConfirm({
        open: true,
        title: COPY.modal.unlinkTitle,
        description: COPY.modal.unlinkBody(tenantCodigo, orgUnitNome),
        confirmLabel: COPY.modal.unlinkConfirm,
        onConfirm: () => {
          closeConfirm();
          unlinkMutation.mutate(
            { orgUnitId, tenantId },
            {
              onSuccess: () =>
                toast.success(COPY.toast.unlinkTenantSuccess(tenantCodigo, orgUnitNome)),
              onError: (err) =>
                toast.error(err instanceof Error ? err.message : COPY.error.unexpected),
            },
          );
        },
      });
    },
    [unlinkMutation, closeConfirm],
  );

  // -- Loading state --
  if (isLoading) {
    return (
      <div
        className="p-6 space-y-3"
        aria-busy="true"
        aria-label="Carregando estrutura organizacional"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton
            key={i}
            className="h-6 rounded-md bg-a1-border"
            style={{ width: `${60 + i * 6}%` }}
          />
        ))}
      </div>
    );
  }

  // -- Error state --
  if (isError) {
    return (
      <div className="p-6 text-center" role="alert">
        <p className="text-danger-600 mb-4">{COPY.error.loadFailed}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {COPY.label.retry}
        </Button>
      </div>
    );
  }

  // -- Empty state --
  if (!tree || tree.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title={COPY.label.emptyState}
          action={
            canWriteOrgUnit(userScopes) ? (
              <Button onClick={() => onNavigateCreate()}>{COPY.label.createFirst}</Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="-m-6">
      <PageHeader
        title="Estrutura Organizacional"
        description="Hierarquia N1 → N4 · Nível e parent_id imutáveis após criação"
        actions={
          <div className="flex items-center gap-2">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por nome ou código..."
              className="w-56"
            />
            {canWriteOrgUnit(userScopes) && (
              <Button
                onClick={() => onNavigateCreate()}
                className="bg-a1-dark font-display text-[13px] font-bold text-white hover:bg-a1-dark/90"
              >
                + Nova Unidade
              </Button>
            )}
          </div>
        }
      />

      <div className="p-6">
        {/* Show inactive toggle */}
        <label className="mb-4 flex items-center gap-1.5 font-display text-[13px] text-a1-text-auxiliary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="accent-primary-600"
          />
          Mostrar inativos
        </label>

        {/* Empty search */}
        {filteredTree.length === 0 && searchTerm.trim() !== '' && (
          <EmptyState title={COPY.label.emptySearch} />
        )}

        {/* Tree */}
        {filteredTree.length > 0 && (
          <ul role="tree" aria-label="Árvore organizacional" className="list-none p-0">
            {filteredTree.map((node, idx) => (
              <OrgTreeNode
                key={node.id}
                node={node}
                level={1}
                posInSet={idx + 1}
                setSize={filteredTree.length}
                defaultExpanded
                showInactive={showInactive}
                userScopes={userScopes}
                onCreateChild={handleCreateChild}
                onEdit={onNavigateEdit}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onLinkTenant={(id) => onNavigateEdit(id)}
                onUnlinkTenant={handleUnlinkTenant}
                onViewHistory={onNavigateHistory}
              />
            ))}
          </ul>
        )}

        {/* Confirmation dialog */}
        <ConfirmationModal
          open={confirm.open}
          onOpenChange={(open) => !open && closeConfirm()}
          title={confirm.title}
          description={confirm.description}
          variant="destructive"
          confirmLabel={confirm.confirmLabel}
          cancelLabel={COPY.modal.cancel}
          onConfirm={confirm.onConfirm}
        />
      </div>
    </div>
  );
}
