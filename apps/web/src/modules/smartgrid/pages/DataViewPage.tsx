/**
 * @contract UX-SGR-001, UX-SGR-002
 * Page: Visualização de dados SmartGrid — lista paginada com filtros.
 * Route: /dados/$modulo/$rotina
 *
 * Loads column config from MOD-007 motor, fetches records from target endpoint,
 * provides navigation to edit, bulk insert, and bulk delete operations.
 */

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Skeleton } from '@shared/ui/skeleton';
import { EmptyState } from '@shared/ui/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { useOperationConfig } from '../hooks/use-operation-config.js';

interface DataViewPageProps {
  readonly framerId: string;
  readonly objectType: string;
  readonly targetEndpoint: string;
  readonly onNavigateToEdit: (recordId: string) => void;
  readonly onNavigateToBulkInsert: () => void;
  readonly onNavigateToBulkDelete: (
    records: Array<{ id: string; displayLabel: string; currentState: Record<string, unknown> }>,
  ) => void;
}

interface PaginatedData {
  data: Record<string, unknown>[];
  has_more: boolean;
  next_cursor: string | null;
}

const PAGE_SIZE = 25;

export function DataViewPage({
  framerId,
  objectType,
  targetEndpoint,
  onNavigateToEdit,
  onNavigateToBulkInsert,
  onNavigateToBulkDelete,
}: DataViewPageProps) {
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState<string | undefined>();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── Column config from motor ───────────────────────────────────────────
  const {
    columns,
    isLoading: configLoading,
    isError: configError,
  } = useOperationConfig(framerId, objectType);

  // ── Data fetching ──────────────────────────────────────────────────────
  const {
    data: page,
    isLoading: dataLoading,
    isError: dataError,
  } = useQuery({
    queryKey: ['smartgrid', 'data-view', targetEndpoint, cursor, search],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
      if (cursor) params.set('cursor', cursor);
      if (search.trim()) params.set('search', search.trim());
      const url = `${targetEndpoint}?${params.toString()}`;
      const res = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': crypto.randomUUID(),
        },
        signal,
      });
      if (!res.ok) throw new Error('Erro ao carregar dados');
      return (await res.json()) as PaginatedData;
    },
    enabled: !!targetEndpoint,
  });

  const records = page?.data ?? [];
  const visibleColumns = columns.filter((c) => c.visible);

  // ── Selection ──────────────────────────────────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selected.size === records.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(records.map((r) => String(r.id ?? r._id ?? ''))));
    }
  }, [records, selected.size]);

  const handleBulkDelete = useCallback(() => {
    const toDelete = records
      .filter((r) => selected.has(String(r.id ?? r._id ?? '')))
      .map((r) => ({
        id: String(r.id ?? r._id ?? ''),
        displayLabel: String(r.nome ?? r.name ?? r.codigo ?? r.id ?? ''),
        currentState: r,
      }));
    onNavigateToBulkDelete(toDelete);
  }, [records, selected, onNavigateToBulkDelete]);

  // ── Loading ────────────────────────────────────────────────────────────
  if (configLoading || (dataLoading && records.length === 0)) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-64 bg-a1-border" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-a1-border" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (configError || dataError) {
    return (
      <div role="alert" className="p-6">
        <div className="rounded-md border border-a1-border bg-status-error-bg p-3 text-sm text-danger-600">
          <p>
            Não foi possível carregar os dados. Verifique se o motor está configurado corretamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-a1-border bg-white px-6 py-4.5">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-lg font-extrabold tracking-[-0.4px] text-a1-text-primary">
            Dados — {objectType}
          </h1>
          <p className="font-display text-[11px] text-a1-text-hint">
            {records.length} registros carregados
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              Excluir selecionados ({selected.size})
            </Button>
          )}
          <Button size="sm" onClick={onNavigateToBulkInsert}>
            Inclusão em massa
          </Button>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-border bg-white px-6 py-3">
        <Input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCursor(undefined);
          }}
          className="max-w-xs"
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('');
              setCursor(undefined);
            }}
          >
            Limpar
          </Button>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="p-6">
        {records.length === 0 ? (
          <EmptyState
            title="Nenhum registro encontrado"
            description="Use 'Inclusão em massa' para adicionar dados."
            action={
              <Button size="sm" onClick={onNavigateToBulkInsert}>
                Inclusão em massa
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-a1-border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={selected.size === records.length && records.length > 0}
                        onChange={toggleSelectAll}
                        aria-label="Selecionar todos"
                      />
                    </TableHead>
                    {visibleColumns.map((col) => (
                      <TableHead key={col.field}>{col.label}</TableHead>
                    ))}
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => {
                    const recordId = String(record.id ?? record._id ?? '');
                    return (
                      <TableRow
                        key={recordId}
                        data-state={selected.has(recordId) ? 'selected' : undefined}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selected.has(recordId)}
                            onChange={() => toggleSelect(recordId)}
                            aria-label={`Selecionar ${recordId}`}
                          />
                        </TableCell>
                        {visibleColumns.map((col) => (
                          <TableCell key={col.field}>
                            {formatCellValue(record[col.field])}
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => onNavigateToEdit(recordId)}
                          >
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* ── Pagination ──────────────────────────────────────── */}
            {page?.has_more && page.next_cursor && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" onClick={() => setCursor(page.next_cursor!)}>
                  Carregar mais
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (value instanceof Date) return value.toLocaleDateString('pt-BR');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
