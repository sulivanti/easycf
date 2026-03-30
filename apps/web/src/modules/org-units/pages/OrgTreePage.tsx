/**
 * @contract UX-001, UX-001-M01 D1/D3, FR-002, DOC-UX-010
 * Page: Organizational Tree (UX-ORG-001)
 * Route: /organizacao
 *
 * Layout: split-panel (TreePanel 380px + DetailPanel flex).
 * FormPanel inline 480px replaces tree when open — route does NOT change.
 * States: loading (skeleton), empty, empty_search, error, loaded.
 * Tailwind CSS v4 + shared UI.
 */

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@shared/ui/button.js';
import { Skeleton } from '@shared/ui/skeleton.js';
import { SearchBar } from '@shared/ui/search-bar';
import { EmptyState } from '@shared/ui/empty-state';
import { toast } from 'sonner';
import { useOrgTree } from '../hooks/use-org-tree.js';
import { useOrgUnitDetail } from '../hooks/use-org-unit-detail.js';
import {
  useDeleteOrgUnit,
  useRestoreOrgUnit,
  useUnlinkTenant,
} from '../hooks/use-org-unit-actions.js';
import { filterTree, canWriteOrgUnit, COPY } from '../types/org-units.types.js';
import { toDetailVM } from '../types/org-units.types.js';
import { OrgTreeNode } from '../components/OrgTreeNode.js';
import { DetailPanel } from '../components/DetailPanel.js';
import { DeactivateModal } from '../components/DeactivateModal.js';
import { OrgFormPage } from './OrgFormPage.js';
import { ConfirmationModal } from '@shared/ui/confirmation-modal';

export interface OrgTreePageProps {
  userScopes: readonly string[];
  onNavigateHistory: (id: string) => void;
}

interface DeactivateState {
  open: boolean;
  id: string;
  codigo: string;
  nome: string;
  activeChildrenCount: number;
}

interface ConfirmState {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}

type FormPanelState =
  | { open: false }
  | { open: true; mode: 'create'; parentId?: string }
  | { open: true; mode: 'edit'; editId: string };

const DEACTIVATE_INITIAL: DeactivateState = {
  open: false,
  id: '',
  codigo: '',
  nome: '',
  activeChildrenCount: 0,
};

const CONFIRM_INITIAL: ConfirmState = {
  open: false,
  title: '',
  description: '',
  confirmLabel: '',
  onConfirm: () => {},
};

