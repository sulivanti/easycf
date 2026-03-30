/**
 * @contract UX-009 §30, UX-009-M01 D3
 *
 * View ① — Movimentos Lista (/approvals/movements)
 * DataTable com 4 tabs, StatusBadges inline, botões Aprovar/Rejeitar, searchbar, paginação.
 */

import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  PlusIcon,
  SearchIcon,
  ChevronDownIcon,
  ZapIcon,
} from 'lucide-react';
import {
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui';
import { PageHeader } from '@shared/ui/page-header';
import { StatusBadge, type StatusType } from '@shared/ui/status-badge';
import { Pagination } from '@shared/ui/pagination';
import { EmptyState } from '@shared/ui/empty-state';
import { useMovements } from '../../hooks/use-movements.js';
import { useApproveMovement, useRejectMovement } from '../../hooks/use-approvals.js';
import type { MovementStatus } from '../../types/movement-approval.types.js';

// ── Tab definitions ──────────────────────────────────────────────────────────

type TabKey = 'pending' | 'approved' | 'rejected' | 'all';

interface TabDef {
  key: TabKey;
  label: string;
  statusFilter?: MovementStatus;
}

const TABS: TabDef[] = [
  { key: 'pending', label: 'Pendentes', statusFilter: 'PENDING_APPROVAL' },
  { key: 'approved', label: 'Aprovados', statusFilter: 'APPROVED' },
  { key: 'rejected', label: 'Rejeitados', statusFilter: 'REJECTED' },
  { key: 'all', label: 'Todos' },
];

// ── Status map ───────────────────────────────────────────────────────────────

const STATUS_MAP: Record<MovementStatus, { label: string; variant: StatusType; auto?: boolean }> = {
  PENDING_APPROVAL: { label: 'Pendente', variant: 'warning' },
  APPROVED: { label: 'Aprovado', variant: 'success' },
  AUTO_APPROVED: { label: 'Auto', variant: 'info', auto: true },
  REJECTED: { label: 'Rejeitado', variant: 'error' },
  CANCELLED: { label: 'Cancelado', variant: 'error' },
  OVERRIDDEN: { label: 'Override', variant: 'purple' },
  EXECUTED: { label: 'Executado', variant: 'success' },
  FAILED: { label: 'Falhou', variant: 'error' },
};

// ── Component ────────────────────────────────────────────────────────────────

export function MovementsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [inlineOpinions, setInlineOpinions] = useState<Record<string, string>>({});
  const [showOpinionFor, setShowOpinionFor] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTabDef = TABS.find((t) => t.key === activeTab)!;

  const params = {
    status: activeTabDef.statusFilter,
    search: search || undefined,
    limit: 30,
  };

  const movementsQuery = useMovements(params);
  const approveMut = useApproveMovement();
  const rejectMut = useRejectMovement();

  const movements = movementsQuery.data?.data ?? [];
  const hasMore = movementsQuery.data?.has_more ?? false;

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        setSearch(value);
        setPage(1);
      }, 400);
    },
    [],
  );

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
    setSearch('');
    setSearchInput('');
    setShowOpinionFor(null);
  };

  function handleApprove(movementId: string) {
    const opinion = inlineOpinions[movementId] ?? '';
    if (opinion.trim().length < 10) {
      toast.error('Parecer deve ter pelo menos 10 caracteres.');
      return;
    }
    approveMut.mutate(
      { movementId, data: { opinion: opinion.trim() } },
      {
        onSuccess: () => {
          toast.success('Movimento aprovado.');
          setShowOpinionFor(null);
          setInlineOpinions((p) => ({ ...p, [movementId]: '' }));
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao aprovar.'),
      },
    );
  }

  function handleReject(movementId: string) {
    const opinion = inlineOpinions[movementId] ?? '';
    if (opinion.trim().length < 10) {
      toast.error('Parecer deve ter pelo menos 10 caracteres.');
      return;
    }
    rejectMut.mutate(
      { movementId, data: { opinion: opinion.trim() } },
      {
        onSuccess: () => {
          toast.success('Movimento rejeitado.');
          setShowOpinionFor(null);
          setInlineOpinions((p) => ({ ...p, [movementId]: '' }));
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao rejeitar.'),
      },
    );
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function formatValue(value: number | null) {
    if (value === null) return '—';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const isProcessed = (status: MovementStatus) =>
    status === 'APPROVED' ||
    status === 'AUTO_APPROVED' ||
    status === 'REJECTED' ||
    status === 'OVERRIDDEN' ||
    status === 'CANCELLED' ||
    status === 'EXECUTED';

  return (
    <div className="space-y-[var(--space-lg)]">
      <PageHeader
        title="Movimentos Controlados"
        description="Gerencie e aprove as solicitações pendentes no sistema."
        breadcrumbs={[{ label: 'Aprovação' }, { label: 'Movimentos Controlados' }]}
        actions={
          <Button
            onClick={() => navigate({ to: '/approvals/movements/new' })}
            className="bg-primary-600 text-white hover:bg-primary-700"
          >
            <PlusIcon className="size-4" />
            Novo Movimento
          </Button>
        }
      />

      {/* Tab Bar */}
      <div className="border-b border-a1-border">
        <nav className="flex gap-0" aria-label="Filtros por status">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={[
                'relative flex items-center gap-2 px-4 py-2.5 font-display text-[13px] transition-colors',
                activeTab === tab.key
                  ? 'border-b-2 border-primary-600 font-semibold text-primary-600'
                  : 'font-medium text-a1-text-auxiliary hover:text-a1-text-primary',
              ].join(' ')}
            >
              {tab.label}
              {tab.key === 'pending' && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                  {movementsQuery.data?.data.length ?? 0}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Search Row */}
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-a1-text-placeholder" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por número ou solicitante..."
            className="h-9 w-full rounded-md border border-a1-border bg-white pl-9 pr-3 text-[13px] text-a1-text-primary outline-none placeholder:text-a1-text-placeholder focus:border-primary-600 focus:ring-[3px] focus:ring-primary-600/20"
          />
        </div>
        <Link
          to="/approvals/rules/search"
          className="text-[12px] font-semibold text-primary-600 hover:underline"
        >
          Busca Avançada
        </Link>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="border-a1-border text-a1-text-primary"
          >
            Ações em Lote
            <ChevronDownIcon className="ml-1 size-4" />
          </Button>
        </div>
      </div>

      {/* Table / States */}
      {movementsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-md" />
          ))}
        </div>
      ) : movements.length === 0 ? (
        <EmptyState
          title="Nenhum movimento encontrado"
          description="Não há movimentos com os filtros selecionados."
          action={
            search ? (
              <Button variant="outline" size="sm" onClick={() => handleSearchChange('')}>
                Limpar busca
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-[#E8E8E6] bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F5F5F3]">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#111111]">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#111111]">
                    Tipo
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#111111]">
                    Número
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#111111]">
                    Solicitante
                  </TableHead>
                  <TableHead className="text-right text-[11px] font-semibold uppercase tracking-[0.8px] text-[#111111]">
                    Valor R$
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#111111]">
                    Data
                  </TableHead>
                  <TableHead className="text-center text-[11px] font-semibold uppercase tracking-[0.8px] text-[#111111]">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((item) => {
                  const st = STATUS_MAP[item.status];
                  const processed = isProcessed(item.status);
                  const isExpanded = showOpinionFor === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <TableRow
                        className={[
                          'h-11 border-b border-[#E8E8E6] bg-white',
                          processed ? 'opacity-70' : '',
                        ].join(' ')}
                      >
                        <TableCell>
                          <StatusBadge status={st.variant}>
                            {st.auto && <ZapIcon className="size-2.5" />}
                            {st.label}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="text-[13px] font-medium text-[#111111]">
                          {item.entity_type}
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() =>
                              navigate({
                                to: '/approvals/movements/$id',
                                params: { id: item.id },
                              })
                            }
                            className="text-[13px] font-bold text-[#2E86C1] hover:underline"
                          >
                            {item.codigo}
                          </button>
                        </TableCell>
                        <TableCell className="text-[13px] text-[#888888]">
                          {item.requester_name}
                        </TableCell>
                        <TableCell className="text-right font-mono text-[13px] font-bold tabular-nums text-[#111111]">
                          {formatValue(item.value)}
                        </TableCell>
                        <TableCell className="text-[11px] text-[#888888]">
                          {formatDate(item.created_at)}
                        </TableCell>
                        <TableCell className="text-center">
                          {processed ? (
                            <span className="text-[11px] italic text-[#888888]">
                              {st.label}
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setShowOpinionFor((prev) =>
                                    prev === item.id ? null : item.id,
                                  )
                                }
                                className="rounded-md border border-[#16a34a] px-3 py-1 text-[12px] font-medium text-[#16a34a] hover:bg-[#d1fae5] transition-colors"
                              >
                                Aprovar
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setShowOpinionFor((prev) =>
                                    prev === `reject-${item.id}`
                                      ? null
                                      : `reject-${item.id}`,
                                  )
                                }
                                className="rounded-md border border-[#dc2626] px-3 py-1 text-[12px] font-medium text-[#dc2626] hover:bg-[#fee2e2] transition-colors"
                              >
                                Rejeitar
                              </button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                      {/* Inline opinion row */}
                      {(isExpanded || showOpinionFor === `reject-${item.id}`) && (
                        <TableRow key={`${item.id}-opinion`} className="bg-[#F5F5F3]">
                          <TableCell colSpan={7} className="px-4 py-3">
                            <div className="flex items-start gap-3">
                              <textarea
                                rows={2}
                                value={inlineOpinions[item.id] ?? ''}
                                onChange={(e) =>
                                  setInlineOpinions((p) => ({
                                    ...p,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                placeholder="Parecer (mínimo 10 caracteres)..."
                                className="flex-1 rounded-md border border-[#E8E8E6] bg-white px-3 py-2 text-[13px] text-[#111111] outline-none placeholder:text-[#CCCCCC] focus:border-[#2E86C1] resize-none"
                              />
                              <div className="flex gap-2 pt-1">
                                {isExpanded ? (
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(item.id)}
                                    disabled={approveMut.isPending}
                                    className="rounded-md bg-[#16a34a] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[#15803d] disabled:opacity-50"
                                  >
                                    Confirmar Aprovação
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleReject(item.id)}
                                    disabled={rejectMut.isPending}
                                    className="rounded-md bg-[#dc2626] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[#b91c1c] disabled:opacity-50"
                                  >
                                    Confirmar Rejeição
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setShowOpinionFor(null)}
                                  className="rounded-md border border-[#E8E8E6] px-3 py-1.5 text-[12px] text-[#888888] hover:text-[#111111]"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#888888]">
              Exibindo {movements.length} movimentos
            </span>
            {hasMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={movementsQuery.isFetching}
                className="border-[#E8E8E6] text-[#888888]"
              >
                {movementsQuery.isFetching ? 'Carregando...' : 'Carregar mais'}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
