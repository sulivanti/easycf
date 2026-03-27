/**
 * @contract UX-005, FR-004, FR-005
 * Profile page — view/edit profile, change password.
 * States: Loading (skeleton), Error (toast RFC 9457).
 * Design: A1 visual identity with PageHeader + FormField components.
 */

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Skeleton } from '@shared/ui/skeleton';
import { PageHeader } from '@shared/ui/page-header';
import { FormField } from '@shared/ui/form-field';
import { useProfile, useChangePassword } from '../../hooks/use-auth.js';

export function ProfilePage() {
  const { profile, loading, error, updateProfile } = useProfile();
  const { changePassword, loading: changingPw, error: pwError } = useChangePassword();

  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Meu Perfil" />
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-6 w-48 bg-a1-border" />
          <Skeleton className="h-6 w-64 bg-a1-border" />
          <Skeleton className="h-6 w-40 bg-a1-border" />
          <Skeleton className="h-6 w-32 bg-a1-border" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-4">
        <PageHeader title="Meu Perfil" />
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-a1-border bg-status-error-bg p-3 text-sm text-danger-600"
          >
            <p>{error.message}</p>
          </div>
        )}
      </div>
    );
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await updateProfile({ full_name: fullName });
      setEditMode(false);
      toast.success('Perfil atualizado com sucesso.');
    } catch {
      toast.error('Erro ao atualizar perfil.');
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    try {
      await changePassword({ current_password: currentPw, new_password: newPw });
      toast.success('Senha alterada com sucesso.');
      setCurrentPw('');
      setNewPw('');
      setShowPwForm(false);
    } catch {
      // error state handled by hook
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meu Perfil"
        actions={
          !editMode ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFullName(profile.full_name);
                setEditMode(true);
              }}
            >
              Editar perfil
            </Button>
          ) : undefined
        }
      />

      {!editMode ? (
        <section className="rounded-lg border border-a1-border bg-white p-6">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="font-display text-[length:var(--type-label)] font-semibold uppercase tracking-wide text-a1-text-tertiary">
              Nome
            </dt>
            <dd className="text-a1-text-primary">{profile.full_name}</dd>
            <dt className="font-display text-[length:var(--type-label)] font-semibold uppercase tracking-wide text-a1-text-tertiary">
              E-mail
            </dt>
            <dd className="text-a1-text-primary">{profile.email}</dd>
            <dt className="font-display text-[length:var(--type-label)] font-semibold uppercase tracking-wide text-a1-text-tertiary">
              Código
            </dt>
            <dd className="font-mono text-a1-text-primary">{profile.codigo}</dd>
            <dt className="font-display text-[length:var(--type-label)] font-semibold uppercase tracking-wide text-a1-text-tertiary">
              Status
            </dt>
            <dd className="text-a1-text-primary">{profile.status}</dd>
            <dt className="font-display text-[length:var(--type-label)] font-semibold uppercase tracking-wide text-a1-text-tertiary">
              Tenant ativo
            </dt>
            <dd className="text-a1-text-primary">{profile.active_tenant_id ?? 'Nenhum'}</dd>
          </dl>
        </section>
      ) : (
        <form
          onSubmit={handleProfileSubmit}
          className="max-w-md space-y-4 rounded-lg border border-a1-border bg-white p-6"
        >
          <FormField label="Nome" name="profile-name" required>
            <Input
              type="text"
              required
              maxLength={255}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </FormField>
          <div className="flex gap-2">
            <Button type="submit">Salvar</Button>
            <Button type="button" variant="ghost" onClick={() => setEditMode(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <hr className="border-a1-border" />

      <section className="space-y-4">
        <h2 className="font-display text-[length:var(--type-title)] font-bold text-a1-text-primary">
          Alterar senha
        </h2>
        {!showPwForm ? (
          <Button variant="outline" size="sm" onClick={() => setShowPwForm(true)}>
            Alterar senha
          </Button>
        ) : (
          <form
            onSubmit={handleChangePassword}
            className="max-w-md space-y-4 rounded-lg border border-a1-border bg-white p-6"
          >
            {pwError && (
              <div
                role="alert"
                className="rounded-lg border border-a1-border bg-status-error-bg p-3 text-sm text-danger-600"
              >
                <p>{pwError.message}</p>
              </div>
            )}
            <FormField label="Senha atual" name="current-pw">
              <Input
                type="password"
                required
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                autoComplete="current-password"
              />
            </FormField>
            <FormField label="Nova senha" name="new-pw">
              <Input
                type="password"
                required
                minLength={8}
                maxLength={128}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password"
              />
            </FormField>
            <div className="flex gap-2">
              <Button type="submit" isLoading={changingPw}>
                Alterar senha
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowPwForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default ProfilePage;
