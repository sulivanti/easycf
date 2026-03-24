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
import { Label } from '@shared/ui/label';
import { Skeleton } from '@shared/ui/skeleton';
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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">
        {isEdit ? 'Editar Usuário' : 'Cadastrar Usuário'}
      </h1>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <p>{error.message}</p>
        </div>
      )}

      {!isEdit && (
        <>
          <div className="space-y-2">
            <Label htmlFor="user-email">E-mail</Label>
            <Input
              id="user-email"
              type="email"
              required
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">Senha</Label>
            <Input
              id="user-password"
              type="password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="user-name">Nome completo</Label>
        <Input
          id="user-name"
          type="text"
          required
          maxLength={255}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-cpf">CPF/CNPJ</Label>
        <Input
          id="user-cpf"
          type="text"
          maxLength={20}
          value={cpfCnpj}
          onChange={(e) => setCpfCnpj(e.target.value)}
        />
      </div>

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
  );
}

export default UserFormPage;
