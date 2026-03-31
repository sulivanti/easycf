/**
 * @contract UX-006, UX-000-M04, FR-007, 07-role-form-spec
 * RoleFormPage — create and edit modes for roles/profiles.
 * Create: /perfis/novo | Edit: /perfis/:roleId
 * FormCard 720px, ScopeChips, Toggle status, InfoBox, BackLink.
 * States: Loading (skeleton), Error (toast + inline).
 * Uses @shared/ui/ components + Tailwind (PKG-COD-001 §3.5).
 */

import { useState, useEffect, startTransition, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Skeleton } from '@shared/ui/skeleton';
import { PageHeader } from '@shared/ui/page-header';
import { FormField } from '@shared/ui/form-field';
import { StatusBadge } from '@shared/ui/status-badge';
import { Toggle } from '@shared/ui/toggle';
import { BackLink } from '@shared/ui/back-link';
import { InfoBox } from '@shared/ui/info-box';
import { ScopeGrid } from '../../ui/scope-grid.js';
import { AddScopeRow } from '../../ui/add-scope-row.js';
import { useRole, useCreateRole, useUpdateRole } from '../../hooks/use-roles.js';

export function RoleFormPage({ roleId }: { roleId?: string }) {
  const isEdit = !!roleId;
  const navigate = useNavigate();
  const { role, loading: loadingRole } = useRole(roleId ?? null);
  const { createRole, loading: creating, error: createError } = useCreateRole();
  const { updateRole, loading: updating, error: updateError } = useUpdateRole();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scopes, setScopes] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (role) {
      startTransition(() => {
        setName(role.name);
        setDescription(role.description ?? '');
        setScopes(role.scopes);
        setIsActive(role.status === 'ACTIVE');
      });
    }
  }, [role]);

  const error = isEdit ? updateError : createError;
  const submitting = isEdit ? updating : creating;

  function handleRemoveScope(scope: string) {
    setScopes((prev) => prev.filter((s) => s !== scope));
  }

  function handleAddScope(scope: string) {
    setScopes((prev) => [...prev, scope]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (isEdit && roleId) {
        await updateRole(roleId, {
          name,
          description: description || null,
          scopes,
          status: isActive ? 'ACTIVE' : 'INACTIVE',
        });
        toast.success('Perfil atualizado com sucesso.');
      } else {
        await createRole({ name, description: description || undefined, scopes });
        toast.success('Perfil criado com sucesso.');
      }
      navigate({ to: '/perfis' });
    } catch {
      // error state handled by hooks
    }
  }

  function handleCancel() {
    navigate({ to: '/perfis' });
  }

  // Loading skeleton (edit mode)
  if (isEdit && loadingRole) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Editar Perfil"
          breadcrumbs={[
            { label: 'Administração' },
            { label: 'Perfis e Permissões', href: '/perfis' },
            { label: 'Editar' },
          ]}
        />
        <div className="w-[720px] space-y-6 rounded-xl border border-a1-border bg-white p-8">
          <Skeleton className="h-8 w-48 bg-a1-border" />
          <Skeleton className="h-12 w-full bg-a1-border" />
          <Skeleton className="h-20 w-full bg-a1-border" />
          <Skeleton className="h-5 w-32 bg-a1-border" />
          <Skeleton className="h-px w-full bg-a1-border" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-36 bg-a1-border" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Administração' },
    { label: 'Perfis e Permissões', href: '/perfis' },
    { label: isEdit ? 'Editar' : 'Novo' },
  ];

  return (
    <div className="space-y-0">
      <BackLink to="/perfis" />

      <PageHeader
        title={isEdit ? 'Editar Perfil' : 'Novo Perfil'}
        description={
          isEdit
            ? 'Altere as propriedades e permissões deste perfil.'
            : 'Defina o nome, descrição e permissões do novo perfil.'
        }
        breadcrumbs={breadcrumbs}
        actions={
          isEdit && role ? (
            <StatusBadge status={role.status === 'ACTIVE' ? 'success' : 'neutral'}>
              {role.status === 'ACTIVE' ? 'ATIVO' : 'INATIVO'}
            </StatusBadge>
          ) : undefined
        }
      />

      <form
        onSubmit={handleSubmit}
        className="w-[720px] rounded-xl border border-a1-border bg-white p-8"
      >
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-md border border-a1-border bg-status-error-bg p-3 text-sm text-danger-600"
          >
            <p>{error.message}</p>
          </div>
        )}

        {/* Section: Informações Básicas */}
        <div className="space-y-5">
          <FormField label="Nome" name="role-name" required>
            <Input
              type="text"
              required
              maxLength={255}
              placeholder={isEdit ? undefined : 'Nome do perfil'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-[10px]"
            />
          </FormField>

          <FormField label="Descrição" name="role-description">
            <textarea
              id="role-description"
              maxLength={1000}
              rows={3}
              placeholder={isEdit ? undefined : 'Descreva as responsabilidades deste perfil'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[80px] rounded-[10px] border border-a1-border bg-white px-3 py-2.5 font-display text-sm text-a1-text-primary placeholder:text-a1-text-placeholder leading-relaxed outline-none transition-colors focus:border-primary-600 focus:ring-[3px] focus:ring-primary-600/15"
            />
          </FormField>

          {/* Toggle status (edit only) */}
          {isEdit && (
            <FormField label="Status" name="role-status">
              <Toggle
                checked={isActive}
                onChange={setIsActive}
                label={isActive ? 'Ativo' : 'Inativo'}
              />
            </FormField>
          )}
        </div>

        {/* Separator */}
        <div className="my-7 h-px bg-a1-border" />

        {/* Section: Escopos e Permissões */}
        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <span className="font-display text-[11px] font-bold uppercase tracking-[1px] text-a1-text-auxiliary">
              Escopos e Permissões
            </span>
            <span className="text-xs font-medium text-a1-text-auxiliary">
              {scopes.length} escopo{scopes.length !== 1 ? 's' : ''} atribuído
              {scopes.length !== 1 ? 's' : ''}
            </span>
          </div>

          <ScopeGrid scopes={scopes} onRemove={handleRemoveScope} />
          <AddScopeRow existingScopes={scopes} onAdd={handleAddScope} />

          <InfoBox className="mt-4">
            Os escopos definem quais ações este perfil pode executar no sistema. Use o formato
            domínio:entidade:ação.
          </InfoBox>
        </div>

        {/* Separator */}
        <div className="my-7 h-px bg-a1-border" />

        {/* Footer buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            isLoading={submitting}
            disabled={scopes.length === 0 || !name.trim()}
            className="h-11 w-[160px]"
          >
            {isEdit ? 'Salvar Alterações' : 'Criar Perfil'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={submitting}
            className="h-11 w-[100px]"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

export default RoleFormPage;
