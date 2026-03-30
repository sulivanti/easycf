/**
 * @contract UX-002, UX-001-M01 D3, FR-001, FR-006, BR-002, BR-003, BR-010
 * FormPanel inline (480px) — replaces tree panel in split-panel layout.
 * Route does NOT change. State controlled by OrgTreePage.
 *
 * Modes: create (cadastral fields optional) | edit (codigo/parent/nivel readonly + cadastral editable).
 * ReadOnlyField with lock for immutable fields.
 * Tailwind CSS v4 + shared UI.
 */

import { useState, useEffect, useCallback, useMemo, startTransition } from 'react';
import { ArrowLeftIcon, XIcon } from 'lucide-react';
import { Button } from '@shared/ui/button.js';
import { Input } from '@shared/ui/input.js';
import { Spinner } from '@shared/ui/spinner.js';
import { FormField } from '@shared/ui/form-field';
import { Skeleton } from '@shared/ui/skeleton.js';
import { toast } from 'sonner';
import { useOrgUnitDetail } from '../hooks/use-org-unit-detail.js';
import { useOrgUnitsList } from '../hooks/use-org-units-list.js';
import { useCreateOrgUnit } from '../hooks/use-create-org-unit.js';
import { useUpdateOrgUnit } from '../hooks/use-org-unit-actions.js';
import { getLevelInfo, toFormVM, COPY, extractFieldErrors } from '../types/org-units.types.js';
import { ApiError } from '../../foundation/api/http-client.js';
import { ReadOnlyField } from '../components/ReadOnlyField.js';
import type {
  OrgUnitNivel,
  CreateOrgUnitRequest,
  UpdateOrgUnitRequest,
} from '../types/org-units.types.js';

