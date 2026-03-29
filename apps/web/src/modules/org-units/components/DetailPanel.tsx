/**
 * @contract UX-001-M01 D2, FR-006, DATA-001-M01
 * DetailPanel — painel direito do split-panel com header, dados cadastrais,
 * departamentos (PENDENTE-008) e métricas (PENDENTE-009).
 */

import { BuildingIcon, PlusIcon, PencilIcon } from 'lucide-react';
import { Button } from '@shared/ui/button.js';
import { Badge } from '@shared/ui/badge.js';
import { Tag } from '@shared/ui/tag.js';
import { Skeleton } from '@shared/ui/skeleton.js';
import { ReadOnlyField } from './ReadOnlyField.js';
import type { OrgUnitDetailVM } from '../types/org-units.types.js';
import { canWriteOrgUnit } from '../types/org-units.types.js';

export interface DetailPanelProps {
  detail: OrgUnitDetailVM | null;
  isLoading: boolean;
  userScopes: readonly string[];
  onEdit: (id: string) => void;
  onCreateChild: (parentId: string) => void;
}

export function DetailPanel({
  detail,
  isLoading,
  userScopes,
  onEdit,
  onCreateChild,
}: DetailPanelProps) {
  const hasWrite = canWriteOrgUnit(userScopes);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-5 p-6" aria-busy="true">
        <div className="rounded-xl border border-a1-border bg-white p-5">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="mt-3 h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-24" />
        </div>
        <div className="rounded-xl border border-a1-border bg-white p-6">
          <Skeleton className="h-3 w-32" />
          <div className="mt-4 grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-[42px] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No selection state
  if (!detail) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-a1-text-hint">
          Selecione uma unidade na árvore para ver detalhes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 overflow-y-auto p-6">
      {/* Header card */}
      <div className="rounded-xl border border-a1-border bg-white p-5">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-neutral-50)]">
            <BuildingIcon className="size-5 text-a1-text-auxiliary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-2xl font-extrabold text-a1-text-primary">
                {detail.nome}
              </h2>
              <Badge
                variant={detail.status === 'ACTIVE' ? 'default' : 'outline'}
                className={
                  detail.status === 'ACTIVE'
                    ? 'border-[var(--color-success-300)] bg-[var(--color-success-50)] text-[var(--color-success-700)]'
                    : ''
                }
              >
                {detail.statusBadge.label}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-a1-text-hint">
              Cod: {detail.codigo} · {detail.levelInfo.shortLabel} — {detail.levelInfo.label}
            </p>
          </div>
        </div>
        {hasWrite && (
          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(detail.id)}
              className="gap-1.5"
            >
              <PencilIcon className="size-3.5" />
              Editar Dados
            </Button>
            {detail.nivel < 4 && (
              <Button size="sm" onClick={() => onCreateChild(detail.id)} className="gap-1.5">
                <PlusIcon className="size-3.5" />
                Nova Subdivisão
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Dados Cadastrais card */}
      <div className="rounded-xl border border-a1-border bg-white p-6">
        <h3 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-a1-text-hint">
          Dados Cadastrais
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <ReadOnlyField label="CNPJ" value={detail.cnpj} />
          <ReadOnlyField label="Razão Social" value={detail.razao_social} />
          <ReadOnlyField label="Filial" value={detail.filial} />
          <ReadOnlyField label="Responsável" value={detail.responsavel} />
          <ReadOnlyField label="Telefone" value={detail.telefone} />
          <ReadOnlyField label="E-mail" value={detail.email_contato} />
        </div>
      </div>

      {/* Departamentos placeholder — PENDENTE-008 */}
      <div className="rounded-xl border border-a1-border bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-a1-text-hint">
            Departamentos Vinculados
          </h3>
          <span className="text-xs text-primary-600">Ver todos</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {detail.tenants.map((t) => (
            <Tag key={t.tenantId}>{t.codigo}</Tag>
          ))}
          {hasWrite && (
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-dashed border-a1-border px-4 py-2 text-xs text-a1-text-hint hover:border-a1-text-auxiliary"
              onClick={() => onCreateChild(detail.id)}
            >
              + Novo Departamento
            </button>
          )}
          {detail.tenants.length === 0 && !hasWrite && (
            <p className="text-xs text-a1-text-hint">Nenhum departamento vinculado.</p>
          )}
        </div>
      </div>

      {/* Metric cards placeholder — PENDENTE-009 */}
      <div className="grid grid-cols-2 gap-5">
        <div className="flex h-[140px] flex-col justify-between rounded-2xl bg-primary-600 p-5 text-white">
          <span className="text-xs font-medium opacity-80">Total Colaboradores</span>
          <span className="text-3xl font-extrabold">—</span>
          <span className="text-xs opacity-60">PENDENTE-009</span>
        </div>
        <div className="flex h-[140px] flex-col justify-between rounded-2xl border border-a1-border bg-white p-5">
          <span className="text-xs font-medium text-a1-text-hint">Projetos Ativos</span>
          <span className="text-3xl font-extrabold text-a1-text-primary">—</span>
          <div className="h-1.5 w-full rounded-full bg-[var(--color-neutral-100)]">
            <div className="h-1.5 rounded-full bg-primary-600" style={{ width: '0%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
