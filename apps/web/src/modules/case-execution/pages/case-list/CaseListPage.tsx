/**
 * @contract UX-CASE-002, FR-009, FR-001
 *
 * Case listing page with filters, cursor-based pagination,
 * new case drawer, and pending gates badge.
 *
 * Tailwind CSS v4 + shared UI components + Drawer for new case.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Button,
  Skeleton,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../shared/ui/index.js';
import { PageHeader } from '../../../../shared/ui/page-header.js';
import { SearchBar } from '../../../../shared/ui/search-bar.js';
import { FilterBar } from '../../../../shared/ui/filter-bar.js';
import { Select } from '../../../../shared/ui/select.js';
import { StatusBadge } from '../../../../shared/ui/status-badge.js';
import { EmptyState } from '../../../../shared/ui/empty-state.js';
import { useCaseList, useOpenCase } from '../../hooks/use-cases.js';
import { CaseStatusBadge } from '../../components/CaseStatusBadge.js';
import type {
  CaseStatus,
  CaseListFilters,
  CaseListItem,
} from '../../types/case-execution.types.js';
import { COPY } from '../../types/case-execution.types.js';

interface CaseListPageProps {
  onSelectCase: (caseId: string) => void;
  userScopes?: readonly string[];
}

export function CaseListPage({ onSelectCase, userScopes = [] }: CaseListPageProps) {
  const [filters, setFilters] = useState<CaseListFilters>({});
  const [searchInput, setSearchInput] = useState('');
  const { data, isLoading, error } = useCaseList(filters);
  const canWrite = userScopes.includes('process:case:write');

  const items = data?.data ?? [];
  const hasMore = data?.meta.has_more ?? false;
  const nextCursor = data?.meta.next_cursor ?? undefined;

  // Debounced search (400ms — UX-CASE-002)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput || undefined, cursor: undefined }));
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleLoadMore = useCallback(() => {
    if (nextCursor) {
      setFilters((prev) => ({ ...prev, cursor: nextCursor }));
    }
  }, [nextCursor]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading && items.length === 0) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-4 bg-a1-border" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-a1-border" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6">
        <div
          role="alert"
          className="rounded-md border border-a1-border bg-status-error-bg p-3 text-sm text-danger-600"
        >
          {COPY.error_load_cases} {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="-m-6">
      {/* Page Header — A1 */}
      <PageHeader
        title={`Casos${items.length > 0 ? ` (${items.length})` : ''}`}
        description="Acompanhamento de instâncias de processos em execução"
        actions={canWrite ? <NewCaseDrawer onCreated={onSelectCase} /> : undefined}
      />

      <div className="p-6">
        {/* Filters */}
        <FilterBar className="mb-4">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Buscar por código..."
            className="w-64"
          />
          <Select
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: (e.target.value || undefined) as CaseStatus | undefined,
                cursor: undefined,
              }))
            }
            placeholder="Todos os status"
            options={[
              { value: 'OPEN', label: 'Aberto' },
              { value: 'ON_HOLD', label: 'Suspenso' },
              { value: 'COMPLETED', label: 'Concluído' },
              { value: 'CANCELLED', label: 'Cancelado' },
            ]}
          />
          <label className="flex items-center gap-2 font-display text-[13px] text-a1-text-auxiliary">
            <input
              type="checkbox"
              checked={filters.assigned_to_me ?? false}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  assigned_to_me: e.target.checked || undefined,
                  cursor: undefined,
                }))
              }
              className="accent-primary-600 rounded"
            />
            Minha responsabilidade
          </label>
        </FilterBar>

        {/* Table */}
        {items.length === 0 ? (
          <EmptyState
            title={searchInput ? COPY.empty_search(searchInput) : COPY.empty_cases}
            description={canWrite && !searchInput ? 'Abra o primeiro caso para começar.' : undefined}
          />
        ) : (
          <TooltipProvider>
            <div className="rounded-lg border border-a1-border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Estágio</TableHead>
                    <TableHead>Gates Pendentes</TableHead>
                    <TableHead>Aberto em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((c) => (
                    <CaseRow key={c.id} caseItem={c} onSelect={() => onSelectCase(c.id)} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </TooltipProvider>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="text-center mt-4">
            <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={isLoading}>
              {isLoading ? 'Carregando...' : 'Carregar mais'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Case Row ─────────────────────────────────────────────────────────────────

function CaseRow({ caseItem, onSelect }: { caseItem: CaseListItem; onSelect: () => void }) {
  return (
    <TableRow className="cursor-pointer hover:bg-a1-bg" onClick={onSelect}>
      <TableCell className="font-mono text-sm">{caseItem.codigo}</TableCell>
      <TableCell>
        <CaseStatusBadge status={caseItem.status} />
      </TableCell>
      <TableCell className="text-sm">
        {caseItem.current_stage_name ?? caseItem.current_stage_id}
      </TableCell>
      <TableCell>
        {caseItem.pending_gates_count > 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <StatusBadge status="error" className="cursor-pointer">
                {caseItem.pending_gates_count}
              </StatusBadge>
            </TooltipTrigger>
            <TooltipContent>Clique para ver gates pendentes</TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-a1-text-auxiliary">—</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-a1-text-auxiliary">
        {new Date(caseItem.opened_at).toLocaleDateString('pt-BR')}
      </TableCell>
    </TableRow>
  );
}

// ── New Case Drawer ──────────────────────────────────────────────────────────

function NewCaseDrawer({ onCreated }: { onCreated: (caseId: string) => void }) {
  const openCase = useOpenCase();
  const [open, setOpen] = useState(false);
  const [cycleId, setCycleId] = useState('');
  const [objectType, setObjectType] = useState('');
  const [objectId, setObjectId] = useState('');

  const handleSubmit = async () => {
    const result = await openCase.mutateAsync({
      cycle_id: cycleId,
      object_type: objectType || undefined,
      object_id: objectId || undefined,
    });
    setOpen(false);
    setCycleId('');
    setObjectType('');
    setObjectId('');
    onCreated(result.id);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm">Novo Caso</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Novo Caso</DrawerTitle>
          <DrawerDescription>Abra um novo caso vinculado a um ciclo publicado.</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 px-4 py-2">
          <div>
            <Label htmlFor="nc-cycle">Ciclo (obrigatório)</Label>
            <Input
              id="nc-cycle"
              value={cycleId}
              onChange={(e) => setCycleId(e.target.value)}
              placeholder="ID do ciclo publicado"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="nc-obj-type">Tipo do Objeto</Label>
            <Input
              id="nc-obj-type"
              value={objectType}
              onChange={(e) => setObjectType(e.target.value)}
              placeholder="Ex: contrato, pedido..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="nc-obj-id">ID do Objeto</Label>
            <Input
              id="nc-obj-id"
              value={objectId}
              onChange={(e) => setObjectId(e.target.value)}
              placeholder="UUID do objeto"
              className="mt-1"
            />
          </div>
          {openCase.error && <p className="text-sm text-danger-600">{openCase.error.message}</p>}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
          <Button onClick={handleSubmit} disabled={!cycleId || openCase.isPending}>
            {openCase.isPending ? 'Criando...' : 'Criar Caso'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
