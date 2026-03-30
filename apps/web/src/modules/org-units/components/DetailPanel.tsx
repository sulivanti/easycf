/**
 * @contract UX-001-M01 D2, UX-001-M02, FR-006, DATA-001-M01
 * DetailPanel — painel direito do split-panel com header, dados cadastrais,
 * departamentos (PENDENTE-008) e métricas (PENDENTE-009).
 * Suporta inline edit (UX-001-M02): campos viram inputs in-place ao clicar "Editar Dados".
 */

import { useState, useCallback, useEffect, type ChangeEvent } from 'react';
import { BuildingIcon, PlusIcon, PencilIcon, CheckIcon, XIcon } from 'lucide-react';
import { Button } from '@shared/ui/button.js';
import { Badge } from '@shared/ui/badge.js';
import { Tag } from '@shared/ui/tag.js';
import { Skeleton } from '@shared/ui/skeleton.js';
import { toast } from 'sonner';
import { ReadOnlyField } from './ReadOnlyField.js';
import { InlineEditCard } from './InlineEditCard.js';
import { HierarchyCard } from './HierarchyCard.js';
import type { OrgUnitDetailVM, UpdateOrgUnitRequest } from '../types/org-units.types.js';
import { canWriteOrgUnit, COPY } from '../types/org-units.types.js';
import { useUpdateOrgUnit } from '../hooks/use-org-unit-actions.js';
import { ApiError } from '../../foundation/api/http-client.js';

export interface DetailPanelProps {
  detail: OrgUnitDetailVM | null;
  isLoading: boolean;
  userScopes: readonly string[];
  /** @deprecated UX-001-M02: editing is now inline. Kept for tree context menu trigger. */
  requestEdit?: boolean;
  onEditHandled?: () => void;
  onCreateChild: (parentId: string) => void;
}

interface EditFormState {
  nome: string;
  cnpj: string;
  razao_social: string;
  filial: string;
  responsavel: string;
  telefone: string;
  email_contato: string;
}

function detailToForm(detail: OrgUnitDetailVM): EditFormState {
  return {
    nome: detail.nome,
    cnpj: detail.cnpj ?? '',
    razao_social: detail.razao_social ?? '',
    filial: detail.filial ?? '',
    responsavel: detail.responsavel ?? '',
    telefone: detail.telefone ?? '',
    email_contato: detail.email_contato ?? '',
  };
}

