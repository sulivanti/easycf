/**
 * @contract UX-009 §30, UX-009-M01 D7
 *
 * View ⑤ — Busca Avançada Regras (/approvals/rules/search)
 * 8-field filter panel + resultados com highlight <mark>.
 */

import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { ZapIcon } from 'lucide-react';
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
import { StatusBadge } from '@shared/ui/status-badge';
import { useControlRules } from '../../hooks/use-control-rules.js';
import type { ControlRuleListItem } from '../../types/movement-approval.types.js';

// ── Filter State ─────────────────────────────────────────────────────────────

interface FilterState {
  objectType: string;
  operationType: string;
  status: string;
  origin: string;
  thresholdMin: string;
  thresholdMax: string;
  numLevels: string;
  approverType: string;
}

const emptyFilters: FilterState = {
  objectType: '',
  operationType: '',
  status: '',
  origin: '',
  thresholdMin: '',
  thresholdMax: '',
  numLevels: '',
  approverType: '',
};

// ── Highlight Helper ─────────────────────────────────────────────────────────

function Highlight({ text, term }: { text: string; term: string }) {
  if (!term.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark key={i} className="rounded bg-[#fde68a] px-0.5 text-[#92400e]">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function RulesSearchPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(emptyFilters);
  const [searched, setSearched] = useState(false);

  const rulesQuery = useControlRules(
    searched
      ? {
          is_active:
            appliedFilters.status === 'active'
              ? true
              : appliedFilters.status === 'inactive'
                ? false
                : undefined,
        }
      : undefined,
  );

  const rules = rulesQuery.data?.data ?? [];

  // Client-side filter on returned data
  const filtered = rules.filter((r) => {
    if (
      appliedFilters.objectType &&
      !r.entity_type.toLowerCase().includes(appliedFilters.objectType.toLowerCase())
    )
      return false;
    if (
      appliedFilters.operationType &&
      !r.operation.toLowerCase().includes(appliedFilters.operationType.toLowerCase())
    )
      return false;
    if (appliedFilters.numLevels && r.approval_rules_count < parseInt(appliedFilters.numLevels, 10))
      return false;
    return true;
  });

  function setField(field: keyof FilterState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFilters((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function handleSearch() {
    setAppliedFilters(filters);
    setSearched(true);
  }

  function handleClear() {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setSearched(false);
  }

  const hasApplied = Object.values(appliedFilters).some(Boolean);
  const searchTerm = [appliedFilters.objectType, appliedFilters.operationType]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-[var(--space-lg)]">
      <PageHeader
        title="Busca Avançada de Regras"
        description="Encontre regras de aprovação com filtros detalhados."
        breadcrumbs={[
          { label: 'Aprovação' },
          { label: 'Regras', href: '/approvals/rules' },
          { label: 'Busca Avançada' },
        ]}
        actions={
          <Link to="/approvals/rules">
            <Button variant="outline" size="sm" className="border-[#E8E8E6]">
              Ver Todas as Regras
            </Button>
          </Link>
        }
      />

      {/* Filter Panel */}
      <div className="rounded-[10px] border border-[#E8E8E6] bg-white p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Row 1 */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
              Tipo de Objeto
            </label>
            <select
              value={filters.objectType}
              onChange={setField('objectType')}
              className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
            >
              <option value="">Todos</option>
              <option value="pedido_compra">Pedido de Compra</option>
              <option value="nota_fiscal">Nota Fiscal</option>
              <option value="ordem_servico">Ordem de Serviço</option>
              <option value="contrato">Contrato</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
              Tipo de Operação
            </label>
            <select
              value={filters.operationType}
              onChange={setField('operationType')}
              className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
            >
              <option value="">Todas</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
              Status
            </label>
            <select
              value={filters.status}
              onChange={setField('status')}
              className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
            >
              <option value="">Todos</option>
              <option value="active">Ativa</option>
              <option value="inactive">Inativa</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
              Origem
            </label>
            <select
              value={filters.origin}
              onChange={setField('origin')}
              className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
            >
              <option value="">Todas</option>
              <option value="PROTHEUS">PROTHEUS</option>
              <option value="PORTAL">PORTAL</option>
              <option value="API">API</option>
              <option value="AUTO">AUTO</option>
            </select>
          </div>

          {/* Row 2 */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
              Threshold Mín. R$
            </label>
            <input
              type="number"
              value={filters.thresholdMin}
              onChange={setField('thresholdMin')}
              placeholder="0,00"
              className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 font-mono text-[13px] tabular-nums text-[#111111] outline-none focus:border-[#2E86C1]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
              Threshold Máx. R$
            </label>
            <input
              type="number"
              value={filters.thresholdMax}
              onChange={setField('thresholdMax')}
              placeholder="999.999,00"
              className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 font-mono text-[13px] tabular-nums text-[#111111] outline-none focus:border-[#2E86C1]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
              Nº Níveis (mín)
            </label>
            <input
              type="number"
              min="0"
              value={filters.numLevels}
              onChange={setField('numLevels')}
              placeholder="1"
              className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
              Tipo Aprovador
            </label>
            <select
              value={filters.approverType}
              onChange={setField('approverType')}
              className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
            >
              <option value="">Todos</option>
              <option value="ROLE">ROLE</option>
              <option value="USER">USER</option>
              <option value="ORG_LEVEL">ORG_LEVEL</option>
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex items-center gap-3 border-t border-[#E8E8E6] pt-4">
          <button
            type="button"
            onClick={handleClear}
            className="text-[13px] font-semibold text-[#2E86C1] hover:underline"
          >
            Limpar Filtros
          </button>
          <div className="ml-auto">
            <Button onClick={handleSearch} className="bg-[#2E86C1] text-white hover:bg-[#2573a7]">
              Pesquisar
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <>
          {/* Status bar */}
          <div className="flex items-center gap-3">
            <p className="text-[12px] font-semibold text-[#111111]">
              Resultados: {rulesQuery.isLoading ? '...' : `${filtered.length} regras`}
            </p>
            {hasApplied && (
              <div className="flex flex-wrap gap-1">
                {Object.entries(appliedFilters)
                  .filter(([, v]) => Boolean(v))
                  .map(([k, v]) => (
                    <span
                      key={k}
                      className="rounded-full bg-[#E3F2FD] px-2 py-0.5 text-[10px] font-semibold text-[#2E86C1]"
                    >
                      {v}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {rulesQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-md" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-[#E8E8E6] bg-white py-12 text-center">
              <p className="text-[13px] text-[#888888]">
                Nenhuma regra encontrada com os filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[#E8E8E6] bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F5F3]">
                    {['Status', 'Objeto', 'Operação', 'Níveis', 'Auto-Aprov.', 'Ações'].map((h) => (
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
                  {filtered.map((rule) => (
                    <TableRow
                      key={rule.id}
                      className="h-11 border-b border-[#E8E8E6] bg-[rgba(254,252,232,0.3)]"
                    >
                      <TableCell>
                        <StatusBadge status={rule.is_active ? 'success' : 'neutral'}>
                          {rule.is_active ? 'Ativa' : 'Inativa'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-[13px] font-medium text-[#111111]">
                        <Highlight text={rule.entity_type} term={appliedFilters.objectType} />
                      </TableCell>
                      <TableCell className="text-[13px] text-[#111111]">
                        <Highlight text={rule.operation} term={appliedFilters.operationType} />
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#2E86C1] text-[11px] font-bold text-white">
                          {rule.approval_rules_count}
                        </span>
                      </TableCell>
                      <TableCell className="text-[13px] text-[#888888]">
                        {rule.allow_self_approve ? 'Sim' : 'Não'}
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() =>
                            navigate({ to: '/approvals/rules/$id', params: { id: rule.id } })
                          }
                          className="rounded-md border border-[#2E86C1] px-3 py-1 text-[12px] font-medium text-[#2E86C1] hover:bg-[#E3F2FD] transition-colors"
                        >
                          Editar
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