export interface OrgFormPageProps {
  mode: 'create' | 'edit';
  editId?: string;
  parentId?: string;
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

export function OrgFormPage({ mode, editId, parentId, onSuccess, onCancel }: OrgFormPageProps) {
  const { data: detailDTO, isLoading: loadingDetail } = useOrgUnitDetail(
    mode === 'edit' ? (editId ?? null) : null,
  );
  const formVM = useMemo(() => (detailDTO ? toFormVM(detailDTO) : null), [detailDTO]);

  const { data: parentData } = useOrgUnitsList({});
  const parentOptions = useMemo(
    () => (parentData?.data ?? []).filter((p) => p.status === 'ACTIVE' && p.nivel < 4),
    [parentData],
  );

  const createMutation = useCreateOrgUnit();
  const updateMutation = useUpdateOrgUnit();

  // Form state — core
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(parentId ?? null);
  const [isRoot, setIsRoot] = useState(!parentId);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form state — cadastral (FR-006)
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [filial, setFilial] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [telefone, setTelefone] = useState('');
  const [emailContato, setEmailContato] = useState('');

  // Derived level (BR-002)
  const derivedLevel = useMemo((): OrgUnitNivel | null => {
    if (mode === 'edit' && formVM) return formVM.nivel;
    if (isRoot) return 1;
    if (!selectedParentId) return null;
    const parent = parentOptions.find((p) => p.id === selectedParentId);
    if (!parent) return null;
    return (parent.nivel + 1) as OrgUnitNivel;
  }, [mode, formVM, isRoot, selectedParentId, parentOptions]);

  // Parent label for readonly display
  const parentLabel = useMemo(() => {
    if (mode === 'edit' && formVM) {
      const lastAncestor = formVM.breadcrumb[formVM.breadcrumb.length - 1];
      return lastAncestor ? `${lastAncestor.codigo} — ${lastAncestor.nome}` : '(raiz)';
    }
    if (selectedParentId) {
      const parent = parentOptions.find((p) => p.id === selectedParentId);
      return parent ? `${parent.codigo} — ${parent.nome}` : '';
    }
    return null;
  }, [mode, formVM, selectedParentId, parentOptions]);

  // Populate form in edit mode
  useEffect(() => {
    if (mode === 'edit' && formVM) {
      startTransition(() => {
        setCodigo(formVM.codigo);
        setNome(formVM.nome);
        setDescricao(formVM.descricao ?? '');
        setSelectedParentId(formVM.parentId);
        setCnpj(formVM.cnpj ?? '');
        setRazaoSocial(formVM.razao_social ?? '');
        setFilial(formVM.filial ?? '');
        setResponsavel(formVM.responsavel ?? '');
        setTelefone(formVM.telefone ?? '');
        setEmailContato(formVM.email_contato ?? '');
      });
    }
  }, [mode, formVM]);

  // Extract inline errors from API error
  const activeError = createMutation.error ?? updateMutation.error;
  useEffect(() => {
    if (activeError instanceof ApiError) {
      const errors: Record<string, string> = {};

      if (activeError.status === 409) {
        errors.codigo = COPY.validation.codigoDuplicate;
      } else if (activeError.status === 422) {
        const fieldMap = extractFieldErrors(activeError.problem.extensions);
        for (const [field, msg] of fieldMap) {
          errors[field] = msg;
        }
        if (fieldMap.size === 0) {
          errors._form = activeError.message;
        }
      } else {
        errors._form = activeError.message;
      }

      startTransition(() => setFieldErrors(errors));
    } else if (activeError) {
      startTransition(() => setFieldErrors({ _form: COPY.error.networkError }));
    } else {
      startTransition(() => setFieldErrors({}));
    }
  }, [activeError]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFieldErrors({});

      if (mode === 'create') {
        const data: CreateOrgUnitRequest = {
          codigo: codigo.trim().toUpperCase(),
          nome: nome.trim(),
          descricao: descricao.trim() || null,
          parent_id: isRoot ? null : selectedParentId,
          ...(cnpj.trim() && { cnpj: cnpj.trim() }),
          ...(razaoSocial.trim() && { razao_social: razaoSocial.trim() }),
          ...(filial.trim() && { filial: filial.trim() }),
          ...(responsavel.trim() && { responsavel: responsavel.trim() }),
          ...(telefone.trim() && { telefone: telefone.trim() }),
          ...(emailContato.trim() && { email_contato: emailContato.trim() }),
        };
        createMutation.mutate(data, {
          onSuccess: (result) => {
            toast.success(COPY.toast.createSuccess(result.codigo, result.nome));
            onSuccess(result.id);
          },
          onError: (error) => {
            const message = error instanceof ApiError
              ? error.message
              : COPY.error.networkError;
            toast.error(message);
          },
        });
      } else if (mode === 'edit' && editId) {
        const data: UpdateOrgUnitRequest = {
          nome: nome.trim(),
          descricao: descricao.trim() || null,
          cnpj: cnpj.trim() || null,
          razao_social: razaoSocial.trim() || null,
          filial: filial.trim() || null,
          responsavel: responsavel.trim() || null,
          telefone: telefone.trim() || null,
          email_contato: emailContato.trim() || null,
        };
        updateMutation.mutate(
          { id: editId, data },
          {
            onSuccess: (result) => {
              toast.success(COPY.toast.updateSuccess(result.codigo, result.nome));
              onSuccess(editId);
            },
            onError: (error) => {
              const message = error instanceof ApiError
                ? error.message
                : COPY.error.networkError;
              toast.error(message);
            },
          },
        );
      }
    },
    [
      mode,
      editId,
      codigo,
      nome,
      descricao,
      isRoot,
      selectedParentId,
      cnpj,
      razaoSocial,
      filial,
      responsavel,
      telefone,
      emailContato,
      createMutation,
      updateMutation,
      onSuccess,
    ],
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // ── Loading state (edit mode) ─────────────────────────────

  if (mode === 'edit' && loadingDetail) {
    return (
      <div className="flex w-[480px] shrink-0 flex-col border-r border-a1-border bg-white">
        <div className="flex h-16 items-center border-b border-a1-border px-6">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex-1 space-y-4 p-6">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-[42px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ── Form panel ────────────────────────────────────────────

  return (
    <div className="flex w-[480px] shrink-0 flex-col border-r border-a1-border bg-white">
      {/* FormHeader (UX-001-M01 D3) */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-a1-border px-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex size-8 items-center justify-center rounded-md hover:bg-[var(--color-neutral-50)]"
          aria-label="Voltar para árvore"
        >
          <ArrowLeftIcon className="size-5 text-a1-text-secondary" />
        </button>
        <h2 className="flex-1 truncate text-lg font-bold text-a1-text-primary">
          {mode === 'create' ? 'Nova Subdivisão' : 'Editar Unidade'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="flex size-8 items-center justify-center rounded-md hover:bg-[var(--color-neutral-50)]"
          aria-label="Fechar formulário"
        >
          <XIcon className="size-5 text-a1-text-secondary" />
        </button>
      </div>

      {/* FormBody */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 space-y-4 p-6">
          {/* Form-level error */}
          {fieldErrors._form && (
            <div
              role="alert"
              className="rounded-lg border border-danger-200 bg-status-error-bg px-4 py-3 text-sm text-danger-600"
            >
              {fieldErrors._form}
            </div>
          )}

          {/* Info box (create mode) */}
          {mode === 'create' && parentLabel && derivedLevel && (
            <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">
              A nova subdivisão será criada como filha de <strong>{parentLabel}</strong> (
              {getLevelInfo(derivedLevel).shortLabel}).
            </div>
          )}

          {/* Readonly fields (edit) or parent selection (create) */}
          {mode === 'edit' ? (
            <>
              <ReadOnlyField label="Código" value={codigo} showLock />
              <ReadOnlyField
                label="Nível"
                value={
                  derivedLevel
                    ? `${getLevelInfo(derivedLevel).shortLabel} — ${getLevelInfo(derivedLevel).label}`
                    : ''
                }
                showLock
              />
              <ReadOnlyField label="Unidade Pai" value={parentLabel} showLock />
            </>
          ) : (
            <>
              {/* Parent select (create) */}
              {!parentId && (
                <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isRoot}
                    onChange={(e) => {
                      setIsRoot(e.target.checked);
                      if (e.target.checked) setSelectedParentId(null);
                    }}
                    className="accent-primary-600"
                  />
                  Criar como raiz (N1)
                </label>
              )}

              {parentId && <ReadOnlyField label="Unidade Pai" value={parentLabel} showLock />}

              {!isRoot && !parentId && (
                <FormField label="Nó Pai" name="parent" required>
                  <select
                    value={selectedParentId ?? ''}
                    onChange={(e) => setSelectedParentId(e.target.value || null)}
                    required={!isRoot}
                    className="flex h-12 w-full rounded-[10px] border border-a1-border bg-white px-3 text-sm outline-none focus-visible:border-primary-600 focus-visible:ring-[3px] focus-visible:ring-primary-600/20"
                  >
                    <option value="">Selecione o nó pai</option>
                    {parentOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {getLevelInfo(p.nivel).shortLabel} — {p.codigo} — {p.nome}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}

              {derivedLevel && (
                <ReadOnlyField
                  label="Nível"
                  value={`${getLevelInfo(derivedLevel).shortLabel} — ${getLevelInfo(derivedLevel).label}`}
                  showLock
                />
              )}
            </>
          )}

          {/* Nome (editable in both modes) */}
          <FormField label="Nome da Subdivisão" name="nome" required error={fieldErrors.nome}>
            <Input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={200}
              required
              placeholder="Ex: Unidade São Paulo"
              className="h-12 rounded-[10px]"
            />
          </FormField>

          {/* Separator — Dados Cadastrais */}
          <div className="pt-2">
            <div className="border-t border-a1-border" />
            <h3 className="mt-4 text-[10px] font-bold uppercase tracking-widest text-a1-text-hint">
              {mode === 'create' ? 'Dados Cadastrais (opcional)' : 'Dados Cadastrais'}
            </h3>
          </div>

          {/* Cadastral fields */}
          <FormField label="CNPJ" name="cnpj">
            <Input
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              maxLength={18}
              placeholder="00.000.000/0000-00"
              className="h-12 rounded-[10px]"
            />
          </FormField>

          <FormField label="Razão Social" name="razao_social">
            <Input
              type="text"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              maxLength={300}
              className="h-12 rounded-[10px]"
            />
          </FormField>

          {mode === 'edit' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Filial" name="filial">
                  <Input
                    type="text"
                    value={filial}
                    onChange={(e) => setFilial(e.target.value)}
                    maxLength={100}
                    className="h-12 rounded-[10px]"
                  />
                </FormField>
                <FormField label="Responsável" name="responsavel">
                  <Input
                    type="text"
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    maxLength={200}
                    className="h-12 rounded-[10px]"
                  />
                </FormField>
              </div>

              <FormField label="Telefone" name="telefone">
                <Input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  maxLength={20}
                  placeholder="(00) 00000-0000"
                  className="h-12 rounded-[10px]"
                />
              </FormField>

              <FormField label="E-mail" name="email_contato">
                <Input
                  type="email"
                  value={emailContato}
                  onChange={(e) => setEmailContato(e.target.value)}
                  maxLength={254}
                  placeholder="contato@empresa.com"
                  className="h-12 rounded-[10px]"
                />
              </FormField>
            </>
          )}

          {mode === 'create' && (
            <FormField label="Responsável" name="responsavel">
              <Input
                type="text"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                maxLength={200}
                className="h-12 rounded-[10px]"
              />
            </FormField>
          )}

          {/* Codigo field (create only) */}
          {mode === 'create' && (
            <FormField
              label="Código"
              name="codigo"
              required
              error={fieldErrors.codigo}
              hint="O código não pode ser alterado após a criação."
            >
              <Input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                maxLength={50}
                required
                placeholder="Ex: GC-001"
                className="h-12 rounded-[10px]"
              />
            </FormField>
          )}
        </div>

        {/* FormFooter (UX-001-M01 D3) */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-a1-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-11 rounded-lg"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-11 rounded-lg">
            {isSubmitting && <Spinner className="mr-2 size-4" />}
            {mode === 'create' ? 'Criar Subdivisão' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}
