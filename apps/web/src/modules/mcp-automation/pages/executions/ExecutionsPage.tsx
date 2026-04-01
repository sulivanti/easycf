/**
 * @contract UX-MCP-002, FR-009, SEC-010, UX-010-M01 (D9-D11)
 *
 * Execution monitor page with:
 * - McpMonitorHeader: 4 metric cards (Total 24h, Success %, Pending #, Blocked #)
 * - McpExecutionsTable: filters + cursor pagination + status badges
 * - ExecutionDetailPanel: split-view with sanitized payload, privilege escalation
 * - Link to linked movement (-> UX-APROV-001) when CONTROLLED_PENDING
 *
 * Tailwind CSS v4 exclusively — zero inline style={{}}.
 * React Query for all data fetching.
 */

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  SearchBar,
} from '@shared/ui';
import { PageHeader } from '@shared/ui/page-header';
import { EmptyState } from '@shared/ui/empty-state';
import { StatusBadge } from '@shared/ui/status-badge';
import { Select } from '@shared/ui/select';
import { FilterBar } from '@shared/ui/filter-bar';
import { useExecutionList, useExecutionDetail } from '../../hooks/use-executions.js';
import { useAgentList } from '../../hooks/use-agents.js';
import { useActionList } from '../../hooks/use-actions.js';
import { ExecutionDetailPanel } from '../../components/ExecutionDetailPanel.js';
import type {
  McpExecution,
  ExecutionStatus,
  ExecutionPolicy,
} from '../../types/mcp-automation.types.js';

const STATUS_BADGE_MAP: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  RECEIVED: 'info',
  DISPATCHED: 'info',
  DIRECT_SUCCESS: 'success',
  DIRECT_FAILED: 'error',
  CONTROLLED_PENDING: 'neutral',
  CONTROLLED_APPROVED: 'success',
  CONTROLLED_REJECTED: 'error',
  EVENT_EMITTED: 'info',
  BLOCKED: 'error',
};

const STATUS_LABEL: Record<string, string> = {
  RECEIVED: 'Recebido',
  DISPATCHED: 'Despachado',
  DIRECT_SUCCESS: 'Sucesso',
  DIRECT_FAILED: 'Falhou',
  CONTROLLED_PENDING: 'Pendente',
  CONTROLLED_APPROVED: 'Aprovado',
  CONTROLLED_REJECTED: 'Rejeitado',
  EVENT_EMITTED: 'Evento',
  BLOCKED: 'Bloqueado',
};

// D11 — Resultado labels derivados do status
const RESULTADO_LABEL: Record<string, string> = {
  DIRECT_SUCCESS: 'OK',
  DIRECT_FAILED: 'Erro',
  CONTROLLED_APPROVED: 'Aprovado',
  CONTROLLED_REJECTED: 'Rejeitado',
  BLOCKED: 'Bloqueado',
  EVENT_EMITTED: 'Emitido',
};

