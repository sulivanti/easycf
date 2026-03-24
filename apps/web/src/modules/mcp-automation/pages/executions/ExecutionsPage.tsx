/**
 * @contract UX-MCP-002, FR-009, SEC-010
 *
 * Execution monitor page with:
 * - McpMonitorHeader: 4 metric cards (Total 24h, Success %, Pending #, Blocked #)
 * - McpExecutionsTable: filters + cursor pagination + status badges
 * - ExecutionDetailPanel: split-view with sanitized payload, privilege escalation
 * - Link to linked movement (→ UX-APROV-001) when CONTROLLED_PENDING
 *
 * Tailwind CSS v4 exclusively — zero inline style={{}}.
 * React Query for all data fetching.
 */

import { useState } from 'react';
import {
  Badge,
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui';
import { useExecutionList, useExecutionDetail } from '../../hooks/use-executions.js';
import { ExecutionDetailPanel } from '../../components/ExecutionDetailPanel.js';
import type {
  McpExecution,
  ExecutionStatus,
  ExecutionPolicy,
} from '../../types/mcp-automation.types.js';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  RECEIVED: 'secondary',
  DISPATCHED: 'secondary',
  DIRECT_SUCCESS: 'default',
  DIRECT_FAILED: 'destructive',
  CONTROLLED_PENDING: 'outline',
  CONTROLLED_APPROVED: 'default',
  CONTROLLED_REJECTED: 'destructive',
  EVENT_EMITTED: 'secondary',
  BLOCKED: 'destructive',
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

export function ExecutionsPage() {
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

  // ── Metrics (computed from loaded data — 24h window) ────────────────────
  // Use set-state-during-render pattern to avoid calling Date.now() in useMemo
  // and to avoid setState inside useEffect (both flagged by strict React lint rules).
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
      // Date.now() is acceptable here because this block only runs when data changes
      // (not on every render), and it's inside a conditional setState-during-render.
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

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="space-y-4">
        <h1 className="text-2xl font-bold">Monitor de Execucoes MCP</h1>

        {isLoading ? (
          <div
            className="grid grid-cols-2 gap-4 lg:grid-cols-4"
            role="region"
            aria-label="Metricas de execucoes 24h"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : metrics ? (
          <div
            className="grid grid-cols-2 gap-4 lg:grid-cols-4"
            role="region"
            aria-label="Metricas de execucoes 24h"
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
            />
          </div>
        ) : null}
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Agent ID"
          value={filters.agent_id ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, agent_id: e.target.value || undefined }))}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Action ID"
          value={filters.action_id ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, action_id: e.target.value || undefined }))}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
        <select
          value={filters.status ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: (e.target.value || undefined) as ExecutionStatus | undefined,
            }))
          }
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="RECEIVED">RECEIVED</option>
          <option value="DISPATCHED">DISPATCHED</option>
          <option value="DIRECT_SUCCESS">DIRECT_SUCCESS</option>
          <option value="DIRECT_FAILED">DIRECT_FAILED</option>
          <option value="CONTROLLED_PENDING">CONTROLLED_PENDING</option>
          <option value="CONTROLLED_APPROVED">CONTROLLED_APPROVED</option>
          <option value="CONTROLLED_REJECTED">CONTROLLED_REJECTED</option>
          <option value="EVENT_EMITTED">EVENT_EMITTED</option>
          <option value="BLOCKED">BLOCKED</option>
        </select>
        <select
          value={filters.policy_applied ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              policy_applied: (e.target.value || undefined) as ExecutionPolicy | undefined,
            }))
          }
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">Todas as politicas</option>
          <option value="DIRECT">DIRECT</option>
          <option value="CONTROLLED">CONTROLLED</option>
          <option value="EVENT_ONLY">EVENT_ONLY</option>
        </select>
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
          title="Ate"
          value={filters.received_at_to ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              received_at_to: e.target.value ? new Date(e.target.value).toISOString() : undefined,
            }))
          }
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
        <Button variant="outline" size="sm" onClick={() => setFilters({})}>
          Limpar filtros
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      {/* Split View: table + detail */}
      <div className="flex flex-col gap-0 lg:flex-row">
        <div className={`flex-1 ${selectedId ? 'lg:w-[60%]' : 'w-full'}`}>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agente</TableHead>
                  <TableHead>Acao</TableHead>
                  <TableHead>Politica</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duracao</TableHead>
                  <TableHead>Recebido em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((exec) => (
                  <ExecutionRow
                    key={exec.id}
                    execution={exec}
                    selected={exec.id === selectedId}
                    onSelect={() => setSelectedId(exec.id)}
                  />
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <p>Nenhuma execucao encontrada com estes filtros.</p>
              <Button variant="outline" size="sm" onClick={() => setFilters({})}>
                Limpar filtros
              </Button>
            </div>
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

// ── Execution Row ───────────────────────────────────────────────────────────

function ExecutionRow({
  execution,
  selected,
  onSelect,
}: {
  execution: McpExecution;
  selected: boolean;
  onSelect: () => void;
}) {
  const isBlocked = execution.status === 'BLOCKED';
  const isEscalation = isBlocked && execution.blocked_reason?.includes('privilege_escalation');

  return (
    <TableRow
      className={`cursor-pointer transition-colors ${
        selected ? 'bg-accent' : 'hover:bg-muted/50'
      } ${isEscalation ? 'border-l-4 border-l-destructive' : ''}`}
      onClick={onSelect}
    >
      <TableCell className="font-mono text-xs">{execution.agent_id.slice(0, 8)}...</TableCell>
      <TableCell className="font-mono text-xs">{execution.action_id.slice(0, 8)}...</TableCell>
      <TableCell>{execution.policy_applied}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Badge variant={STATUS_VARIANT[execution.status] ?? 'secondary'}>
            {STATUS_LABEL[execution.status] ?? execution.status}
          </Badge>
          {isEscalation && (
            <Badge variant="destructive" className="text-[10px]">
              Escalada
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        {execution.duration_ms != null ? `${execution.duration_ms}ms` : '\u2014'}
      </TableCell>
      <TableCell>{new Date(execution.received_at).toLocaleString('pt-BR')}</TableCell>
    </TableRow>
  );
}

// ── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant?: 'success' | 'warning' | 'danger';
}) {
  const borderClass =
    variant === 'danger'
      ? 'border-destructive'
      : variant === 'warning'
        ? 'border-yellow-500'
        : variant === 'success'
          ? 'border-green-500'
          : 'border-border';

  return (
    <div className={`flex flex-col gap-1 rounded-lg border-2 p-4 ${borderClass}`}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
