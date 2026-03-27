/**
 * @contract UX-004, FR-006
 * User form — create and edit modes.
 * States: Loading (skeleton in edit mode), Error (inline validation + toast RFC 9457).
 * Uses @shared/ui/ components + Tailwind (PKG-COD-001 §3.5).
 */

import { useState, useEffect, startTransition, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Skeleton } from '@shared/ui/skeleton';
import { PageHeader } from '@shared/ui/page-header';
import { FormField } from '@shared/ui/form-field';
import { useUser, useCreateUser, useUpdateUser } from '../../hooks/use-users.js';

export function UserFormPage({
  userId,
  onSuccess,
  onCancel,
}: {
  userId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const isEdit = !!userId;
  const { user, loading: loadingUser } = useUser(userId ?? null);
  const { createUser, loading: creating, error: createError } = useCreateUser();
  const { updateUser, loading: updating, error: updateError } = useUpdateUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');

  useEffect(() => {
    if (user) {
      startTransition(() => {
        setFullName(user.full_name);
        setEmail(user.email);
        setCpfCnpj(user.cpf_cnpj ?? '');
      });
    }
  }, [user]);

  const error = isEdit ? updateError : createError;
  const submitting = isEdit ? updating : creating;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (isEdit && userId) {
        await updateUser(userId, {
          full_name: fullName,
          cpf_cnpj: cpfCnpj || null,
        });
        toast.success('Usuário atualizado com sucesso.');
      } else {
        await createUser({
          email,
          password,
          full_name: fullName,
          cpf_cnpj: cpfCnpj || undefined,
        });
        toast.success('Usuário cadastrado com sucesso.');
      }
      onSuccess?.();
    } catch {
      // error state handled by hooks
    }
  }

  if (isEdit && loadingUser) {
    return (
      <div className="max-w-md space-y-4" aria-busy="true">
        <Skeleton className="h-8 w-48 bg-a1-border" />
        <Skeleton className="h-10 w-full bg-a1-border" />
        <Skeleton className="h-10 w-full bg-a1-border" />
        <Skeleton className="h-10 w-full bg-a1-border" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={isEdit ? 'Editar Usuário' : 'Cadastrar Usuário'} />

      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4 rounded-lg border border-a1-border bg-white p-6"
      >
        {error && (
          <div
            role="alert"
            className="rounded-md border border-a1-border bg-status-error-bg p-3 text-sm text-danger-600"
          >
            <p>{error.message}</p>
          </div>
        )}

        {!isEdit && (
          <>
            <FormField label="E-mail" name="user-email" required>
              <Input
                type="email"
                required
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </FormField>

            <FormField label="Senha" name="user-password" required>
              <Input
                type="password"
                required
                minLength={8}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </FormField>
          </>
        )}

        <FormField label="Nome completo" name="user-name" required>
          <Input
            type="text"
            required
            maxLength={255}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </FormField>

        <FormField label="CPF/CNPJ" name="user-cpf">
          <Input
            type="text"
            maxLength={20}
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
          />
        </FormField>

        <div className="flex gap-2">
          <Button type="submit" isLoading={submitting}>
            {isEdit ? 'Salvar' : 'Cadastrar'}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default UserFormPage;
