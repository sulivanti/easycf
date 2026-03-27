/**
 * @contract UX-001.2, UX-IDN-002, FR-001.2, FR-001.3
 * 3-tab panel: Shares (admin) | Delegations (all) | Received by Me (all).
 * Shares tab visible only with identity:share:read scope.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Badge,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ConfirmationModal,
  PageHeader,
} from '@shared/ui';
import {
  useAccessShares,
  useMySharedAccesses,
  useRevokeAccessShare,
} from '../hooks/use-access-shares.js';
import { useDelegations, useRevokeDelegation } from '../hooks/use-delegations.js';
import { ShareDrawer } from '../components/ShareDrawer.js';
import { DelegationDrawer } from '../components/DelegationDrawer.js';
import {
  canReadShares,
  canWriteShares,
  canRevokeShares,
  getStatusBadge,
  getExpirationInfo,
  COPY,
  type AccessShareDTO,
  type AccessDelegationDTO,
  type AccessShareFilters,
  type GrantStatus,
} from '../types/identity-advanced.types.js';

type TabId = 'shares' | 'delegations' | 'received';

export interface SharesDelegationsPanelPageProps {
  userScopes: readonly string[];
  currentUserId: string;
  availableScopes: readonly string[];
}

export function SharesDelegationsPanelPage({
  userScopes,
  currentUserId,
  availableScopes,
}: SharesDelegationsPanelPageProps) {
  const hasShareRead = canReadShares(userScopes);
  const hasShareWrite = canWriteShares(userScopes);
  const hasShareRevoke = canRevokeShares(userScopes);

  const defaultTab: TabId = hasShareRead ? 'shares' : 'delegations';
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);

  // ── Shares ──────────────────────────────────────────────────
  const [shareFilters, setShareFilters] = useState<AccessShareFilters>({ status: 'ACTIVE' });
  const shares = useAccessShares(shareFilters);
  const revokeShare = useRevokeAccessShare();

  // ── Delegations ─────────────────────────────────────────────
  const delegations = useDelegations();
  const revokeDelegationMut = useRevokeDelegation();

  // ── Received (my shared accesses) ───────────────────────────
  const myShared = useMySharedAccesses();

  // ── Drawers ─────────────────────────────────────────────────
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
  const [delegationDrawerOpen, setDelegationDrawerOpen] = useState(false);

  // ── Revoke dialog ───────────────────────────────────────────
  const [revokeTarget, setRevokeTarget] = useState<{
    type: 'share' | 'delegation';
    id: string;
  } | null>(null);

  function handleRevoke() {
    if (!revokeTarget) return;

    if (revokeTarget.type === 'share') {
      revokeShare.mutate(revokeTarget.id, {
        onSuccess: () => {
          toast.success(COPY.toast.shareRevoked);
          setRevokeTarget(null);
        },
        onError: () => {
          toast.error(COPY.error.unexpected);
          setRevokeTarget(null);
        },
      });
    } else {
      revokeDelegationMut.mutate(revokeTarget.id, {
        onSuccess: () => {
          toast.success(COPY.toast.delegationRevoked);
          setRevokeTarget(null);
        },
        onError: () => {
          toast.error(COPY.error.unexpected);
          setRevokeTarget(null);
        },
      });
    }
  }

  const isRevoking = revokeShare.isPending || revokeDelegationMut.isPending;

  // ── Tab buttons ─────────────────────────────────────────────
  const tabs: { id: TabId; label: string; visible: boolean }[] = [
    { id: 'shares', label: 'Compartilhamentos', visible: hasShareRead },
    { id: 'delegations', label: 'Delegações', visible: true },
    { id: 'received', label: 'Recebidos por Mim', visible: true },
  ];

  function handleLoadMore() {
    if (shares.data?.next_cursor) {
      setShareFilters((prev) => ({ ...prev, cursor: shares.data!.next_cursor! }));
    }
  }

  function handleFilterStatus(status: GrantStatus | undefined) {
    setShareFilters((prev) => ({ ...prev, status, cursor: undefined }));
  }

  // ── Render helpers ──────────────────────────────────────────

  function renderExpirationBadge(validUntil: string | null, status: GrantStatus) {
    const info = getExpirationInfo(validUntil, status);
    if (!info) return null;
    return (
      <Badge variant={info.variant} aria-label={info.ariaLabel}>
        {info.label}
      </Badge>
    );
  }

  function renderSharesTable(data: AccessShareDTO[]) {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-a1-text-auxiliary">{COPY.label.emptyShares}</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Recurso</TableHead>
            <TableHead>Beneficiário</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Status</TableHead>
            {hasShareRevoke && <TableHead className="w-20">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((share) => {
            const status = getStatusBadge(share.status);
            return (
              <TableRow key={share.id} className={share.status !== 'ACTIVE' ? 'opacity-60' : ''}>
                <TableCell>
                  <span className="font-medium">{share.resource_type}</span>
                  <span className="ml-1 text-a1-text-auxiliary">/ {share.resource_id}</span>
                </TableCell>
                <TableCell className="font-mono text-xs">{share.grantee_id}</TableCell>
                <TableCell className="max-w-[200px] truncate">{share.reason}</TableCell>
                <TableCell>{renderExpirationBadge(share.valid_until, share.status)}</TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                {hasShareRevoke && (
                  <TableCell>
                    {share.status === 'ACTIVE' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger-600 hover:text-danger-600"
                        onClick={() => setRevokeTarget({ type: 'share', id: share.id })}
                      >
                        Revogar
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }

  function renderDelegationsSection(
    title: string,
    items: AccessDelegationDTO[],
    canRevoke: boolean,
    emptyMessage: string,
  ) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-a1-text-auxiliary">{title}</h3>
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-a1-text-auxiliary">{emptyMessage}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Beneficiário / Delegador</TableHead>
                <TableHead>Escopos</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                {canRevoke && <TableHead className="w-20">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((d) => {
                const status = getStatusBadge(d.status);
                const partnerId =
                  d.delegator_id === currentUserId ? d.delegatee_id : d.delegator_id;
                return (
                  <TableRow key={d.id} className={d.status !== 'ACTIVE' ? 'opacity-60' : ''}>
                    <TableCell className="font-mono text-xs">{partnerId}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {d.delegated_scopes.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{renderExpirationBadge(d.valid_until, d.status)}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    {canRevoke && (
                      <TableCell>
                        {d.status === 'ACTIVE' && d.delegator_id === currentUserId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger-600 hover:text-danger-600"
                            onClick={() => setRevokeTarget({ type: 'delegation', id: d.id })}
                          >
                            Revogar
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    );
  }

  function renderLoadingSkeleton() {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full bg-a1-border" />
        ))}
      </div>
    );
  }

  function renderError(retryFn: () => void) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-sm text-danger-600">{COPY.error.loadFailed}</p>
        <Button variant="outline" onClick={retryFn}>
          {COPY.label.retry}
        </Button>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Compartilhamentos e Delegações" />

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border border-border p-1" role="tablist">
        {tabs
          .filter((t) => t.visible)
          .map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-a1-text-auxiliary hover:bg-a1-bg'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
      </div>

      {/* ─── Shares Tab ──────────────────────────────────────── */}
      {activeTab === 'shares' && hasShareRead && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={shareFilters.status === 'ACTIVE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterStatus('ACTIVE')}
              >
                Ativos
              </Button>
              <Button
                variant={!shareFilters.status ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterStatus(undefined)}
              >
                Todos
              </Button>
            </div>
            {hasShareWrite && (
              <Button onClick={() => setShareDrawerOpen(true)}>{COPY.label.newShare}</Button>
            )}
          </div>

          {shares.isLoading && renderLoadingSkeleton()}
          {shares.isError && renderError(() => shares.refetch())}
          {shares.data && renderSharesTable(shares.data.data)}

          {shares.data?.has_more && (
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={handleLoadMore}>
                Carregar mais
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ─── Delegations Tab ─────────────────────────────────── */}
      {activeTab === 'delegations' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-end">
            <Button onClick={() => setDelegationDrawerOpen(true)}>
              {COPY.label.newDelegation}
            </Button>
          </div>

          {delegations.isLoading && renderLoadingSkeleton()}
          {delegations.isError && renderError(() => delegations.refetch())}
          {delegations.data && (
            <>
              {renderDelegationsSection(
                'Delegações Dadas',
                delegations.data.given,
                true,
                COPY.label.emptyDelegations,
              )}
              {renderDelegationsSection(
                'Delegações Recebidas',
                delegations.data.received,
                false,
                COPY.label.emptyDelegations,
              )}
              {delegations.data.received.length > 0 && (
                <div
                  className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
                  role="alert"
                >
                  {COPY.info.noRedelegation}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ─── Received Tab ────────────────────────────────────── */}
      {activeTab === 'received' && (
        <div className="flex flex-col gap-6">
          <div
            className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
            role="alert"
          >
            {COPY.info.temporaryAccess}
          </div>

          {/* Received shares */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-a1-text-auxiliary">Acessos Compartilhados</h3>
            {myShared.isLoading && renderLoadingSkeleton()}
            {myShared.isError && renderError(() => myShared.refetch())}
            {myShared.data && myShared.data.length === 0 && (
              <p className="py-4 text-center text-sm text-a1-text-auxiliary">
                {COPY.label.emptyReceived}
              </p>
            )}
            {myShared.data && myShared.data.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Ações Permitidas</TableHead>
                    <TableHead>Concedente</TableHead>
                    <TableHead>Validade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myShared.data.map((share) => (
                    <TableRow
                      key={share.id}
                      className={share.status !== 'ACTIVE' ? 'opacity-60' : ''}
                    >
                      <TableCell>
                        <span className="font-medium">{share.resource_type}</span>
                        <span className="ml-1 text-a1-text-auxiliary">/ {share.resource_id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {share.allowed_actions.map((a) => (
                            <Badge key={a} variant="outline" className="text-xs">
                              {a}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{share.grantor_id}</TableCell>
                      <TableCell>
                        {renderExpirationBadge(share.valid_until, share.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Received delegations */}
          {delegations.isLoading && renderLoadingSkeleton()}
          {delegations.data && delegations.data.received.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-a1-text-auxiliary">Delegações Recebidas</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delegador</TableHead>
                    <TableHead>Escopos</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {delegations.data.received.map((d) => {
                    const status = getStatusBadge(d.status);
                    return (
                      <TableRow key={d.id} className={d.status !== 'ACTIVE' ? 'opacity-60' : ''}>
                        <TableCell className="font-mono text-xs">{d.delegator_id}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {d.delegated_scopes.map((s) => (
                              <Badge key={s} variant="outline" className="text-xs">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{renderExpirationBadge(d.valid_until, d.status)}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div
                className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
                role="alert"
              >
                {COPY.info.noRedelegation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Drawers ─────────────────────────────────────────── */}
      <ShareDrawer
        open={shareDrawerOpen}
        onOpenChange={setShareDrawerOpen}
        userScopes={userScopes}
        currentUserId={currentUserId}
        onSuccess={() => toast.success(COPY.toast.shareCreated)}
      />

      <DelegationDrawer
        open={delegationDrawerOpen}
        onOpenChange={setDelegationDrawerOpen}
        availableScopes={availableScopes}
        onSuccess={() => toast.success(COPY.toast.delegationCreated)}
      />

      {/* ─── Revoke Confirmation Dialog ──────────────────────── */}
      <ConfirmationModal
        open={!!revokeTarget}
        onOpenChange={(o) => !o && setRevokeTarget(null)}
        title={
          revokeTarget?.type === 'share'
            ? COPY.modal.revokeShareTitle
            : COPY.modal.revokeDelegationTitle
        }
        description={
          revokeTarget?.type === 'share'
            ? COPY.modal.revokeShareBody
            : COPY.modal.revokeDelegationBody
        }
        variant="destructive"
        confirmLabel={
          revokeTarget?.type === 'share'
            ? COPY.modal.revokeShareConfirm
            : COPY.modal.revokeDelegationConfirm
        }
        cancelLabel={COPY.modal.cancel}
        onConfirm={handleRevoke}
        isLoading={isRevoking}
      />
    </div>
  );
}
