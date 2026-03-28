/**
 * @contract UX-008 §3, FR-011, SEC-008
 *
 * UX-INTEG-002: Monitor de Integrações.
 * Dashboard: metrics header, log table, DLQ tab, split-view detail, reprocess modal.
 * Route: /integracoes/monitor
 */

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Skeleton,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui';
import { PageHeader } from '@shared/ui/page-header';
import { SearchBar } from '@shared/ui/search-bar';
import { FilterBar } from '@shared/ui/filter-bar';
import { Select } from '@shared/ui/select';
import { StatusBadge } from '@shared/ui/status-badge';
import { EmptyState } from '@shared/ui/empty-state';
import { useCallLogsList, useCallLogDetail, useReprocessCall } from '../hooks/use-call-logs.js';
import { useCallLogMetrics } from '../hooks/use-metrics.js';
import { canReadLogs, canReprocessDlq } from '../types/permissions.js';
import { COPY, httpStatusClass, relativeTime } from '../types/view-model.js';
import { MonitorHeader } from '../components/MonitorHeader.js';
import { LogDetailPanel } from '../components/LogDetailPanel.js';
import type { CallLogStatus, CallLogListFilters } from '../types/integration-protheus.types.js';

const ALL_STATUSES: CallLogStatus[] = [
  'QUEUED',
  'RUNNING',
  'SUCCESS',
  'FAILED',
  'DLQ',
  'REPROCESSED',
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  ...ALL_STATUSES.map((s) => ({ value: s, label: s })),
];

const LOG_STATUS_MAP: Record<CallLogStatus, 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple'> = {
  QUEUED: 'info',
  RUNNING: 'warning',
  SUCCESS: 'success',
  FAILED: 'error',
  DLQ: 'error',
  REPROCESSED: 'purple',
};

export interface IntegrationMonitorPageProps {
  userScopes: readonly string[];
}

