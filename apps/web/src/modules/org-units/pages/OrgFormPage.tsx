/**
 * @contract UX-002, FR-001, BR-002, BR-003, BR-010
 * Page: Org Unit Form (UX-ORG-002)
 * Route: /organizacao/novo?parent=:id  |  /organizacao/editar?edit=:id
 *
 * Dual-mode: create (codigo/parent editable) | edit (codigo/parent readonly).
 * Level is derived from parent (BR-002). Never sent in request body.
 * Tailwind CSS v4 + shared UI (Button, Input, Label, Skeleton, Spinner).
 */

import { useState, useEffect, useCallback, useMemo, startTransition } from 'react';
import { Button } from '@shared/ui/button.js';
import { Input } from '@shared/ui/input.js';
import { Label } from '@shared/ui/label.js';
import { Spinner } from '@shared/ui/spinner.js';
import { toast } from 'sonner';
import { useOrgUnitDetail } from '../hooks/use-org-unit-detail.js';
import { useOrgUnitsList } from '../hooks/use-org-units-list.js';
import { useCreateOrgUnit } from '../hooks/use-create-org-unit.js';
import { useUpdateOrgUnit } from '../hooks/use-org-unit-actions.js';
import { getLevelInfo, COPY } from '../types/org-units.types.js';
import { ApiError } from '../../foundation/api/http-client.js';
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
  const { data: formVM, isLoading: loadingDetail } = useOrgUnitDetail(
    mode === 'edit' ? (editId ?? null) : null,
  );

  const { data: parentData } = useOrgUnitsList({});
  const parentOptions = useMemo(
    () => (parentData?.data ?? []).filter((p) => p.status === 'ACTIVE' && p.nivel < 4),
    [parentData],
  );

  const createMutation = useCreateOrgUnit();
  const updateMutation = useUpdateOrgUnit();

  // Form state
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(parentId ?? null);
  const [isRoot, setIsRoot] = useState(!parentId);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Derived level (BR-002)
  const derivedLevel = useMemo((): OrgUnitNivel | null => {
    if (mode === 'edit' && formVM) return formVM.nivel;
    if (isRoot) return 1;
    if (!selectedParentId) return null;
    const parent = parentOptions.find((p) => p.id === selectedParentId);
    if (!parent) return null;
    return (parent.nivel + 1) as OrgUnitNivel;
  }, [mode, formVM, isRoot, selectedParentId, parentOptions]);

  // Populate form in edit mode
  useEffect(() => {
    if (mode === 'edit' && formVM) {
      startTransition(() => {
        setCodigo(formVM.codigo);
        setNome(formVM.nome);
        setDescricao(formVM.descricao ?? '');
        setSelectedParentId(formVM.parentId);
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
        errors._form = activeError.message;
      }
      startTransition(() => setFieldErrors(errors));
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
        };
        createMutation.mutate(data, {
          onSuccess: (result) => {
            toast.success(COPY.toast.createSuccess(result.codigo, result.nome));
            onSuccess(result.id);
          },
          onError: () => {
            /* fieldErrors handled via useEffect */
          },
        });
      } else if (mode === 'edit' && editId) {
        const data: UpdateOrgUnitRequest = {
          nome: nome.trim(),
          descricao: descricao.trim() || null,
        };
        updateMutation.mutate(
          { id: editId, data },
          {
            onSuccess: (result) => {
              toast.success(COPY.toast.updateSuccess(result.codigo, result.nome));
              onSuccess(editId);
            },
            onError: () => {
              /* fieldErrors handled via useEffect */
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
      createMutation,
      updateMutation,
      onSuccess,
    ],
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (mode === 'edit' && loadingDetail) {
    return (
      <div className="p-6 flex items-center gap-2">
        <Spinner className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-semibold mb-2">
        {mode === 'create' ? 'Criar Unidade Organizacional' : `Editar — ${formVM?.codigo ?? ''}`}
      </h1>

      {/* Level indicator */}
      {derivedLevel && (
        <p className="text-sm text-muted-foreground mb-4">
          {getLevelInfo(derivedLevel).shortLabel} — {getLevelInfo(derivedLevel).label}
        </p>
      )}

      {/* Breadcrumb (edit mode) */}
      {mode === 'edit' && formVM && formVM.breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-4">
          {formVM.breadcrumb.map((a, i) => (
            <span key={a.id}>
              {i > 0 && ' → '}
              {a.codigo}
            </span>
          ))}
          <span> → {formVM.codigo}</span>
        </nav>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form-level error */}
        {fieldErrors._form && (
          <div role="alert" className="text-sm text-destructive">
            {fieldErrors._form}
          </div>
        )}

        {/* Codigo */}
        <div className="space-y-1.5">
          <Label htmlFor="codigo">Código *</Label>
          {mode === 'create' ? (
            <>
              <Input
                id="codigo"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                maxLength={50}
                required
                aria-invalid={!!fieldErrors.codigo}
                aria-errormessage={fieldErrors.codigo ? 'codigo-error' : undefined}
                aria-describedby="codigo-hint"
              />
              <p id="codigo-hint" className="text-xs text-muted-foreground">
                O código não pode ser alterado após a criação.
              </p>
            </>
          ) : (
            <Input
              id="codigo"
              type="text"
              value={codigo}
              readOnly
              title="Imutável após criação (BR-003)"
              className="bg-muted"
            />
          )}
          {fieldErrors.codigo && (
            <p id="codigo-error" role="alert" className="text-sm text-destructive">
              {fieldErrors.codigo}
            </p>
          )}
        </div>

        {/* Nome */}
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={200}
            required
          />
        </div>

        {/* Descricao */}
        <div className="space-y-1.5">
          <Label htmlFor="descricao">Descrição</Label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            maxLength={2000}
            rows={3}
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Parent selection (create mode only) */}
        {mode === 'create' && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRoot}
                onChange={(e) => {
                  setIsRoot(e.target.checked);
                  if (e.target.checked) setSelectedParentId(null);
                }}
                className="accent-primary"
              />
              Criar como raiz (N1)
            </label>

            {!isRoot && (
              <>
                <Label htmlFor="parent">Nó pai *</Label>
                <select
                  id="parent"
                  value={selectedParentId ?? ''}
                  onChange={(e) => setSelectedParentId(e.target.value || null)}
                  required={!isRoot}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Selecione o nó pai</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {getLevelInfo(p.nivel).shortLabel} — {p.codigo} — {p.nome}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}

        {/* Parent (edit mode — readonly) */}
        {mode === 'edit' && formVM && formVM.parentId && (
          <div className="space-y-1.5">
            <Label htmlFor="parent-edit">Nó pai</Label>
            <Input
              id="parent-edit"
              type="text"
              value={
                formVM.breadcrumb.length > 0
                  ? `${formVM.breadcrumb[formVM.breadcrumb.length - 1]?.codigo ?? ''} — ${formVM.breadcrumb[formVM.breadcrumb.length - 1]?.nome ?? ''}`
                  : '(raiz)'
              }
              readOnly
              title="Imutável após criação (BR-010)"
              className="bg-muted"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
            {mode === 'create' ? 'Criar unidade' : 'Salvar alterações'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
