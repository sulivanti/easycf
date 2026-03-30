/**
 * @contract UX-USR-002, FR-002, BR-002, BR-003, BR-005, BR-006
 * User creation page — two-mode form (invite / password).
 * Scope guard: users:user:write required.
 * LGPD: toast never shows email. Idempotency-Key on mount.
 * Redirect to /usuarios after 1.5s on success.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import { Button } from '@shared/ui';
import { Input } from '@shared/ui';
import { Label } from '@shared/ui';
import { Skeleton } from '@shared/ui';
import { PageHeader } from '@shared/ui/page-header';
import { Select } from '@shared/ui/select';
import { useRoleOptions } from '../hooks/use-role-options.js';
import { useCreateUser } from '../hooks/use-create-user.js';
import { useTenants } from '../../foundation/hooks/use-tenants.js';
import {
  COPY,
  extractFieldErrors,
  evaluatePasswordStrength,
  type CreateUserRequest,
  type StrengthLevel,
} from '../types/users.types.js';
import { ApiError } from '../../foundation/api/http-client.js';

type CreationMode = 'invite' | 'password';

const STRENGTH_CONFIG: Record<StrengthLevel, { label: string; color: string; width: string }> = {
  none: { label: '', color: 'bg-muted', width: 'w-0' },
  weak: { label: COPY.strength.weak, color: 'bg-destructive', width: 'w-1/3' },
  medium: { label: COPY.strength.medium, color: 'bg-warning', width: 'w-2/3' },
  strong: { label: COPY.strength.strong, color: 'bg-success', width: 'w-full' },
};

interface UserFormPageProps {
  onNavigateToList: () => void;
}

export function UserFormPage({ onNavigateToList }: UserFormPageProps) {
  const {
    data: roles,
    isLoading: rolesLoading,
    isError: rolesError,
    refetch: rolesRetry,
  } = useRoleOptions();
  const { tenants, loading: tenantsLoading } = useTenants();
  const { mutateAsync: createUser, isPending: submitLoading, regenerateKey } = useCreateUser();

  const [mode, setMode] = useState<CreationMode>('invite');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Map<string, string>>(new Map());
  const firstErrorRef = useRef<HTMLInputElement | null>(null);

  // @contract BR-003 — Mode switch resets entire form
  const handleModeSwitch = useCallback((newMode: CreationMode) => {
    setMode(newMode);
    setFullName('');
    setEmail('');
    setRoleId('');
    setTenantId('');
    setPassword('');
    setPasswordConfirm('');
    setFieldErrors(new Map());
  }, []);

  const validate = useCallback((): Map<string, string> => {
    const errors = new Map<string, string>();
    if (!fullName.trim()) errors.set('fullName', COPY.validation.nameRequired);
    if (!email.trim()) errors.set('email', COPY.validation.emailRequired);
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.set('email', COPY.validation.emailInvalid);
    if (!roleId) errors.set('roleId', COPY.validation.profileRequired);
    if (mode === 'password') {
      if (!password) errors.set('password', COPY.validation.passwordRequired);
      if (password && passwordConfirm && password !== passwordConfirm)
        errors.set('passwordConfirm', COPY.validation.passwordMismatch);
    }
    return errors;
  }, [fullName, email, roleId, mode, password, passwordConfirm]);

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
      const data: CreateUserRequest =
        mode === 'invite'
          ? { fullName, email, roleId, mode: 'invite' }
          : { fullName, email, roleId, password, forcePasswordReset: true };

      try {
        await createUser(data);
        // @contract BR-002 — toast never shows email
        const msg = mode === 'invite' ? COPY.toast.userCreatedInvite : COPY.toast.userCreated;
        toast.success(msg);
        regenerateKey();
        setTimeout(() => onNavigateToList(), 1500);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 409) {
            setFieldErrors(new Map([['email', COPY.validation.emailDuplicate]]));
          } else if (err.status === 422) {
            const problem = err.problem as unknown as Record<string, unknown>;
            const ext = problem.extensions as Record<string, unknown> | undefined;
            setFieldErrors(extractFieldErrors(ext));
          } else {
            toast.error(COPY.error.createUserFailed, {
              description: err.correlationId ? `ID: ${err.correlationId}` : undefined,
            });
          }
        }
      }
    },
    [
      validate,
      mode,
      fullName,
      email,
      roleId,
      password,
      createUser,
      regenerateKey,
      onNavigateToList,
    ],
  );

  // Focus first error field
  useEffect(() => {
    if (fieldErrors.size > 0) firstErrorRef.current?.focus();
  }, [fieldErrors]);

  const strengthLevel = evaluatePasswordStrength(password);
  const strengthConfig = STRENGTH_CONFIG[strengthLevel];
  const isSubmitDisabled = submitLoading || !fullName.trim() || !email.trim() || !roleId;

  const roleOptions = (roles ?? []).map((role) => ({ value: role.id, label: role.name }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <PageHeader
        title="Novo Usuário"
        actions={
          <Button variant="ghost" size="sm" onClick={onNavigateToList}>
            &larr; Voltar
          </Button>
        }
      />

      {/* Form */}
      <div className="rounded-lg border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Mode tabs */}
          <div className="flex border-b">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium ${mode === 'invite' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => handleModeSwitch('invite')}
            >
              Enviar Convite
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium ${mode === 'password' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => handleModeSwitch('password')}
            >
              Senha Temporária
            </button>
          </div>

          {/* Info banner — invite mode */}
          {mode === 'invite' && (
            <div className="flex items-center gap-2.5 rounded-lg border border-primary-100 bg-primary-50 px-3.5 py-3 font-display text-[13px] text-primary-700">
              <Info className="size-4 shrink-0" />
              Um convite será enviado por e-mail para ativação da conta.
            </div>
          )}

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

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="font-display text-[11px] font-bold uppercase tracking-[0.8px] text-a1-text-secondary"
            >
              E-MAIL CORPORATIVO
            </Label>
            <Input
              ref={
                fieldErrors.has('email') && !fieldErrors.has('fullName') ? firstErrorRef : undefined
              }
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={fieldErrors.has('email') ? 'email-error' : undefined}
              aria-invalid={fieldErrors.has('email')}
            />
            {fieldErrors.has('email') && (
              <p id="email-error" className="text-xs text-destructive">
                {fieldErrors.get('email')}
              </p>
            )}
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

          {/* Empresa */}
          <div className="space-y-2">
            <Label
              htmlFor="tenantId"
              className="font-display text-[11px] font-bold uppercase tracking-[0.8px] text-a1-text-secondary"
            >
              EMPRESA
            </Label>
            {tenantsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                id="tenantId"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                options={tenants.map((t) => ({ value: t.id, label: t.name }))}
                placeholder="Selecione uma empresa"
                className="w-full"
              />
            )}
          </div>

          {/* Password fields (only in password mode) */}
          {mode === 'password' && (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="font-display text-[11px] font-bold uppercase tracking-[0.8px] text-a1-text-secondary"
                >
                  SENHA TEMPORÁRIA
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={fieldErrors.has('password') ? 'password-error' : undefined}
                  aria-invalid={fieldErrors.has('password')}
                />
                {fieldErrors.has('password') && (
                  <p id="password-error" className="text-xs text-destructive">
                    {fieldErrors.get('password')}
                  </p>
                )}
                {/* Password strength indicator */}
                {strengthLevel !== 'none' && (
                  <div className="mt-1">
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${strengthConfig.color} ${strengthConfig.width}`}
                        role="progressbar"
                        aria-valuenow={
                          strengthLevel === 'weak' ? 33 : strengthLevel === 'medium' ? 66 : 100
                        }
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Força da senha: ${strengthConfig.label}`}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{strengthConfig.label}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="passwordConfirm"
                  className="font-display text-[11px] font-bold uppercase tracking-[0.8px] text-a1-text-secondary"
                >
                  CONFIRMAR SENHA
                </Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  aria-describedby={
                    fieldErrors.has('passwordConfirm') ? 'passwordConfirm-error' : undefined
                  }
                  aria-invalid={fieldErrors.has('passwordConfirm')}
                />
                {fieldErrors.has('passwordConfirm') && (
                  <p id="passwordConfirm-error" className="text-xs text-destructive">
                    {fieldErrors.get('passwordConfirm')}
                  </p>
                )}
              </div>
            </>
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
              {submitLoading ? 'Criando...' : 'Criar usuário'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