export function ExecutionsPage() {
  // D10 — Single correlation_id search + agent/action selects
  const [correlationSearch, setCorrelationSearch] = useState('');
  const [filters, setFilters] = useState<{
    agent_id?: string;
    action_id?: string;
    status?: ExecutionStatus;
    policy_applied?: ExecutionPolicy;
    received_at_from?: string;
    received_at_to?: string;
  }>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, error } = useExecutionList(filters);
  const { data: detail, isLoading: detailLoading } = useExecutionDetail(selectedId);

  // D10 — Agent/action lists for selects
  const { data: agentsData } = useAgentList({});
  const { data: actionsData } = useActionList({});

  // ── Metrics (computed from loaded data — 24h window) ────────────────────
  const [metrics, setMetrics] = useState<{
    total: number;
    direct_success_pct: number;
    controlled_pending: number;
    blocked: number;
  } | null>(null);
  const [prevData, setPrevData] = useState(data);

  if (data !== prevData) {
    setPrevData(data);
    if (!data) {
      setMetrics(null);
    } else {
      const cutoff = Date.now() - 86_400_000; // eslint-disable-line react-hooks/purity -- only runs on data change
      const h24 = data.data.filter((e) => new Date(e.received_at).getTime() > cutoff);
      const total = h24.length;
      const directSuccess = h24.filter((e) => e.status === 'DIRECT_SUCCESS').length;
      const controlledPending = h24.filter((e) => e.status === 'CONTROLLED_PENDING').length;
      const blocked = h24.filter((e) => e.status === 'BLOCKED').length;
      setMetrics({
        total,
        direct_success_pct: total ? Math.round((directSuccess / total) * 100) : 0,
        controlled_pending: controlledPending,
        blocked,
      });
    }
  }

  // D10 — Client-side correlation ID filter
  const filteredExecutions = data?.data.filter((exec) => {
    if (!correlationSearch) return true;
    return exec.correlation_id.toLowerCase().includes(correlationSearch.toLowerCase());
  });

  // Build agent/action lookup maps for D11
  const agentMap = new Map(agentsData?.data.map((a) => [a.id, a.codigo]) ?? []);
  const actionMap = new Map(actionsData?.data.map((a) => [a.id, a.codigo]) ?? []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="space-y-4">
        <PageHeader
          title="Monitor de Execuções MCP"
          description="Acompanhe execuções de agentes em tempo real"
        />

        {/* D9 — MetricCards */}
        {isLoading ? (
          <div
            className="grid grid-cols-2 gap-4 lg:grid-cols-4"
            role="region"
            aria-label="Métricas de execuções 24h"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl bg-a1-border" />
            ))}
          </div>
        ) : metrics ? (
          <div
            className="grid grid-cols-2 gap-4 lg:grid-cols-4"
            role="region"
            aria-label="Métricas de execuções 24h"
          >
            <MetricCard label="Total (24h)" value={String(metrics.total)} />
            <MetricCard
              label="Taxa de Sucesso"
              value={`${metrics.direct_success_pct}%`}
              variant={
                metrics.direct_success_pct > 95
                  ? 'success'
                  : metrics.direct_success_pct > 80
                    ? 'warning'
                    : 'danger'
              }
              showProgressBar
              progressValue={metrics.direct_success_pct}
            />
            <MetricCard
              label="Pendentes"
              value={String(metrics.controlled_pending)}
              variant={metrics.controlled_pending > 0 ? 'warning' : undefined}
            />
            <MetricCard
              label="Bloqueados"
              value={String(metrics.blocked)}
              variant={metrics.blocked > 0 ? 'danger' : undefined}
              showEscalationBadge={metrics.blocked > 0}
            />
          </div>
        ) : null}
      </header>

      {/* D10 — Monitor FilterBar */}
      <FilterBar>
        <SearchBar
          value={correlationSearch}
          onChange={setCorrelationSearch}
          placeholder="Buscar por Correlation ID..."
          className="w-80"
        />
        <Select
          value={filters.agent_id ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, agent_id: e.target.value || undefined }))}
          placeholder="Todos os agentes"
          options={[
            { value: '', label: 'Todos os agentes' },
            ...(agentsData?.data.map((a) => ({ value: a.id, label: a.codigo })) ?? []),
          ]}
        />
        <Select
          value={filters.action_id ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, action_id: e.target.value || undefined }))}
          placeholder="Todas as ações"
          options={[
            { value: '', label: 'Todas as ações' },
            ...(actionsData?.data.map((a) => ({ value: a.id, label: a.codigo })) ?? []),
          ]}
        />
        <Select
          value={filters.status ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: (e.target.value || undefined) as ExecutionStatus | undefined,
            }))
          }
          placeholder="Todos os status"
          options={[
            { value: '', label: 'Todos os status' },
            { value: 'RECEIVED', label: 'Recebido' },
            { value: 'DISPATCHED', label: 'Despachado' },
            { value: 'DIRECT_SUCCESS', label: 'Sucesso' },
            { value: 'DIRECT_FAILED', label: 'Falhou' },
            { value: 'CONTROLLED_PENDING', label: 'Pendente' },
            { value: 'CONTROLLED_APPROVED', label: 'Aprovado' },
            { value: 'CONTROLLED_REJECTED', label: 'Rejeitado' },
            { value: 'EVENT_EMITTED', label: 'Evento' },
            { value: 'BLOCKED', label: 'Bloqueado' },
          ]}
        />
        <input
          type="datetime-local"
          title="De"
          value={filters.received_at_from ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              received_at_from: e.target.value ? new Date(e.target.value).toISOString() : undefined,
            }))
          }
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
        <input
          type="datetime-local"
          title="Até"
          value={filters.received_at_to ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              received_at_to: e.target.value ? new Date(e.target.value).toISOString() : undefined,
            }))
          }
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFilters({});
            setCorrelationSearch('');
          }}
        >
          Limpar filtros
        </Button>
      </FilterBar>

      {error && <p className="text-sm text-danger-600">{(error as Error).message}</p>}

      {/* Split View: table + detail */}
      <div className="flex flex-col gap-0 lg:flex-row">
        <div className={`flex-1 ${selectedId ? 'lg:w-[60%]' : 'w-full'}`}>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full bg-a1-border" />
              ))}
            </div>
          ) : filteredExecutions && filteredExecutions.length > 0 ? (
            <div className="rounded-lg border border-a1-border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* D11 — Updated column headers */}
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">
                      Agente
                    </TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">
                      Ação
                    </TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">
                      Resultado
                    </TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">
                      Duração
                    </TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">
                      Início
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExecutions.map((exec) => (
                    <ExecutionRow
                      key={exec.id}
                      execution={exec}
                      selected={exec.id === selectedId}
                      onSelect={() => setSelectedId(exec.id)}
                      agentCode={agentMap.get(exec.agent_id)}
                      actionCode={actionMap.get(exec.action_id)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              title="Nenhuma execução encontrada"
              description="Nenhuma execução encontrada com estes filtros."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({});
                    setCorrelationSearch('');
                  }}
                >
                  Limpar filtros
                </Button>
              }
            />
          )}
        </div>

        {selectedId && (
          <ExecutionDetailPanel
            detail={detail ?? null}
            loading={detailLoading}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}

// ── D11 — Execution Row ─────────────────────────────────────────────────────

function ExecutionRow({
  execution,
  selected,
  onSelect,
  agentCode,
  actionCode,
}: {
  execution: McpExecution;
  selected: boolean;
  onSelect: () => void;
  agentCode?: string;
  actionCode?: string;
}) {
  const isBlocked = execution.status === 'BLOCKED';
  const isEscalation = isBlocked && execution.blocked_reason?.includes('privilege_escalation');

  return (
    <TableRow
      className={`cursor-pointer transition-colors ${
        selected ? 'bg-accent' : 'hover:bg-a1-bg'
      } ${isEscalation ? 'border-l-4 border-l-destructive' : ''}`}
      onClick={onSelect}
    >
      {/* D11 — Agent codigo instead of truncated ID */}
      <TableCell className="font-mono text-xs">
        {agentCode ?? execution.agent_id.slice(0, 8) + '...'}
      </TableCell>
      {/* D11 — Action codigo instead of truncated ID */}
      <TableCell className="font-mono text-xs">
        {actionCode ?? execution.action_id.slice(0, 8) + '...'}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <StatusBadge status={STATUS_BADGE_MAP[execution.status] ?? 'info'}>
            {STATUS_LABEL[execution.status] ?? execution.status}
          </StatusBadge>
          {isEscalation && (
            <StatusBadge status="error" className="text-[10px]">
              Escalada
            </StatusBadge>
          )}
        </div>
      </TableCell>
      {/* D11 — RESULTADO column */}
      <TableCell className="text-xs">{RESULTADO_LABEL[execution.status] ?? '\u2014'}</TableCell>
      <TableCell>
        {execution.duration_ms != null ? `${execution.duration_ms}ms` : '\u2014'}
      </TableCell>
      {/* D11 — Renamed from "Recebido em" to "INÍCIO" */}
      <TableCell>{new Date(execution.received_at).toLocaleString('pt-BR')}</TableCell>
    </TableRow>
  );
}

// ── D9 — Metric Card ────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  variant,
  showProgressBar,
  progressValue,
  showEscalationBadge,
}: {
  label: string;
  value: string;
  variant?: 'success' | 'warning' | 'danger';
  showProgressBar?: boolean;
  progressValue?: number;
  showEscalationBadge?: boolean;
}) {
  const borderClass =
    variant === 'danger'
      ? 'border-destructive'
      : variant === 'warning'
        ? 'border-yellow-500'
        : variant === 'success'
          ? 'border-green-500'
          : 'border-a1-border';

  const progressBarColor =
    variant === 'danger'
      ? 'bg-destructive'
      : variant === 'warning'
        ? 'bg-yellow-500'
        : 'bg-green-500';

  return (
    <div className={`flex flex-col gap-2 rounded-xl border p-4 ${borderClass}`}>
      {/* D9 — Label uppercase small */}
      <span className="text-[10px] font-semibold uppercase tracking-wider text-a1-text-auxiliary">
        {label}
      </span>
      <div className="flex items-center justify-between gap-2">
        {/* D9 — Value 28px bold */}
        <span className="text-[28px] font-bold leading-none">{value}</span>
        {/* D9 — Escalation badge on Bloqueados */}
        {showEscalationBadge && (
          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-destructive">
            <AlertTriangle className="size-3" />
            Escalada
          </span>
        )}
      </div>
      {/* D9 — Progress bar on success rate */}
      {showProgressBar && progressValue != null && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all ${progressBarColor}`}
            role="progressbar"
            aria-valuenow={progressValue}
            aria-valuemin={0}
            aria-valuemax={100}
            // Dynamic width requires inline — only exception per Tailwind v4 dynamic values
            // eslint-disable-next-line react/forbid-dom-props
            style={{ width: `${progressValue}%` }}
          />
        </div>
      )}
    </div>
  );
}
