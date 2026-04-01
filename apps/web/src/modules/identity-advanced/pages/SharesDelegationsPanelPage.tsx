/**
 * @contract UX-001.2, UX-001-M01 D5-D8, UX-IDN-002, FR-001.2, FR-001.3, FR-001-M01
 * 3-tab panel: Shares (admin) | Delegations (all) | Received by Me (all).
 * Shares tab visible only with identity:share:read scope.
 * Uses underline TabBar, expanded user names, RevokeModal, and sectioned layout.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { XCircle } from 'lucide-react';
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
  PageHeader,
  StatusBadge,
  EmptyState,
} from '@shared/ui';
import type { StatusType } from '@shared/ui/status-badge';
import {
  useAccessShares,
  useMySharedAccesses,
  useRevokeAccessShare,
} from '../hooks/use-access-shares.js';
import { useDelegations, useRevokeDelegation } from '../hooks/use-delegations.js';
import { ShareDrawer } from '../components/ShareDrawer.js';
import { DelegationDrawer } from '../components/DelegationDrawer.js';
import { RevokeModal } from '../components/RevokeModal.js';
import {
  canReadShares,
  canWriteShares,
  canRevokeShares,
  getStatusBadge,
  getExpirationInfo,
  getInitials,
  COPY,
  type AccessShareDTO,
  type AccessDelegationDTO,
  type AccessShareFilters,
  type GrantStatus,
} from '../types/identity-advanced.types.js';

// ── Inline InfoBanner (allowed_prefixes restriction) ────────

function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg border border-[#B8D9F2] bg-[#E3F2FD] px-4 py-3 text-xs font-medium text-[#2E86C1]"
      role="alert"
    >
      {children}
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────

/** Map legacy Badge variant → StatusBadge status */
const VARIANT_TO_STATUS: Record<string, StatusType> = {
  default: 'success',
  secondary: 'warning',
  destructive: 'error',
  outline: 'neutral',
};

