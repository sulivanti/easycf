/**
 * @contract UX-APROV-001, FR-004, FR-005, FR-006, FR-007, FR-008
 *
 * Approval Inbox page with 3 tabs: "Meu Inbox", "Todos os Movimentos" (admin),
 * "Enviados por Mim". Split-view with movement list + detail panel.
 * Approve/reject forms, override modal, segregation enforcement.
 * Toast via sonner for UX-008 feedback.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button, Input, Skeleton } from '@shared/ui';
import {
  useMovements,
  useMovementDetail,
  useCancelMovement,
  useOverrideMovement,
} from '../../hooks/use-movements.js';
import { useApproveMovement, useRejectMovement } from '../../hooks/use-approvals.js';
import { MovementCard } from '../../components/MovementCard.js';
import { MovementDetailPanel } from '../../components/MovementDetailPanel.js';
import { ApproveRejectForm } from '../../components/ApproveRejectForm.js';
import { OverrideModal } from '../../components/OverrideModal.js';
import type { MovementListParams, MovementStatus } from '../../types/movement-approval.types.js';

type TabKey = 'inbox' | 'all' | 'sent';

interface TabDef {
  key: TabKey;
  label: string;
}

const TABS: TabDef[] = [
  { key: 'inbox', label: 'Meu Inbox' },
  { key: 'all', label: 'Todos os Movimentos' },
  { key: 'sent', label: 'Enviados por Mim' },
];

const STATUS_OPTIONS: { value: MovementStatus | ''; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'PENDING_APPROVAL', label: 'Pendente' },
  { value: 'APPROVED', label: 'Aprovado' },
  { value: 'AUTO_APPROVED', label: 'Auto-Aprovado' },
  { value: 'REJECTED', label: 'Rejeitado' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'OVERRIDDEN', label: 'Override' },
  { value: 'EXECUTED', label: 'Executado' },
  { value: 'FAILED', label: 'Falhou' },
];

interface ApprovalInboxPageProps {
  currentUserId: string;
  isAdmin?: boolean;
}

export function ApprovalInboxPage({ currentUserId, isAdmin }: ApprovalInboxPageProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('inbox');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MovementStatus | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [showOverride, setShowOverride] = useState(false);

  const params: MovementListParams = {
    tab: activeTab,
    status: statusFilter || undefined,
    search: search || undefined,
  };

  const movementsQuery = useMovements(params);
  const detailQuery = useMovementDetail(selectedId);
  const approveMut = useApproveMovement();
  const rejectMut = useRejectMovement();
  const cancelMut = useCancelMovement();
  const overrideMut = useOverrideMovement();

  const movements = movementsQuery.data;
  const detail = detailQuery.data ?? null;

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    const timeout = setTimeout(() => setSearch(value), 400);
    return () => clearTimeout(timeout);
  }, []);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSelectedId(null);
  };

  const handleApprove = (movementId: string, opinion: string) => {
    approveMut.mutate(
      { movementId, data: { opinion } },
      {
        onSuccess: () => {
          toast.success('Movimento aprovado com sucesso');
          setSelectedId(null);
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : 'Erro ao aprovar movimento.';
          toast.error(msg);
        },
      },
    );
  };

  const handleReject = (movementId: string, opinion: string) => {
    rejectMut.mutate(
      { movementId, data: { opinion } },
      {
        onSuccess: () => {
          toast.success('Movimento rejeitado com sucesso');
          setSelectedId(null);
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : 'Erro ao rejeitar movimento.';
          toast.error(msg);
        },
      },
    );
  };

  const handleCancel = (movementId: string) => {
    cancelMut.mutate(movementId, {
      onSuccess: () => {
        toast.success('Movimento cancelado');
        setSelectedId(null);
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Erro ao cancelar movimento.';
        toast.error(msg);
      },
    });
  };

  const handleOverride = (justification: string) => {
    if (!detail) return;
    overrideMut.mutate(
      { id: detail.id, data: { justification, confirmation: true } },
      {
        onSuccess: () => {
          toast.success('Override aplicado com sucesso');
          setShowOverride(false);
          setSelectedId(null);
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : 'Erro ao aplicar override.';
          toast.error(msg);
        },
      },
    );
  };

  const isSegregated = detail ? currentUserId === detail.requester_id : false;
  const visibleTabs = isAdmin ? TABS : TABS.filter((t) => t.key !== 'all');

  return (
    <div className="-m-6 flex h-[calc(100vh-52px)] flex-col">
      {/* Page Header — A1 */}
      <header className="flex items-center justify-between border-b border-a1-border bg-white px-6 py-4.5">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-lg font-extrabold tracking-[-0.4px] text-a1-text-primary">
            Aprovações
          </h1>
          <p className="font-display text-[11px] text-a1-text-hint">
            Gerencie movimentos pendentes de aprovação
          </p>
        </div>
      </header>

      {/* Tabs — A1 */}
      <nav
        className="flex gap-1 border-b border-a1-border bg-white px-6"
        aria-label="Painéis de aprovação"
      >
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2.5 font-display text-[13px] font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-[2.5px] border-primary-600 text-primary-600'
                : 'text-a1-text-auxiliary hover:text-a1-text-primary'
            }`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Filters */}
      <div className="flex items-center gap-3 border-b border-a1-border bg-white px-6 py-3">
        <Input
          type="search"
          placeholder="Buscar por código ou operação..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-xs border-a1-border bg-white font-display text-[13px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MovementStatus | '')}
          className="rounded-[7px] border border-a1-border bg-white px-3 py-2 font-display text-[13px] text-a1-text-tertiary"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => movementsQuery.refetch()}
          disabled={movementsQuery.isFetching}
          className="border-a1-border font-display text-[13px]"
        >
          Atualizar
        </Button>
      </div>

      {/* Error */}
      {movementsQuery.isError && (
        <div className="mx-6 mt-3 rounded-md bg-status-error-bg px-4 py-2 font-display text-[13px] text-danger-600">
          {movementsQuery.error instanceof Error
            ? movementsQuery.error.message
            : 'Erro ao carregar movimentos.'}
        </div>
      )}

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Movement list */}
        <div className="w-full max-w-md shrink-0 overflow-y-auto border-r border-a1-border bg-white p-4 space-y-3 lg:w-[40%]">
          {movementsQuery.isLoading && !movements ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          ) : movements && movements.data.length > 0 ? (
            <>
              {movements.data.map((m) => (
                <MovementCard
                  key={m.id}
                  movement={m}
                  selected={selectedId === m.id}
                  onSelect={setSelectedId}
                />
              ))}
              {movements.has_more && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={movementsQuery.isFetching}
                >
                  {movementsQuery.isFetching ? 'Carregando...' : 'Carregar mais'}
                </Button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-a1-text-auxiliary">
                {activeTab === 'inbox'
                  ? 'Nenhuma aprovação pendente.'
                  : activeTab === 'sent'
                    ? 'Você ainda não solicitou nenhum movimento controlado.'
                    : 'Nenhum movimento encontrado.'}
              </p>
              {(statusFilter || search) && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setStatusFilter('');
                    setSearch('');
                    setSearchInput('');
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="flex-1 overflow-y-auto">
          {detail ? (
            <MovementDetailPanel
              movement={detail}
              loading={detailQuery.isLoading}
              currentUserId={currentUserId}
            >
              {/* Approve/Reject form — inbox tab + pending */}
              {detail.status === 'PENDING_APPROVAL' && activeTab === 'inbox' && (
                <ApproveRejectForm
                  movementId={detail.id}
                  isSegregated={isSegregated}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  loading={approveMut.isPending || rejectMut.isPending}
                  error={approveMut.error?.message || rejectMut.error?.message || null}
                />
              )}

              {/* Cancel button — sent tab + pending + requester */}
              {detail.status === 'PENDING_APPROVAL' &&
                activeTab === 'sent' &&
                currentUserId === detail.requester_id && (
                  <Button
                    variant="outline"
                    onClick={() => handleCancel(detail.id)}
                    disabled={cancelMut.isPending}
                    isLoading={cancelMut.isPending}
                  >
                    Cancelar Movimento
                  </Button>
                )}

              {/* Override button — admin + pending */}
              {detail.status === 'PENDING_APPROVAL' && isAdmin && (
                <Button variant="destructive" onClick={() => setShowOverride(true)}>
                  Override
                </Button>
              )}
            </MovementDetailPanel>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-a1-text-auxiliary">
                Selecione um movimento para ver os detalhes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Override modal */}
      {detail && (
        <OverrideModal
          open={showOverride}
          movementCode={detail.codigo}
          onConfirm={handleOverride}
          onClose={() => setShowOverride(false)}
          loading={overrideMut.isPending}
          error={overrideMut.error?.message || null}
        />
      )}
    </div>
  );
}