export function DetailPanel({
  detail,
  isLoading,
  userScopes,
  requestEdit,
  onEditHandled,
  onCreateChild,
}: DetailPanelProps) {
  const hasWrite = canWriteOrgUnit(userScopes);
  const updateMutation = useUpdateOrgUnit();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditFormState>({
    nome: '',
    cnpj: '',
    razao_social: '',
    filial: '',
    responsavel: '',
    telefone: '',
    email_contato: '',
  });

  // When tree context menu triggers edit, start inline editing
  useEffect(() => {
    if (requestEdit && detail && hasWrite) {
      setForm(detailToForm(detail));
      setIsEditing(true);
      onEditHandled?.();
    }
  }, [requestEdit, detail, hasWrite, onEditHandled]);

  const handleStartEdit = useCallback(() => {
    if (!detail) return;
    setForm(detailToForm(detail));
    setIsEditing(true);
  }, [detail]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleChange = useCallback((field: keyof EditFormState) => {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }, []);

  const handleSave = useCallback(() => {
    if (!detail) return;

    const data: UpdateOrgUnitRequest = {
      nome: form.nome.trim(),
      ...(form.cnpj.trim() && { cnpj: form.cnpj.trim() }),
      ...(form.razao_social.trim() && { razao_social: form.razao_social.trim() }),
      ...(form.filial.trim() && { filial: form.filial.trim() }),
      ...(form.responsavel.trim() && { responsavel: form.responsavel.trim() }),
      ...(form.telefone.trim() && { telefone: form.telefone.trim() }),
      ...(form.email_contato.trim() && { email_contato: form.email_contato.trim() }),
    };

    // Send nulls for cleared optional fields
    if (!form.cnpj.trim() && detail.cnpj) data.cnpj = null;
    if (!form.razao_social.trim() && detail.razao_social) data.razao_social = null;
    if (!form.filial.trim() && detail.filial) data.filial = null;
    if (!form.responsavel.trim() && detail.responsavel) data.responsavel = null;
    if (!form.telefone.trim() && detail.telefone) data.telefone = null;
    if (!form.email_contato.trim() && detail.email_contato) data.email_contato = null;

    updateMutation.mutate(
      { id: detail.id, data },
      {
        onSuccess: () => {
          toast.success(COPY.toast.updateSuccess(detail.codigo, form.nome.trim()));
          setIsEditing(false);
        },
        onError: (error) => {
          const message = error instanceof ApiError
            ? error.message
            : COPY.error.networkError;
          toast.error(message);
        },
      },
    );
  }, [detail, form, updateMutation]);

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

  // Derive parent name from breadcrumb
  const parentName = detail.breadcrumb.length > 0
    ? detail.breadcrumb[detail.breadcrumb.length - 1].nome
    : null;
  const levelLabel = `${detail.levelInfo.shortLabel} — ${detail.levelInfo.label}`;

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
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                  className="gap-1.5"
                >
                  <XIcon className="size-3.5" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateMutation.isPending || !form.nome.trim()}
                  className="gap-1.5"
                >
                  <CheckIcon className="size-3.5" />
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartEdit}
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
              </>
            )}
          </div>
        )}
      </div>

      {/* Dados Cadastrais card — inline edit (UX-001-M02) */}
      <InlineEditCard title="Dados Cadastrais" isEditing={isEditing}>
        {isEditing ? (
          <div className="space-y-4">
            {/* Nome — full width, required */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                Nome da Subdivisão <span className="text-[#E74C3C]">*</span>
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={handleChange('nome')}
                maxLength={200}
                required
                className="h-[42px] w-full rounded-lg border-2 border-[#2E86C1] bg-white px-3.5 py-2.5 text-sm font-medium text-a1-text-primary placeholder:text-[#CCCCCC] focus:outline-none focus:ring-1 focus:ring-[#2E86C1]"
                style={{ fontFamily: 'inherit' }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <EditInput label="CNPJ" value={form.cnpj} onChange={handleChange('cnpj')} maxLength={18} placeholder="00.000.000/0000-00" />
              <EditInput label="Razão Social" value={form.razao_social} onChange={handleChange('razao_social')} maxLength={300} className="col-span-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <EditInput label="Filial" value={form.filial} onChange={handleChange('filial')} maxLength={100} />
              <EditInput label="Responsável" value={form.responsavel} onChange={handleChange('responsavel')} maxLength={200} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <EditInput label="Telefone" value={form.telefone} onChange={handleChange('telefone')} maxLength={20} placeholder="(00) 00000-0000" />
              <EditInput label="E-mail" value={form.email_contato} onChange={handleChange('email_contato')} maxLength={254} placeholder="contato@empresa.com" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <ReadOnlyField label="CNPJ" value={detail.cnpj} />
            <ReadOnlyField label="Razão Social" value={detail.razao_social} />
            <ReadOnlyField label="Filial" value={detail.filial} />
            <ReadOnlyField label="Responsável" value={detail.responsavel} />
            <ReadOnlyField label="Telefone" value={detail.telefone} />
            <ReadOnlyField label="E-mail" value={detail.email_contato} />
          </div>
        )}
      </InlineEditCard>

      {/* Hierarquia card — visible only in edit mode (UX-001-M02) */}
      {isEditing && (
        <HierarchyCard
          parentName={parentName}
          levelLabel={levelLabel}
        />
      )}

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
          {hasWrite && !isEditing && (
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

/* ── Inline edit input field ────────────────────────────────── */

interface EditInputProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  placeholder?: string;
  className?: string;
}

function EditInput({ label, value, onChange, maxLength, placeholder, className }: EditInputProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#888888]">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        className="h-[42px] w-full rounded-lg border-2 border-[#2E86C1] bg-white px-3.5 py-2.5 text-sm font-medium text-a1-text-primary placeholder:text-[#CCCCCC] focus:outline-none focus:ring-1 focus:ring-[#2E86C1]"
        style={{ fontFamily: 'inherit' }}
      />
    </div>
  );
}
