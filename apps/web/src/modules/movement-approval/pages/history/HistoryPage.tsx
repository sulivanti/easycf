/**
 * @contract UX-009 §30, UX-009-M01 D10
 *
 * View ⑧ — Histórico (/approvals/history)
 * Filtros inline + DataTable expansível com justificativa completa no expand.
 */

import React, { useState, useCallback, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRightIcon, ChevronDownIcon, UserIcon, ZapIcon } from 'lucide-react';
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
import { useMovements } from '../../hooks/use-movements.js';
import type { Movement, MovementStatus } from '../../types/movement-approval.types.js';

// ── Action badge map ─────────────────────────────────────────────────────────

const ACTION_MAP: Record<MovementStatus, { label: string; variant: StatusType; auto?: boolean }> = {
  PENDING_APPROVAL: { label: 'Criação', variant: 'info' },
  APPROVED: { label: 'Aprovação', variant: 'success' },
  AUTO_APPROVED: { label: 'Auto', variant: 'info', auto: true },
  REJECTED: { label: 'Rejeição', variant: 'error' },
  CANCELLED: { label: 'Cancelado', variant: 'error' },
  OVERRIDDEN: { label: 'Override', variant: 'purple' },
  EXECUTED: { label: 'Execução', variant: 'success' },
  FAILED: { label: 'Falhou', variant: 'error' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Expanded Row ─────────────────────────────────────────────────────────────

function ExpandedRow({ movement }: { movement: Movement }) {
  return (
    <TableRow className="bg-[#fefce8]">
      <TableCell colSpan={7} className="px-6 py-4">
        <div className="rounded-lg border border-[#fde68a] bg-white p-4">
          <p className="mb-3 text-[12px] font-semibold text-[#92400e]">Detalhes do Registro</p>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Movimento
              </p>
              <Link
                to="/approvals/movements/$id"
                params={{ id: movement.id }}
                className="mt-1 block text-[13px] font-semibold text-[#2E86C1] hover:underline"
              >
                {movement.codigo}
              </Link>
              <p className="text-[11px] text-[#888888]">
                {movement.entity_type} · {movement.operation}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Solicitante
              </p>
              <p className="mt-1 text-[13px] text-[#111111]">{movement.requester_name}</p>
              <p className="text-[11px] text-[#888888]">
                Nível atual: {movement.current_level} / {movement.total_levels}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Regra / SLA
              </p>
              <p className="mt-1 text-[13px] font-semibold text-[#2E86C1]">
                {movement.control_rule_id ?? '—'}
              </p>
              {movement.sla_deadline && (
                <p className="text-[11px] text-[#888888]">
                  SLA: {formatDateTime(movement.sla_deadline)}
                </p>
              )}
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function HistoryPage() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [applied, setApplied] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const params = {
    search: search || undefined,
    status: (actionFilter as MovementStatus) || undefined,
    limit: 30,
  };

  const movementsQuery = useMovements(applied ? params : { limit: 30 });
  const movements = movementsQuery.data?.data ?? [];

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setSearch(value), 400);
  }, []);

  function handleFilter() {
    setApplied(true);
  }

  function handleClear() {
    setSearch('');
    setSearchInput('');
    setActionFilter('');
    setUserFilter('');
    setDateFrom('');
    setDateTo('');
    setApplied(false);
  }

  return (
    <div className="space-y-[var(--space-lg)]">
      <PageHeader
        title="Histórico de Aprovações"
        description="Consulte o log de auditoria de todos os movimentos e ações de aprovação."
        breadcrumbs={[{ label: 'Aprovação' }, { label: 'Histórico' }]}
      />

      {/* Filter Row */}
      <div className="flex items-center gap-2 rounded-lg border border-[#E8E8E6] bg-white px-4 py-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por código, operação ou solicitante..."
            className="h-9 w-full rounded-md border border-[#E8E8E6] bg-[#F5F5F3] px-3 text-[13px] text-[#111111] outline-none placeholder:text-[#CCCCCC] focus:border-[#2E86C1] focus:bg-white"
          />
        </div>

        {/* Ação */}
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-9 w-36 rounded-md border border-[#E8E8E6] bg-white px-2 text-[12px] text-[#111111] outline-none focus:border-[#2E86C1]"
        >
          <option value="">Ação</option>
          <option value="PENDING_APPROVAL">Criação</option>
          <option value="APPROVED">Aprovação</option>
          <option value="REJECTED">Rejeição</option>
          <option value="OVERRIDDEN">Override</option>
          <option value="AUTO_APPROVED">Auto</option>
        </select>

        {/* Usuário */}
        <input
          type="text"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          placeholder="Usuário"
          className="h-9 w-36 rounded-md border border-[#E8E8E6] bg-white px-3 text-[12px] text-[#111111] outline-none placeholder:text-[#CCCCCC] focus:border-[#2E86C1]"
        />

        {/* DateRange */}
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 w-30 rounded-md border border-[#E8E8E6] bg-white px-2 text-[12px] text-[#111111] outline-none focus:border-[#2E86C1]"
          />
          <span className="text-[11px] text-[#888888]">até</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 w-30 rounded-md border border-[#E8E8E6] bg-white px-2 text-[12px] text-[#111111] outline-none focus:border-[#2E86C1]"
          />
        </div>

        <Button
          onClick={handleFilter}
          size="sm"
          className="bg-[#2E86C1] text-white hover:bg-[#2573a7]"
        >
          Filtrar
        </Button>
        {applied && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[12px] text-[#888888] hover:text-[#111111]"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Table */}
      {movementsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-md" />
          ))}
        </div>
      ) : movements.length === 0 ? (
        <div className="rounded-lg border border-[#E8E8E6] bg-white py-16 text-center">
          <p className="text-[13px] text-[#888888]">Nenhum registro encontrado.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-[#E8E8E6] bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F5F5F3]">
                  <TableHead className="w-8" />
                  {['Data/Hora', 'Usuário', 'Movimento', 'Ação', 'Nível', 'Detalhes'].map((h) => (
                    <TableHead
                      key={h}
                      className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#111111]"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => {
                  const isExpanded = expandedIds.has(movement.id);
                  const action = ACTION_MAP[movement.status];
                  return (
                    <React.Fragment key={movement.id}>
                      <TableRow
                        className="h-11 cursor-pointer border-b border-[#E8E8E6] bg-white hover:bg-[#F5F5F3]"
                        onClick={() => toggleExpand(movement.id)}
                      >
                        {/* Expand chevron */}
                        <TableCell className="pl-4 pr-2">
                          {isExpanded ? (
                            <ChevronDownIcon className="size-4 text-[#888888]" />
                          ) : (
                            <ChevronRightIcon className="size-4 text-[#888888]" />
                          )}
                        </TableCell>

                        {/* Data/Hora */}
                        <TableCell className="font-mono text-[11px] tabular-nums text-[#888888]">
                          {formatDateTime(movement.created_at)}
                        </TableCell>

                        {/* Usuário */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className="flex size-6 items-center justify-center rounded-full bg-[#E3F2FD]">
                              <UserIcon className="size-3 text-[#2E86C1]" />
                            </div>
                            <span className="text-[12px] font-medium text-[#111111]">
                              {movement.requester_name}
                            </span>
                          </div>
                        </TableCell>

                        {/* Movimento */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Link
                            to="/approvals/movements/$id"
                            params={{ id: movement.id }}
                            className="text-[12px] font-bold text-[#2E86C1] hover:underline"
                          >
                            {movement.codigo}
                          </Link>
                        </TableCell>

                        {/* Ação */}
                        <TableCell>
                          <StatusBadge status={action.variant}>
                            {action.auto && <ZapIcon className="size-2.5" />}
                            {action.label}
                          </StatusBadge>
                        </TableCell>

                        {/* Nível */}
                        <TableCell className="text-[12px] text-[#888888]">
                          {movement.current_level > 0 ? `Nível ${movement.current_level}` : '—'}
                        </TableCell>

                        {/* Detalhes truncados */}
                        <TableCell>
                          <span className="inline-block max-w-[200px] truncate text-[12px] text-[#888888]">
                            {movement.entity_type} · {movement.operation}
                          </span>
                        </TableCell>
                      </TableRow>

                      {/* Expanded row */}
                      {isExpanded && <ExpandedRow movement={movement} />}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#888888]">
              Exibindo {movements.length} registros
            </span>
            {movementsQuery.data?.has_more && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => movementsQuery.refetch()}
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