export function IntegrationMonitorPage({ userScopes }: IntegrationMonitorPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'dlq'>('all');
  const [statusFilter, setStatusFilter] = useState<CallLogStatus | ''>('');
  const [correlationFilter, setCorrelationFilter] = useState('');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [reprocessLogId, setReprocessLogId] = useState<string | null>(null);
  const [reprocessReason, setReprocessReason] = useState('');

  const filters: CallLogListFilters = useMemo(() => {
    if (activeTab === 'dlq') return { status: 'DLQ' as CallLogStatus };
    const f: CallLogListFilters = {};
    if (statusFilter) f.status = statusFilter;
    if (correlationFilter) f.correlation_id = correlationFilter;
    return f;
  }, [activeTab, statusFilter, correlationFilter]);

  const logsQuery = useCallLogsList(filters);
  const detailQuery = useCallLogDetail(selectedLogId);
  const metricsQuery = useCallLogMetrics();
  const reprocessMut = useReprocessCall();

  const logs = logsQuery.data?.data ?? [];
  const hasMore = logsQuery.data?.has_more ?? false;

  function handleReprocess() {
    if (!reprocessLogId || reprocessReason.trim().length < 10) return;
    reprocessMut.mutate(
      { logId: reprocessLogId, data: { reason: reprocessReason.trim() } },
      {
        onSuccess: () => {
          toast.success(COPY.success_reprocess);
          setReprocessLogId(null);
          setReprocessReason('');
        },
      },
    );
  }

  // Permission gate
  if (!canReadLogs(userScopes)) {
    return <p className="mt-20 text-center text-sm text-a1-text-auxiliary">{COPY.no_permission}</p>;
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Monitor de Integrações"
        description="Acompanhe logs e métricas de integrações Protheus"
      />

      {/* Metrics */}
      <MonitorHeader metrics={metricsQuery.data} isLoading={metricsQuery.isLoading} />

      {/* Tabs: All / DLQ */}
      <div className="mb-4 flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`border-b-2 px-5 py-2.5 text-sm transition-colors ${
            activeTab === 'all'
              ? 'border-blue-600 font-semibold text-blue-600'
              : 'border-transparent text-a1-text-auxiliary hover:text-foreground'
          }`}
        >
          Todos os logs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dlq')}
          className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-sm transition-colors ${
            activeTab === 'dlq'
              ? 'border-red-600 font-semibold text-red-600'
              : 'border-transparent text-a1-text-auxiliary hover:text-foreground'
          }`}
        >
          DLQ
          {metricsQuery.data && metricsQuery.data.dlq > 0 && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
              {metricsQuery.data.dlq}
            </span>
          )}
        </button>
      </div>

      {/* Filters (all tab) */}
      {activeTab === 'all' && (
        <FilterBar className="mb-4">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CallLogStatus | '')}
          />
          <SearchBar
            className="max-w-xs"
            value={correlationFilter}
            onChange={setCorrelationFilter}
            placeholder="Correlation ID"
          />
          {(statusFilter || correlationFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('');
                setCorrelationFilter('');
              }}
            >
              Limpar
            </Button>
          )}
        </FilterBar>
      )}

      <div className="flex gap-4">
        {/* Log table */}
        <div className="min-w-0 flex-1">
          {logsQuery.isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded bg-a1-border" />
              ))}
            </div>
          )}

          {!logsQuery.isLoading && logs.length === 0 && (
            <EmptyState
              title={activeTab === 'dlq' ? COPY.empty_dlq : COPY.no_logs}
            />
          )}

          {logs.length > 0 && (
            <div className="rounded-lg border border-a1-border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Rotina</TableHead>
                    <TableHead>Correlation ID</TableHead>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead className="text-right">HTTP</TableHead>
                    <TableHead className="text-right">Duração</TableHead>
                    <TableHead>Enfileirado</TableHead>
                    {activeTab === 'dlq' && <TableHead className="text-right">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className={`cursor-pointer ${selectedLogId === log.id ? 'bg-accent' : ''}`}
                      onClick={() => setSelectedLogId(log.id)}
                    >
                      <TableCell>
                        <StatusBadge status={LOG_STATUS_MAP[log.status]}>{log.status}</StatusBadge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.routine_name ?? '—'}
                        {log.routine_version != null && (
                          <span className="ml-1 text-xs text-a1-text-auxiliary">
                            v{log.routine_version}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.correlation_id.slice(0, 12)}...
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {log.attempt_number}/{log.retry_max}
                      </TableCell>
                      <TableCell
                        className={`text-right text-sm ${httpStatusClass(log.response_status)}`}
                      >
                        {log.response_status ?? '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {log.duration_ms != null ? `${log.duration_ms}ms` : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-a1-text-auxiliary">
                        {relativeTime(log.queued_at)}
                      </TableCell>
                      {activeTab === 'dlq' && canReprocessDlq(userScopes) && (
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-amber-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReprocessLogId(log.id);
                            }}
                          >
                            Reprocessar
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {hasMore && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  /* loadMore via cursor */
                }}
              >
                Carregar mais
              </Button>
            </div>
          )}
        </div>

        {/* Split-view detail */}
        {selectedLogId && (
          <div className="w-96 shrink-0 border-l border-border pl-4">
            <LogDetailPanel
              log={detailQuery.data}
              isLoading={detailQuery.isLoading}
              onSelectLog={setSelectedLogId}
            />

            {/* Reprocess button in detail */}
            {detailQuery.data?.status === 'DLQ' && canReprocessDlq(userScopes) && (
              <div className="mt-4 border-t border-border pt-4">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setReprocessLogId(detailQuery.data!.id)}
                >
                  Reprocessar
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reprocess dialog */}
      <Dialog open={!!reprocessLogId} onOpenChange={() => setReprocessLogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{COPY.confirm_reprocess_title}</DialogTitle>
            <DialogDescription>{COPY.confirm_reprocess_body}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>{COPY.reprocess_reason_label}</Label>
            <textarea
              value={reprocessReason}
              onChange={(e) => setReprocessReason(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            {reprocessReason.trim().length > 0 && reprocessReason.trim().length < 10 && (
              <p className="text-xs text-red-600">{COPY.error_reason_too_short}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReprocessLogId(null);
                setReprocessReason('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReprocess}
              disabled={reprocessMut.isPending || reprocessReason.trim().length < 10}
            >
              {reprocessMut.isPending ? 'Reprocessando...' : 'Confirmar reprocessamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
