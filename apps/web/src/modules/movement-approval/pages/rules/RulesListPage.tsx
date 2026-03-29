/**
 * @contract UX-009 §30, UX-009-M01 D6
 *
 * View ④ — Regras Lista (/approvals/rules)
 * DataTable com pills de origens, badges de níveis, toggle ativo/inativo.
 */

import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  PlusIcon,
  SearchIcon,
  ZapIcon,
} from 'lucide-react';
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
import { EmptyState } from '@shared/ui/empty-state';
import { useControlRules, useUpdateControlRule } from '../../hooks/use-control-rules.js';
import type { ControlRuleListItem } from '../../types/movement-approval.types.js';

// ── Origin Pill ──────────────────────────────────────────────────────────────

function OriginPill({ origin }: { origin: string }) {
  const isAuto = origin === 'AUTO';
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
        isAuto
          ? 'bg-[#dbeafe] text-[#1d4ed8]'
          : 'bg-[#F5F5F3] text-[#888888]',
      ].join(' ')}
    >
      {isAuto && <ZapIcon className="size-2.5" />}
      {origin}
    </span>
  );
}

// ── Levels Badge ─────────────────────────────────────────────────────────────

function LevelsBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#2E86C1] text-[11px] font-bold text-white">
      {count}
    </span>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function RulesListPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  const rulesQuery = useControlRules(
    activeFilter !== undefined ? { is_active: activeFilter } : undefined,
  );
  const updateMut = useUpdateControlRule();

  const rules = rulesQuery.data?.data ?? [];

  function handleToggleActive(rule: ControlRuleListItem) {
    updateMut.mutate(
      { id: rule.id, data: { is_active: !rule.is_active } },
      {
        onSuccess: () =>
          toast.success(rule.is_active ? 'Regra desativada.' : 'Regra ativada.'),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : 'Erro ao atualizar regra.'),
      },
    );
  }

  function formatValue(value: number | null) {
    if (!value) return '—';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Derive ORIGINS from entity_type for display (rules don't have origin list in schema)
  // Using by_value as a proxy for display purposes
  const ORIGINS_FOR_DISPLAY = ['PROTHEUS', 'PORTAL', 'API'];

  return (
    <div className="space-y-[var(--space-lg)]">
      <PageHeader
        title="Regras de Aprovação"
        description="Configure as regras de controle do motor de aprovação."
        breadcrumbs={[{ label: 'Aprovação' }, { label: 'Regras de Aprovação' }]}
        actions={
          <div className="flex gap-2">
            <Link to="/approvals/rules/search">
              <Button variant="outline" size="sm" className="border-[#E8E8E6]">
                <SearchIcon className="size-4" />
                Busca Avançada
              </Button>
            </Link>
            <Button
              onClick={() => navigate({ to: '/approvals/rules/new' })}
              className="bg-[#2E86C1] text-white hover:bg-[#2573a7]"
            >
              <PlusIcon className="size-4" />
              Nova Regra
            </Button>
          </div>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { label: 'Todas', value: undefined },
          { label: 'Ativas', value: true },
          { label: 'Inativas', value: false },
        ].map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => setActiveFilter(opt.value)}
            className={[
              'rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors',
              activeFilter === opt.value
                ? 'bg-[#2E86C1] text-white'
                : 'border border-[#E8E8E6] text-[#888888] hover:text-[#111111]',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {rulesQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-md" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <EmptyState
          title="Nenhuma regra encontrada"
          description="Crie a primeira regra de aprovação."
          action={
            <Button
              onClick={() => navigate({ to: '/approvals/rules/new' })}
              className="bg-[#2E86C1] text-white"
            >
              Nova Regra
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#E8E8E6] bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F5F3]">
                {['Status', 'Objeto', 'Operação', 'Threshold R$', 'Origens', 'Níveis', 'Ações'].map(
                  (h) => (
                    <TableHead
                      key={h}
                      className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#111111]"
                    >
                      {h}
                    </TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow
                  key={rule.id}
                  className={[
                    'h-11 border-b border-[#E8E8E6] bg-white transition-opacity',
                    !rule.is_active ? 'opacity-60' : '',
                  ].join(' ')}
                >
                  <TableCell>
                    <StatusBadge status={rule.is_active ? 'success' : 'neutral'}>
                      {rule.is_active ? 'Ativa' : 'Inativa'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-[13px] font-medium text-[#111111]">
                    {rule.entity_type}
                  </TableCell>
                  <TableCell className="text-[13px] text-[#111111]">{rule.operation}</TableCell>
                  <TableCell className="font-mono text-right text-[13px] font-bold tabular-nums text-[#111111]">
                    {rule.by_value ? 'Por valor' : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ORIGINS_FOR_DISPLAY.map((o) => (
                        <OriginPill key={o} origin={o} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <LevelsBadge count={rule.approval_rules_count} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate({ to: '/approvals/rules/$id', params: { id: rule.id } })
                        }
                        className="rounded-md border border-[#2E86C1] px-3 py-1 text-[12px] font-medium text-[#2E86C1] hover:bg-[#E3F2FD] transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(rule)}
                        disabled={updateMut.isPending}
                        className={[
                          'rounded-md border px-3 py-1 text-[12px] font-medium transition-colors disabled:opacity-50',
                          rule.is_active
                            ? 'border-[#dc2626] text-[#dc2626] hover:bg-[#fee2e2]'
                            : 'border-[#16a34a] text-[#16a34a] hover:bg-[#d1fae5]',
                        ].join(' ')}
                      >
                        {rule.is_active ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Footer */}
      {rules.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#888888]">
            Exibindo {rules.length} regras
          </span>
        </div>
      )}
    </div>
  );
}