export function OrgTreePage({ userScopes, onNavigateHistory }: OrgTreePageProps) {
  const { data: tree, isLoading, isError, refetch } = useOrgTree();
  const deleteMutation = useDeleteOrgUnit();
  const restoreMutation = useRestoreOrgUnit();
  const unlinkMutation = useUnlinkTenant();

  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formPanel, setFormPanel] = useState<FormPanelState>({ open: false });
  const [deactivate, setDeactivate] = useState<DeactivateState>(DEACTIVATE_INITIAL);
  const [confirm, setConfirm] = useState<ConfirmState>(CONFIRM_INITIAL);

  // Detail query — returns raw DTO, transformed to DetailVM here
  const { data: detailDTO, isLoading: detailLoading } = useOrgUnitDetail(selectedId);
  const detailVM = useMemo(() => (detailDTO ? toDetailVM(detailDTO) : null), [detailDTO]);

  const filteredTree = useMemo(() => filterTree(tree ?? [], searchTerm), [tree, searchTerm]);

  const closeConfirm = useCallback(() => setConfirm(CONFIRM_INITIAL), []);
  const hasWrite = canWriteOrgUnit(userScopes);

  // ── Handlers ────────────────────────────────────────────────

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleOpenCreate = useCallback((parentId?: string) => {
    setFormPanel({ open: true, mode: 'create', parentId });
  }, []);

  const handleOpenEdit = useCallback((id: string) => {
    setFormPanel({ open: true, mode: 'edit', editId: id });
  }, []);

  const handleFormClose = useCallback(() => {
    setFormPanel({ open: false });
  }, []);

  const handleFormSuccess = useCallback((id: string) => {
    setFormPanel({ open: false });
    setSelectedId(id);
  }, []);

  const handleDelete = useCallback(
    (id: string, codigo: string, nome: string, activeChildCount: number) => {
      setDeactivate({ open: true, id, codigo, nome, activeChildrenCount: activeChildCount });
    },
    [],
  );

  const handleConfirmDelete = useCallback(() => {
    const { id, codigo, nome } = deactivate;
    setDeactivate(DEACTIVATE_INITIAL);
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success(COPY.toast.deleteSuccess(codigo, nome)),
      onError: (err) => toast.error(err instanceof Error ? err.message : COPY.error.unexpected),
    });
  }, [deactivate, deleteMutation]);

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

  // ── Loading state ─────────────────────────────────────────

  if (isLoading) {
    return (
      <div
        className="flex h-full"
        aria-busy="true"
        aria-label="Carregando estrutura organizacional"
      >
        <div className="w-[340px] shrink-0 space-y-3 border-r border-a1-border bg-white p-5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-10 w-full rounded-lg" />
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-7 rounded-md" style={{ width: `${70 + i * 4}%` }} />
          ))}
        </div>
        <div className="flex-1 bg-[var(--color-neutral-50)] p-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="mt-5 h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center" role="alert">
        <div className="text-center">
          <p className="text-danger-600 mb-4">{COPY.error.loadFailed}</p>
          <Button variant="outline" onClick={() => refetch()}>
            {COPY.label.retry}
          </Button>
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────

  if (!tree || tree.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          title={COPY.label.emptyState}
          action={
            hasWrite ? (
              <Button onClick={() => handleOpenCreate()}>{COPY.label.createFirst}</Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  // ── Loaded state — split panel ────────────────────────────

  return (
    <div className="flex h-full -m-6">
      {/* Left panel: tree or form */}
      {formPanel.open ? (
        <OrgFormPage
          mode={formPanel.mode}
          editId={formPanel.mode === 'edit' ? formPanel.editId : undefined}
          parentId={formPanel.mode === 'create' ? formPanel.parentId : undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormClose}
        />
      ) : (
        <div className="flex w-[340px] shrink-0 flex-col border-r border-a1-border bg-white">
          {/* Tree header */}
          <div className="shrink-0 p-5 pb-3">
            <h2 className="text-base font-extrabold text-a1-text-primary">Estrutura de Unidades</h2>
            <p className="mt-0.5 text-xs text-a1-text-hint">Navegue pela hierarquia do grupo</p>
            <div className="mt-3">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nome ou código..."
                className="w-full"
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[12px] text-a1-text-hint cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="accent-primary-600"
                />
                Mostrar inativos
              </label>
              {hasWrite && (
                <Button
                  size="sm"
                  onClick={() => handleOpenCreate()}
                  className="h-7 gap-1 text-[11px]"
                >
                  + Nova Unidade
                </Button>
              )}
            </div>
          </div>

          {/* Tree body */}
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {filteredTree.length === 0 && searchTerm.trim() !== '' && (
              <EmptyState title={COPY.label.emptySearch} className="py-8" />
            )}

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
                    selectedId={selectedId}
                    userScopes={userScopes}
                    onSelect={handleSelect}
                    onCreateChild={handleOpenCreate}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    onLinkTenant={(id) => handleOpenEdit(id)}
                    onUnlinkTenant={handleUnlinkTenant}
                    onViewHistory={onNavigateHistory}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Right panel: detail */}
      <div className="flex-1 bg-[var(--color-neutral-50)]">
        <DetailPanel
          detail={detailVM}
          isLoading={detailLoading && !!selectedId}
          userScopes={userScopes}
          onEdit={handleOpenEdit}
          onCreateChild={handleOpenCreate}
        />
      </div>

      {/* Deactivate modal (UX-001-M01 D7) */}
      <DeactivateModal
        open={deactivate.open}
        onOpenChange={(open) => !open && setDeactivate(DEACTIVATE_INITIAL)}
        codigo={deactivate.codigo}
        nome={deactivate.nome}
        activeChildrenCount={deactivate.activeChildrenCount}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Restore/unlink confirmation modal (generic) */}
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
  );
}
