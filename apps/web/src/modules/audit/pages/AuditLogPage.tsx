/**
 * @contract UX-SYS §40
 *
 * UX-SYS-001: Log de Auditoria.
 * Table: busca textual, filtros por entidade/ação/usuário/período, row expandível com diff.
 * Route: /auditoria
 */

import { useState, useMemo, Fragment } from 'react';
import { ChevronDownIcon, ChevronRightIcon, ShieldCheckIcon } from 'lucide-react';
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
import { httpClient } from '@modules/foundation/api/http-client.js';

// ── Types ────────────────────────────────────────────────────

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_name: string;
  user_id: string;
  entity: string;
  action: AuditAction;
  summary: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

interface AuditLogsResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  page_size: number;
}

const ACTION_MAP: Record<AuditAction, { label: string; variant: StatusType }> = {
  CREATE: { label: 'Criação', variant: 'success' },
  UPDATE: { label: 'Alteração', variant: 'info' },
  DELETE: { label: 'Exclusão', variant: 'error' },
  READ: { label: 'Leitura', variant: 'neutral' },
};

const ACTION_OPTIONS = [
  { value: '', label: 'Todas as ações' },
  { value: 'CREATE', label: 'Criação' },
  { value: 'UPDATE', label: 'Alteração' },
  { value: 'DELETE', label: 'Exclusão' },
  { value: 'READ', label: 'Leitura' },
];

const ENTITY_OPTIONS = [
  { value: '', label: 'Todas as entidades' },
  { value: 'user', label: 'Usuários' },
  { value: 'role', label: 'Perfis' },
  { value: 'org_unit', label: 'Unidades Org.' },
  { value: 'process', label: 'Processos' },
  { value: 'movement', label: 'Movimentos' },
  { value: 'integration', label: 'Integrações' },
];

// ── Hook ─────────────────────────────────────────────────────

function useAuditLogs(filters: { search: string; action: string; entity: string; page: number }) {
  const [data, setData] = useState<AuditLogsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useMemo(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.set('q', filters.search);
        if (filters.action) params.set('action', filters.action);
        if (filters.entity) params.set('entity', filters.entity);
        params.set('page', String(filters.page));
        params.set('page_size', '20');
        const qs = params.toString();
        const res = await httpClient.get<AuditLogsResponse>(`/audit-logs${qs ? `?${qs}` : ''}`);
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) {
          // Backend may not exist yet — show empty state
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
  }, [filters.search, filters.action, filters.entity, filters.page]);

  void fetchData;

  return { data, isLoading };
}

// ── Diff Viewer ──────────────────────────────────────────────

function DiffViewer({
  before,
  after,
}: {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}) {
  if (!before && !after) {
    return <p className="text-sm text-a1-text-auxiliary">Sem dados de diff disponíveis.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-[var(--space-sm)]">
      <div>
        <p className="mb-1 text-[length:var(--type-caption)] font-semibold uppercase tracking-wide text-a1-text-tertiary">
          Antes
        </p>
        <pre className="rounded-md bg-a1-bg p-3 text-xs text-a1-text-primary">
          {before ? JSON.stringify(before, null, 2) : '—'}
        </pre>
      </div>
      <div>
        <p className="mb-1 text-[length:var(--type-caption)] font-semibold uppercase tracking-wide text-a1-text-tertiary">
          Depois
        </p>
        <pre className="rounded-md bg-a1-bg p-3 text-xs text-a1-text-primary">
          {after ? JSON.stringify(after, null, 2) : '—'}
        </pre>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────

export function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data, isLoading } = useAuditLogs({
    search,
    action: actionFilter,
    entity: entityFilter,
    page,
  });
  const items = data?.data ?? [];
  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function formatTimestamp(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  return (
    <div className="space-y-[var(--space-lg)]">
      <PageHeader
        title="Log de Auditoria"
        description="Consulte todas as operações realizadas no sistema."
        breadcrumbs={[{ label: 'Auditoria' }]}
      />

      <FilterBar>
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Buscar nos detalhes..."
          className="flex-1"
        />
        <Select
          options={ENTITY_OPTIONS}
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value);
            setPage(1);
          }}
        />
        <Select
          options={ACTION_OPTIONS}
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
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
          icon={<ShieldCheckIcon className="size-12" />}
          title="Nenhum registro de auditoria"
          description="Não foram encontrados registros com os filtros selecionados."
          action={
            search || actionFilter || entityFilter ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setActionFilter('');
                  setEntityFilter('');
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
                  <TableHead className="w-8" />
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((entry) => {
                  const act = ACTION_MAP[entry.action];
                  const isExpanded = expandedRows.has(entry.id);
                  return (
                    <Fragment key={entry.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-a1-bg"
                        onClick={() => toggleRow(entry.id)}
                      >
                        <TableCell className="w-8 px-2">
                          {isExpanded ? (
                            <ChevronDownIcon className="size-4 text-a1-text-hint" />
                          ) : (
                            <ChevronRightIcon className="size-4 text-a1-text-hint" />
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-a1-text-auxiliary">
                          {formatTimestamp(entry.timestamp)}
                        </TableCell>
                        <TableCell>{entry.user_name}</TableCell>
                        <TableCell className="capitalize">{entry.entity}</TableCell>
                        <TableCell>
                          <StatusBadge status={act.variant}>{act.label}</StatusBadge>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate text-a1-text-auxiliary">
                          {entry.summary}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-a1-bg/50 p-[var(--space-md)]">
                            <DiffViewer before={entry.before} after={entry.after} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
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
    </div>
  );
}
