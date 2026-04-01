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
import { useIntegrationRoutines } from '../hooks/use-routines.js';
import { useServicesList } from '../hooks/use-services.js';
import { canReadLogs, canReprocessDlq } from '../types/permissions.js';
import { COPY, httpStatusClass, relativeTime } from '../types/view-model.js';
import { MonitorHeader } from '../components/MonitorHeader.js';
import { LogDetailPanel } from '../components/LogDetailPanel.js';
import { AutoRefreshIndicator } from '../components/AutoRefreshIndicator.js';
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

const LOG_STATUS_MAP: Record<
  CallLogStatus,
  'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple'
> = {
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
  const [routineFilter, setRoutineFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const filters: CallLogListFilters = useMemo(() => {
    if (activeTab === 'dlq') return { status: 'DLQ' as CallLogStatus };
    const f: CallLogListFilters = {};
    if (statusFilter) f.status = statusFilter;
    if (correlationFilter) f.correlation_id = correlationFilter;
    if (routineFilter) f.routine_id = routineFilter;
    if (serviceFilter) f.service_id = serviceFilter;
    if (periodStart) f.period_start = periodStart;
    if (periodEnd) f.period_end = periodEnd;
    return f;
  }, [
    activeTab,
    statusFilter,
    correlationFilter,
    routineFilter,
    serviceFilter,
    periodStart,
    periodEnd,
  ]);

  const logsQuery = useCallLogsList(filters);
  const detailQuery = useCallLogDetail(selectedLogId);
  const metricsQuery = useCallLogMetrics();
  const reprocessMut = useReprocessCall();
  const routinesQuery = useIntegrationRoutines();
  const servicesQuery = useServicesList();

  const logs = logsQuery.data?.data ?? [];
  const hasMore = logsQuery.data?.has_more ?? false;
  const totalCount = metricsQuery.data?.total ?? 0;
  const routineOptions = routinesQuery.data?.data ?? [];
  const serviceOptions = servicesQuery.data?.data ?? [];
  const hasActiveRealtime = !!(
    metricsQuery.data &&
    (metricsQuery.data.running > 0 || metricsQuery.data.queued > 0)
  );

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
      <div className="flex items-center gap-3">
        <PageHeader
          title="Monitor de Integrações"
          description="Acompanhe logs e métricas de integrações Protheus"
        />
        <AutoRefreshIndicator isActive={hasActiveRealtime} />
      </div>

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
          <select
            value={routineFilter}
            onChange={(e) => setRoutineFilter(e.target.value)}
            className="h-9 w-[200px] rounded-md border border-[#E8E8E6] bg-background px-3 text-xs"
          >
            <option value="">Todas as rotinas</option>
            {routineOptions.map((r) => (
              <option key={r.routine_id} value={r.routine_id}>
                {r.nome}
              </option>
            ))}
          </select>
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CallLogStatus | '')}
          />
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="h-9 w-[180px] rounded-md border border-[#E8E8E6] bg-background px-3 text-xs"
          >
            <option value="">Todos os serviços</option>
            {serviceOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
          <SearchBar
            className="max-w-[240px]"
            value={correlationFilter}
            onChange={setCorrelationFilter}
            placeholder="Correlation ID"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              placeholder="De"
              className="h-9 w-[140px] rounded-md border border-[#E8E8E6] bg-background px-3 text-xs"
            />
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              placeholder="Até"
              className="h-9 w-[140px] rounded-md border border-[#E8E8E6] bg-background px-3 text-xs"
            />
          </div>
          {(statusFilter ||
            correlationFilter ||
            routineFilter ||
            serviceFilter ||
            periodStart ||
            periodEnd) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('');
                setCorrelationFilter('');
                setRoutineFilter('');
                setServiceFilter('');
                setPeriodStart('');
                setPeriodEnd('');
              }}
              className="h-9 rounded-md border border-[#E8E8E6] bg-white px-3 text-xs font-semibold text-[#555]"
            >
              Limpar
            </button>
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
            <EmptyState title={activeTab === 'dlq' ? COPY.empty_dlq : COPY.no_logs} />
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
                            className="bg-[#E74C3C] text-white hover:bg-[#C0392B]"
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
              <div className="flex h-[52px] items-center justify-between border-t border-[#F0F0EE] px-5">
                <span className="text-xs text-[#888888]">
                  Exibindo {logs.length} de {totalCount} chamadas
                </span>
                {hasMore && (
                  <button
                    type="button"
                    onClick={() => {
                      /* loadMore via cursor */
                    }}
                    className="text-[13px] font-semibold text-[#2E86C1] hover:underline"
                  >
                    Carregar mais
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Split-view detail */}
        {selectedLogId && (
          <div className="flex w-[480px] shrink-0 flex-col border-l border-[#E8E8E6] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.08)]">
            {/* Detail Header */}
            <div className="flex h-14 items-center justify-between border-b border-[#E8E8E6] px-5">
              <h3 className="text-base font-bold text-[#111]">Detalhes da Chamada</h3>
              <button
                type="button"
                onClick={() => setSelectedLogId(null)}
                className="flex h-[18px] w-[18px] items-center justify-center text-[#888] hover:text-[#333]"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Detail Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <LogDetailPanel
                log={detailQuery.data}
                isLoading={detailQuery.isLoading}
                onSelectLog={setSelectedLogId}
              />
            </div>

            {/* Detail Footer */}
            {detailQuery.data?.status === 'DLQ' && canReprocessDlq(userScopes) && (
              <div className="flex h-14 items-center justify-end border-t border-[#E8E8E6] px-5">
                <Button
                  className="h-9 rounded-lg bg-[#E74C3C] px-4 text-[13px] font-bold text-white hover:bg-[#C0392B]"
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
