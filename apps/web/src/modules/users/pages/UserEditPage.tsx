/**
 * @contract UX-USR-002, FR-002-EDIT, BR-002, BR-006
 * User edit page — loads existing user via GET /users/:id, submits via PATCH.
 * Scope guard: users:user:read to view, users:user:write for status toggle + reset password.
 * LGPD: email displayed readonly only, never in toasts.
 * Error handling: 404 → redirect, 422 → inline, 500 → toast.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@shared/ui';
import { Input } from '@shared/ui';
import { Label } from '@shared/ui';
import { Skeleton } from '@shared/ui';
import { PageHeader } from '@shared/ui/page-header';
import { Select } from '@shared/ui/select';
import { useRoleOptions } from '../hooks/use-role-options.js';
import { useUserDetail } from '../hooks/use-user-detail.js';
import { useUpdateUser } from '../hooks/use-update-user.js';
import { useResetPassword } from '../hooks/use-reset-password.js';
import { COPY, SCOPES, hasScope, extractFieldErrors } from '../types/users.types.js';
import { ApiError } from '../../foundation/api/http-client.js';

interface UserEditPageProps {
  userId: string;
  userScopes: readonly string[];
  onNavigateToList: () => void;
}

export function UserEditPage({ userId, userScopes, onNavigateToList }: UserEditPageProps) {
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
    error: userFetchError,
  } = useUserDetail(userId);

  const {
    data: roles,
    isLoading: rolesLoading,
    isError: rolesError,
    refetch: rolesRetry,
  } = useRoleOptions();

  const { mutateAsync: updateUserMut, isPending: submitLoading } = useUpdateUser();
  const { mutateAsync: resetPasswordMut, isPending: resetPending } = useResetPassword();

  const [fullName, setFullName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [status, setStatus] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Map<string, string>>(new Map());
  const [initialized, setInitialized] = useState(false);
  const firstErrorRef = useRef<HTMLInputElement | null>(null);

  const canWrite = hasScope(userScopes, SCOPES.USER_WRITE);

  // Populate form when user data loads
  useEffect(() => {
    if (user && !initialized) {
      setFullName(user.fullName);
      setRoleId(user.roleId);
      setStatus(user.status);
      setInitialized(true);
    }
  }, [user, initialized]);

  // @contract BR-006 — 404 redirect
  useEffect(() => {
    if (userError && userFetchError instanceof ApiError && userFetchError.status === 404) {
      toast.error(COPY.label.userNotFound);
      onNavigateToList();
    }
  }, [userError, userFetchError, onNavigateToList]);

  const validate = useCallback((): Map<string, string> => {
    const errors = new Map<string, string>();
    if (!fullName.trim()) errors.set('fullName', COPY.validation.nameRequired);
    if (!roleId) errors.set('roleId', COPY.validation.profileRequired);
    return errors;
  }, [fullName, roleId]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const errors = validate();
      if (errors.size > 0) {
        setFieldErrors(errors);
        firstErrorRef.current?.focus();
        return;
      }

      setFieldErrors(new Map());

      try {
        await updateUserMut({
          userId,
          data: {
            fullName: fullName.trim(),
            roleId,
            ...(canWrite ? { status } : {}),
          },
        });
        // @contract BR-002 — toast never shows email
        toast.success(COPY.toast.userUpdated);
        setTimeout(() => onNavigateToList(), 1500);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 404) {
            toast.error(COPY.label.userNotFound);
            onNavigateToList();
          } else if (err.status === 422) {
            const problem = err.problem as unknown as Record<string, unknown>;
            const ext = problem.extensions as Record<string, unknown> | undefined;
            setFieldErrors(extractFieldErrors(ext));
          } else {
            toast.error(COPY.error.updateUserFailed, {
              description: err.correlationId ? `ID: ${err.correlationId}` : undefined,
            });
          }
        }
      }
    },
    [validate, userId, fullName, roleId, status, canWrite, updateUserMut, onNavigateToList],
  );

  const handleResetPassword = useCallback(async () => {
    try {
      await resetPasswordMut(userId);
      toast.success(COPY.toast.passwordReset);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      toast.error(COPY.error.resetPasswordFailed, {
        description: apiErr?.correlationId ? `ID: ${apiErr.correlationId}` : undefined,
      });
    }
  }, [userId, resetPasswordMut]);

  // Focus first error field
  useEffect(() => {
    if (fieldErrors.size > 0) firstErrorRef.current?.focus();
  }, [fieldErrors]);

  const isSubmitDisabled = submitLoading || !fullName.trim() || !roleId;
  const roleOptions = (roles ?? []).map((role) => ({ value: role.id, label: role.name }));

  // Loading skeleton
  if (userLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          title={COPY.label.editUser}
          actions={
            <Button variant="ghost" size="sm" onClick={onNavigateToList}>
              &larr; Voltar
            </Button>
          }
        />
        <div className="rounded-lg border bg-card p-6 space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-1/3" />
        </div>
      </div>
    );
  }

  // Error state (non-404 handled above)
  if (userError) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          title={COPY.label.editUser}
          actions={
            <Button variant="ghost" size="sm" onClick={onNavigateToList}>
              &larr; Voltar
            </Button>
          }
        />
        <div className="rounded-md bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{COPY.error.loadUserFailed}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <PageHeader
        title={COPY.label.editUser}
        actions={
          <Button variant="ghost" size="sm" onClick={onNavigateToList}>
            &larr; Voltar
          </Button>
        }
      />

      {/* Form */}
      <div className="rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Full Name */}
          <div className="space-y-2">
            <Label
              htmlFor="fullName"
              className="font-display text-[11px] font-bold uppercase tracking-[0.8px] text-a1-text-secondary"
            >
              NOME COMPLETO
            </Label>
            <Input
              ref={fieldErrors.has('fullName') ? firstErrorRef : undefined}
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-describedby={fieldErrors.has('fullName') ? 'fullName-error' : undefined}
              aria-invalid={fieldErrors.has('fullName')}
            />
            {fieldErrors.has('fullName') && (
              <p id="fullName-error" className="text-xs text-destructive">
                {fieldErrors.get('fullName')}
              </p>
            )}
          </div>

          {/* Email — readonly (@contract LGPD) */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="font-display text-[11px] font-bold uppercase tracking-[0.8px] text-a1-text-secondary"
            >
              E-MAIL CORPORATIVO
            </Label>
            <Input
              id="email"
              type="email"
              value={user?.email ?? ''}
              disabled
              readOnly
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">{COPY.label.emailReadonly}</p>
          </div>

          {/* Role select */}
          <div className="space-y-2">
            <Label
              htmlFor="roleId"
              className="font-display text-[11px] font-bold uppercase tracking-[0.8px] text-a1-text-secondary"
            >
              PERFIL
            </Label>
            {rolesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : rolesError ? (
              <div className="flex items-center gap-2">
                <p className="text-xs text-destructive">{COPY.error.loadRolesFailed}</p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => rolesRetry()}
                >
                  {COPY.label.retry}
                </Button>
              </div>
            ) : (
              <Select
                id="roleId"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                options={roleOptions}
                placeholder="Selecione um perfil"
                className="w-full"
                aria-describedby={fieldErrors.has('roleId') ? 'roleId-error' : undefined}
                aria-invalid={fieldErrors.has('roleId')}
              />
            )}
            {fieldErrors.has('roleId') && (
              <p id="roleId-error" className="text-xs text-destructive">
                {fieldErrors.get('roleId')}
              </p>
            )}
          </div>

          {/* Status toggle — only for scope write */}
          {canWrite && (
            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="font-display text-[11px] font-bold uppercase tracking-[0.8px] text-a1-text-secondary"
              >
                STATUS
              </Label>
              <Select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: 'ACTIVE', label: 'Ativo' },
                  { value: 'BLOCKED', label: 'Bloqueado' },
                  { value: 'INACTIVE', label: 'Inativo' },
                  { value: 'PENDING', label: 'Aguardando ativação' },
                ]}
                className="w-full"
              />
            </div>
          )}

          {/* Reset password — scope write + status ACTIVE */}
          {canWrite && status === 'ACTIVE' && (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Resetar Senha</p>
                  <p className="text-xs text-muted-foreground">
                    Envia um link de redefinição de senha ao usuário.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={resetPending}
                  onClick={handleResetPassword}
                  aria-busy={resetPending}
                >
                  {resetPending ? 'Enviando...' : 'Resetar Senha'}
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={onNavigateToList}
              disabled={submitLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitDisabled} aria-busy={submitLoading}>
              {submitLoading ? 'Salvando...' : COPY.label.saveChanges}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