function toStatus(variant: string): StatusType {
  return VARIANT_TO_STATUS[variant] ?? 'neutral';
}

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
    name: string;
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

  // ── Tab definitions ───────────────────────────────────────
  const tabs: { id: TabId; label: string; visible: boolean }[] = [
    { id: 'shares', label: 'Meus Compartilhamentos', visible: hasShareRead },
    { id: 'delegations', label: 'Minhas Delegações', visible: true },
    { id: 'received', label: 'Acessos Recebidos', visible: true },
  ];

  function handleLoadMore() {
    if (shares.data?.next_cursor) {
      setShareFilters((prev) => ({ ...prev, cursor: shares.data!.next_cursor! }));
    }
  }

  function handleFilterStatus(status: GrantStatus | undefined) {
    setShareFilters((prev) => ({ ...prev, status, cursor: undefined }));
  }

  // ── Dynamic header button ─────────────────────────────────
  function renderHeaderAction() {
    if (activeTab === 'shares' && hasShareWrite) {
      return <Button onClick={() => setShareDrawerOpen(true)}>+ Novo Compartilhamento</Button>;
    }
    if (activeTab === 'delegations') {
      return <Button onClick={() => setDelegationDrawerOpen(true)}>+ Nova Delegação</Button>;
    }
    return null;
  }

  // ── Render helpers ──────────────────────────────────────────

  function renderExpirationBadge(validUntil: string | null, status: GrantStatus) {
    const info = getExpirationInfo(validUntil, status);
    if (!info) return null;
    return (
      <StatusBadge status={toStatus(info.variant)} aria-label={info.ariaLabel}>
        {info.label}
      </StatusBadge>
    );
  }

  function renderAvatar(name: string) {
    const initials = getInitials(name);
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8E8E6] text-[11px] font-bold text-[#555555]">
          {initials}
        </div>
        <span className="text-[13px] font-medium text-[#111111]">{name}</span>
      </div>
    );
  }

  function renderSharesTable(data: AccessShareDTO[]) {
    if (data.length === 0) {
      return <EmptyState title={COPY.label.emptyShares} />;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>COMPARTILHADO COM</TableHead>
            <TableHead>ESCOPO / RECURSO</TableHead>
            <TableHead>TIPO</TableHead>
            <TableHead>VALIDADE</TableHead>
            <TableHead>STATUS</TableHead>
            {hasShareRevoke && <TableHead className="w-16">AÇÕES</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((share) => {
            const status = getStatusBadge(share.status);
            return (
              <TableRow key={share.id} className={share.status !== 'ACTIVE' ? 'opacity-60' : ''}>
                <TableCell>{renderAvatar(share.grantee.name)}</TableCell>
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
                <TableCell>{renderExpirationBadge(share.valid_until, share.status)}</TableCell>
                <TableCell>
                  <StatusBadge status={toStatus(status.variant)}>{status.label}</StatusBadge>
                </TableCell>
                {hasShareRevoke && (
                  <TableCell>
                    {share.status === 'ACTIVE' && (
                      <button
                        className="text-[#E74C3C] hover:text-[#C0392B]"
                        title="Revogar compartilhamento"
                        onClick={() =>
                          setRevokeTarget({
                            type: 'share',
                            id: share.id,
                            name: share.grantee.name,
                          })
                        }
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
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
      <PageHeader
        title="Compartilhamentos e Delegações"
        subtitle="Gerencie compartilhamentos de acesso e delegações de escopo"
      >
        {renderHeaderAction()}
      </PageHeader>

      {/* ─── TabBar with underline ────────────────────────────── */}
      <div className="flex gap-0 border-b-2 border-[#E8E8E6]" role="tablist">
        {tabs
          .filter((t) => t.visible)
          .map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={
                activeTab === tab.id
                  ? 'border-b-2 border-[#2E86C1] px-5 py-3 text-[13px] font-bold text-[#2E86C1]'
                  : 'border-b-2 border-transparent px-5 py-3 text-[13px] font-medium text-[#888888] hover:text-[#555555]'
              }
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
      </div>

      {/* ─── Shares Tab ──────────────────────────────────────── */}
      {activeTab === 'shares' && hasShareRead && (
        <div className="flex flex-col gap-4">
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
          {delegations.isLoading && renderLoadingSkeleton()}
          {delegations.isError && renderError(() => delegations.refetch())}
          {delegations.data && (
            <>
              {/* Delegações Dadas */}
              <div className="flex flex-col gap-3">
                <h3 className="mb-3 text-base font-bold text-[#111111]">Delegações Dadas</h3>
                {delegations.data.given.length === 0 ? (
                  <EmptyState title={COPY.label.emptyDelegations} />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>DELEGADO</TableHead>
                        <TableHead>ESCOPOS</TableHead>
                        <TableHead>PERÍODO</TableHead>
                        <TableHead>MOTIVO</TableHead>
                        <TableHead className="w-16">AÇÕES</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {delegations.data.given.map((d) => (
                        <TableRow key={d.id} className={d.status !== 'ACTIVE' ? 'opacity-60' : ''}>
                          <TableCell>{renderAvatar(d.delegatee.name)}</TableCell>
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
                          <TableCell className="max-w-[200px] truncate text-[13px] text-[#555555]">
                            {d.reason}
                          </TableCell>
                          <TableCell>
                            {d.status === 'ACTIVE' && (
                              <button
                                className="text-[#E74C3C] hover:text-[#C0392B]"
                                title="Revogar delegação"
                                onClick={() =>
                                  setRevokeTarget({
                                    type: 'delegation',
                                    id: d.id,
                                    name: d.delegatee.name,
                                  })
                                }
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Delegações Recebidas */}
              <div className="flex flex-col gap-3">
                <h3 className="mb-3 text-base font-bold text-[#111111]">Delegações Recebidas</h3>

                {/* Banner re-delegação ANTES da tabela */}
                {delegations.data.received.length > 0 && (
                  <InfoBanner>{COPY.info.noRedelegation}</InfoBanner>
                )}

                {delegations.data.received.length === 0 ? (
                  <EmptyState title={COPY.label.emptyDelegations} />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>DELEGADOR</TableHead>
                        <TableHead>ESCOPOS</TableHead>
                        <TableHead>PERÍODO</TableHead>
                        <TableHead>MOTIVO</TableHead>
                        <TableHead>STATUS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {delegations.data.received.map((d) => {
                        const status = getStatusBadge(d.status);
                        return (
                          <TableRow
                            key={d.id}
                            className={d.status !== 'ACTIVE' ? 'opacity-60' : ''}
                          >
                            <TableCell>{renderAvatar(d.delegator.name)}</TableCell>
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
                            <TableCell className="max-w-[200px] truncate text-[13px] text-[#555555]">
                              {d.reason}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={toStatus(status.variant)}>
                                {status.label}
                              </StatusBadge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Received Tab ────────────────────────────────────── */}
      {activeTab === 'received' && (
        <div className="flex flex-col gap-6">
          {/* Banner acessos temporários */}
          <InfoBanner>{COPY.info.temporaryAccess}</InfoBanner>

          {/* Compartilhamentos Recebidos */}
          <div className="flex flex-col gap-3">
            <h3 className="mb-3 text-base font-bold text-[#111111]">Compartilhamentos Recebidos</h3>
            {myShared.isLoading && renderLoadingSkeleton()}
            {myShared.isError && renderError(() => myShared.refetch())}
            {myShared.data && myShared.data.length === 0 && (
              <EmptyState title={COPY.label.emptyReceived} />
            )}
            {myShared.data && myShared.data.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CONCEDENTE</TableHead>
                    <TableHead>ESCOPO / RECURSO</TableHead>
                    <TableHead>AÇÕES PERMITIDAS</TableHead>
                    <TableHead>VÁLIDO ATÉ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myShared.data.map((share) => (
                    <TableRow
                      key={share.id}
                      className={share.status !== 'ACTIVE' ? 'opacity-60' : ''}
                    >
                      <TableCell>{renderAvatar(share.grantor.name)}</TableCell>
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
                      <TableCell>
                        {renderExpirationBadge(share.valid_until, share.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Delegações Recebidas */}
          {delegations.isLoading && renderLoadingSkeleton()}
          {delegations.data && delegations.data.received.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="mb-3 text-base font-bold text-[#111111]">Delegações Recebidas</h3>

              {/* Banner re-delegação */}
              <InfoBanner>{COPY.info.noRedelegation}</InfoBanner>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DELEGADOR</TableHead>
                    <TableHead>ESCOPOS</TableHead>
                    <TableHead>PERÍODO</TableHead>
                    <TableHead>STATUS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {delegations.data.received.map((d) => {
                    const status = getStatusBadge(d.status);
                    return (
                      <TableRow key={d.id} className={d.status !== 'ACTIVE' ? 'opacity-60' : ''}>
                        <TableCell>{renderAvatar(d.delegator.name)}</TableCell>
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
                          <StatusBadge status={toStatus(status.variant)}>
                            {status.label}
                          </StatusBadge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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

      {/* ─── Revoke Modal ────────────────────────────────────── */}
      <RevokeModal
        open={!!revokeTarget}
        onOpenChange={(o) => !o && setRevokeTarget(null)}
        variant={revokeTarget?.type === 'share' ? 'share' : 'delegation'}
        targetName={revokeTarget?.name ?? ''}
        onConfirm={handleRevoke}
        isLoading={isRevoking}
      />
    </div>
  );
}
