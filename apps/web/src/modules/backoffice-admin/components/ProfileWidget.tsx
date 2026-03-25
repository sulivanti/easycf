/**
 * @contract FR-004, FR-007, UX-SHELL-001, INT-002, INT-006
 *
 * ProfileWidget — dropdown no Header (direita).
 * - Avatar (iniciais como fallback), nome, email, tenant
 * - "Alterar Senha" → abre ChangePasswordModal
 * - "Sair" → POST /auth/logout com isLoading
 * - Skeleton durante loading
 */

import { useState } from 'react';
import { KeyRound, LogOut, User, Monitor } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@shared/ui/button';
import { Skeleton } from '@shared/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';
import { useLogout } from '../hooks/use-logout';
import { ChangePasswordModal } from './ChangePasswordModal';
import type { AuthMeResponse } from '../types/backoffice-admin.types';

interface Props {
  user: AuthMeResponse | undefined;
  isLoading: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export function ProfileWidget({ user, isLoading }: Props) {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const logout = useLogout();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-3.5 w-20" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 px-2">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="size-8 rounded-full object-cover" />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {getInitials(user.name)}
              </div>
            )}
            <span className="text-sm font-medium">{user.name}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground/70">{user.tenant.name}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => navigate({ to: '/profile' })}>
            <User className="size-4" />
            Meu Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate({ to: '/sessoes' })}>
            <Monitor className="size-4" />
            Sessões Ativas
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setChangePasswordOpen(true)}>
            <KeyRound className="size-4" />
            Alterar Senha
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={logout.isPending}
            onSelect={() => logout.mutate()}
          >
            <LogOut className="size-4" />
            {logout.isPending ? 'Saindo...' : 'Sair'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </>
  );
}
