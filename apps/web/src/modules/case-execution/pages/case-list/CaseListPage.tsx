/**
 * @contract UX-CASE-002, UX-006-M01, FR-009, FR-001
 *
 * Case listing page with filters, cursor-based pagination,
 * new case drawer, and pending gates badge.
 *
 * Tailwind CSS v4 + shared UI components + Drawer for new case.
 */

import { useState, useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
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
  Toggle,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../../../../shared/ui/index.js';
import { PageHeader } from '../../../../shared/ui/page-header.js';
import { SearchBar } from '../../../../shared/ui/search-bar.js';
import { FilterBar } from '../../../../shared/ui/filter-bar.js';
import { Select } from '../../../../shared/ui/select.js';
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
        description="Gerencie os casos de execução do seu tenant"
        actions={canWrite ? <NewCaseDrawer onCreated={onSelectCase} /> : undefined}
      />

      <div className="p-6">
        {/* Filters */}
        <FilterBar className="mb-4">
          <Select
            value={filters.cycle_id ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                cycle_id: e.target.value || undefined,
                cursor: undefined,
              }))
            }
            placeholder="Todos os ciclos"
            options={[]}
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
          <Select
            value={filters.stage_id ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                stage_id: e.target.value || undefined,
                cursor: undefined,
              }))
            }
            placeholder="Todos os estágios"
            options={[]}
          />
          <Toggle
            checked={filters.assigned_to_me ?? false}
            onChange={(checked) =>
              setFilters((f) => ({
                ...f,
                assigned_to_me: checked || undefined,
                cursor: undefined,
              }))
            }
            label="Minha responsabilidade"
            size="sm"
          />
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={filters.opened_after ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  opened_after: e.target.value || undefined,
                  cursor: undefined,
                }))
              }
              className="w-36 text-sm"
              placeholder="De"
            />
            <span className="text-a1-text-auxiliary text-xs">até</span>
            <Input
              type="date"
              value={filters.opened_before ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  opened_before: e.target.value || undefined,
                  cursor: undefined,
                }))
              }
              className="w-36 text-sm"
              placeholder="Até"
            />
          </div>
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Buscar por código..."
            className="w-64"
          />
        </FilterBar>

        {/* Table */}
        {items.length === 0 ? (
          <EmptyState
            title={searchInput ? COPY.empty_search(searchInput) : COPY.empty_cases}
            description={
              canWrite && !searchInput ? 'Abra o primeiro caso para começar.' : undefined
            }
          />
        ) : (
          <div className="rounded-lg border border-a1-border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Ciclo</TableHead>
                  <TableHead>Estágio Atual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <CaseRow key={c.id} caseItem={c} onSelect={() => onSelectCase(c.id)} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline disabled:opacity-50 disabled:no-underline font-medium"
            >
              {isLoading ? 'Carregando...' : 'Carregar mais'}
            </button>
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
      <TableCell className="text-sm">
        {caseItem.cycle_name ?? caseItem.cycle_id}
      </TableCell>
      <TableCell className="text-sm">
        {caseItem.current_stage_name ?? caseItem.current_stage_id}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <CaseStatusBadge status={caseItem.status} />
          {caseItem.pending_gates_count > 0 && (
            <span className="inline-flex items-center justify-center size-5 text-[11px] font-bold bg-red-500 text-white rounded-full">
              {caseItem.pending_gates_count}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-sm">
        {caseItem.primary_assignee_name ?? <span className="text-a1-text-auxiliary">—</span>}
      </TableCell>
      <TableCell className="text-sm text-a1-text-auxiliary">
        {new Date(caseItem.opened_at).toLocaleDateString('pt-BR')}
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
          Ver
        </Button>
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
        <Button size="sm">
          <Plus className="size-4 mr-1" />
          Novo Caso
        </Button>
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
