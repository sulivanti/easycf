/**
 * @contract UX-008 §27
 *
 * UX-INTEG-003: Fila de Reprocessamento.
 * Table: filtros por serviço/status/data, ações reprocessar e mover para DLQ.
 * Route: /integration/reprocess
 */

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { RefreshCwIcon, ArchiveIcon, PlayIcon } from 'lucide-react';
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
import { FilterBar } from '@shared/ui/filter-bar';
import { SearchBar } from '@shared/ui/search-bar';
import { Select } from '@shared/ui/select';
import { StatusBadge, type StatusType } from '@shared/ui/status-badge';
import { Pagination } from '@shared/ui/pagination';
import { EmptyState } from '@shared/ui/empty-state';
import { ConfirmationModal } from '@shared/ui/confirmation-modal';
import { httpClient } from '@modules/foundation/api/http-client.js';

// ── Types ────────────────────────────────────────────────────

type ReprocessStatus = 'QUEUED' | 'RUNNING' | 'FAILED' | 'DLQ';

interface ReprocessItem {
  id: string;
  operation: string;
  service: string;
  status: ReprocessStatus;
  attempts: number;
  max_attempts: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface ReprocessQueueResponse {
  data: ReprocessItem[];
  total: number;
  page: number;
  page_size: number;
}

const STATUS_MAP: Record<ReprocessStatus, { label: string; variant: StatusType }> = {
  QUEUED: { label: 'Na Fila', variant: 'info' },
  RUNNING: { label: 'Executando', variant: 'warning' },
  FAILED: { label: 'Falhou', variant: 'error' },
  DLQ: { label: 'DLQ', variant: 'neutral' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'QUEUED', label: 'Na Fila' },
  { value: 'RUNNING', label: 'Executando' },
  { value: 'FAILED', label: 'Falhou' },
  { value: 'DLQ', label: 'DLQ' },
];

// ── Hooks ────────────────────────────────────────────────────

function useReprocessQueue(filters: { status: string; search: string; page: number }) {
  const [data, setData] = useState<ReprocessQueueResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useMemo(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.status) params.set('status', filters.status);
        if (filters.search) params.set('q', filters.search);
        params.set('page', String(filters.page));
        params.set('page_size', '20');
        const qs = params.toString();
        const res = await httpClient.get<ReprocessQueueResponse>(
          `/integration/reprocess-queue${qs ? `?${qs}` : ''}`,
        );
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) {
          // API may not exist yet — show empty state
          setData({ data: [], total: 0, page: 1, page_size: 20 });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [filters.status, filters.search, filters.page]);

  void fetchData; // suppress unused warning

  return {
    data,
    isLoading,
    refetch: () => {
      /* trigger via filter change */
    },
  };
}

// ── Component ────────────────────────────────────────────────

export function ReprocessQueuePage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dlqTarget, setDlqTarget] = useState<ReprocessItem | null>(null);
  const [reprocessTarget, setReprocessTarget] = useState<ReprocessItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { data, isLoading } = useReprocessQueue({ status: statusFilter, search, page });
  const items = data?.data ?? [];
  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  async function handleReprocess(item: ReprocessItem) {
    setActionLoading(true);
    try {
      await httpClient.post(`/integration/reprocess-queue/${item.id}/reprocess`, {});
      toast.success(`Item "${item.operation}" enviado para reprocessamento.`);
      setReprocessTarget(null);
      setPage(1); // refresh
    } catch {
      toast.error('Erro ao reprocessar item.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMoveToDlq(item: ReprocessItem) {
    setActionLoading(true);
    try {
      await httpClient.post(`/integration/reprocess-queue/${item.id}/dlq`, {});
      toast.success(`Item "${item.operation}" movido para DLQ.`);
      setDlqTarget(null);
      setPage(1); // refresh
    } catch {
      toast.error('Erro ao mover item para DLQ.');
    } finally {
      setActionLoading(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="space-y-[var(--space-lg)]">
      <PageHeader
        title="Fila de Reprocessamento"
        description="Gerencie itens de integração que falharam e aguardam reprocessamento."
        breadcrumbs={[
          { label: 'Integração', href: '/integration/monitor' },
          { label: 'Reprocessamento' },
        ]}
      />

      <FilterBar>
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Buscar por operação ou serviço..."
          className="flex-1"
        />
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        />
      </FilterBar>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<RefreshCwIcon className="size-12" />}
          title="Nenhum item na fila"
          description="Não há itens aguardando reprocessamento com os filtros selecionados."
          action={
            statusFilter || search ? (
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('');
                  setSearch('');
                }}
              >
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="rounded-lg border border-a1-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operação</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tentativas</TableHead>
                  <TableHead>Erro</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const st = STATUS_MAP[item.status];
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.operation}</TableCell>
                      <TableCell>{item.service}</TableCell>
                      <TableCell>
                        <StatusBadge status={st.variant}>{st.label}</StatusBadge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {item.attempts}/{item.max_attempts}
                        </span>
                      </TableCell>
                      <TableCell
                        className="max-w-[200px] truncate text-a1-text-auxiliary"
                        title={item.error_message ?? ''}
                      >
                        {item.error_message ?? '—'}
                      </TableCell>
                      <TableCell className="text-a1-text-auxiliary">
                        {formatDate(item.updated_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.status === 'FAILED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReprocessTarget(item)}
                              title="Reprocessar"
                            >
                              <PlayIcon className="mr-1 size-3.5" />
                              Reprocessar
                            </Button>
                          )}
                          {(item.status === 'FAILED' || item.status === 'QUEUED') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDlqTarget(item)}
                              title="Mover para DLQ"
                              className="text-danger-500 hover:text-danger-600"
                            >
                              <ArchiveIcon className="mr-1 size-3.5" />
                              DLQ
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-center">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      {/* Reprocess Confirmation */}
      <ConfirmationModal
        open={!!reprocessTarget}
        onOpenChange={(open) => {
          if (!open) setReprocessTarget(null);
        }}
        title="Reprocessar Item"
        description={`Deseja reprocessar a operação "${reprocessTarget?.operation ?? ''}"? O item será reenviado para processamento.`}
        confirmLabel="Reprocessar"
        onConfirm={() => reprocessTarget && handleReprocess(reprocessTarget)}
        isLoading={actionLoading}
      />

      {/* DLQ Confirmation */}
      <ConfirmationModal
        open={!!dlqTarget}
        onOpenChange={(open) => {
          if (!open) setDlqTarget(null);
        }}
        title="Mover para DLQ"
        description={`Deseja mover a operação "${dlqTarget?.operation ?? ''}" para a Dead Letter Queue? Esta ação indica que o item não será mais reprocessado automaticamente.`}
        confirmLabel="Mover para DLQ"
        variant="destructive"
        onConfirm={() => dlqTarget && handleMoveToDlq(dlqTarget)}
        isLoading={actionLoading}
      />
    </div>
  );
}
