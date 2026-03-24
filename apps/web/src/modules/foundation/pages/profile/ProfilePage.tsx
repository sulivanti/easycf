/**
 * @contract UX-005, FR-004, FR-005
 * Profile page — view/edit profile, change password.
 * States: Loading (skeleton), Error (toast RFC 9457).
 * Uses @shared/ui/ components + Tailwind (PKG-COD-001 §3.5).
 */

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { Skeleton } from '@shared/ui/skeleton';
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
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
        {error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
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
      <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>

      {!editMode ? (
        <section className="space-y-4">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="font-medium text-muted-foreground">Nome</dt>
            <dd>{profile.full_name}</dd>
            <dt className="font-medium text-muted-foreground">E-mail</dt>
            <dd>{profile.email}</dd>
            <dt className="font-medium text-muted-foreground">Código</dt>
            <dd className="font-mono">{profile.codigo}</dd>
            <dt className="font-medium text-muted-foreground">Status</dt>
            <dd>{profile.status}</dd>
            <dt className="font-medium text-muted-foreground">Tenant ativo</dt>
            <dd>{profile.active_tenant_id ?? 'Nenhum'}</dd>
          </dl>
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
        </section>
      ) : (
        <form onSubmit={handleProfileSubmit} className="max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Nome</Label>
            <Input
              id="profile-name"
              type="text"
              required
              maxLength={255}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Salvar</Button>
            <Button type="button" variant="ghost" onClick={() => setEditMode(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <hr className="border-border" />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Alterar senha</h2>
        {!showPwForm ? (
          <Button variant="outline" size="sm" onClick={() => setShowPwForm(true)}>
            Alterar senha
          </Button>
        ) : (
          <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
            {pwError && (
              <div
                role="alert"
                className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <p>{pwError.message}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="current-pw">Senha atual</Label>
              <Input
                id="current-pw"
                type="password"
                required
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-pw">Nova senha</Label>
              <Input
                id="new-pw"
                type="password"
                required
                minLength={8}
                maxLength={128}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password"
              />
            </div>

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
