/**
 * @contract UX-009 §30
 *
 * UX-APPROV-003: Movimentos Controlados.
 * Table: listagem paginada com filtros por tipo/status/período, click navega para detalhe.
 * Route: /approvals/movements
 */

import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
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
import { Select } from '@shared/ui/select';
import { StatusBadge, type StatusType } from '@shared/ui/status-badge';
import { Pagination } from '@shared/ui/pagination';
import { EmptyState } from '@shared/ui/empty-state';
import { FileTextIcon } from 'lucide-react';
import { httpClient } from '@modules/foundation/api/http-client.js';

// ── Types ────────────────────────────────────────────────────

type MovementStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'OVERRIDDEN' | 'AUTO_APPROVED';

interface MovementListItem {
  id: string;
  codigo: string;
  tipo: string;
  objeto: string;
  valor: string;
  status: MovementStatus;
  solicitante: string;
  created_at: string;
}

interface MovementsResponse {
  data: MovementListItem[];
  total: number;
  page: number;
  page_size: number;
}

const STATUS_MAP: Record<MovementStatus, { label: string; variant: StatusType }> = {
  PENDING_APPROVAL: { label: 'Pendente', variant: 'warning' },
  APPROVED: { label: 'Aprovado', variant: 'success' },
  REJECTED: { label: 'Rejeitado', variant: 'error' },
  OVERRIDDEN: { label: 'Override', variant: 'purple' },
  AUTO_APPROVED: { label: 'Auto-aprovado', variant: 'info' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'PENDING_APPROVAL', label: 'Pendente' },
  { value: 'APPROVED', label: 'Aprovado' },
  { value: 'REJECTED', label: 'Rejeitado' },
  { value: 'OVERRIDDEN', label: 'Override' },
  { value: 'AUTO_APPROVED', label: 'Auto-aprovado' },
];

const TIPO_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'INCLUSAO', label: 'Inclusão' },
  { value: 'ALTERACAO', label: 'Alteração' },
  { value: 'EXCLUSAO', label: 'Exclusão' },
];

// ── Hook ─────────────────────────────────────────────────────

function useMovements(filters: { status: string; tipo: string; page: number }) {
  const [data, setData] = useState<MovementsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useMemo(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.status) params.set('status', filters.status);
        if (filters.tipo) params.set('tipo', filters.tipo);
        params.set('page', String(filters.page));
        params.set('page_size', '20');
        const qs = params.toString();
        const res = await httpClient.get<MovementsResponse>(
          `/approvals/movements${qs ? `?${qs}` : ''}`,
        );
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setData({ data: [], total: 0, page: 1, page_size: 20 });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [filters.status, filters.tipo, filters.page]);

  void fetchData;

  return { data, isLoading };
}

// ── Component ────────────────────────────────────────────────

export function MovementsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMovements({ status: statusFilter, tipo: tipoFilter, page });
  const items = data?.data ?? [];
  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

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
        title="Movimentos Controlados"
        description="Acompanhe os movimentos submetidos ao motor de aprovação."
        breadcrumbs={[{ label: 'Aprovação', href: '/approvals/inbox' }, { label: 'Movimentos' }]}
      />

      <FilterBar>
        <Select
          options={TIPO_OPTIONS}
          value={tipoFilter}
          onChange={(e) => {
            setTipoFilter(e.target.value);
            setPage(1);
          }}
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
          icon={<FileTextIcon className="size-12" />}
          title="Nenhum movimento encontrado"
          description="Não há movimentos registrados com os filtros selecionados."
          action={
            statusFilter || tipoFilter ? (
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('');
                  setTipoFilter('');
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
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Objeto</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const st = STATUS_MAP[item.status];
                  return (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-a1-bg"
                      onClick={() =>
                        navigate({ to: '/approvals/movements/$id', params: { id: item.id } })
                      }
                    >
                      <TableCell className="font-medium">{item.codigo}</TableCell>
                      <TableCell>{item.tipo}</TableCell>
                      <TableCell>{item.objeto}</TableCell>
                      <TableCell>{item.valor}</TableCell>
                      <TableCell>
                        <StatusBadge status={st.variant}>{st.label}</StatusBadge>
                      </TableCell>
                      <TableCell className="text-a1-text-auxiliary">{item.solicitante}</TableCell>
                      <TableCell className="text-a1-text-auxiliary">
                        {formatDate(item.created_at)}
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
    </div>
  );
}
