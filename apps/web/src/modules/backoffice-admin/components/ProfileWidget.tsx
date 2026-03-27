/**
 * @contract FR-004, FR-007, UX-SHELL-001, INT-002, INT-006, DOC-UX-011 §2.2
 *
 * ProfileWidget — dropdown no Header (direita).
 * - Avatar (iniciais como fallback), nome, email, tenant
 * - "Alterar Senha" → abre ChangePasswordModal
 * - "Sair" → POST /auth/logout com isLoading
 * - Skeleton durante loading
 * - variant="dark" para topbar A1 escura
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
import { ChangePasswordModal } from './ChangePasswordModal';
import { ProfileAvatar } from './ProfileAvatar';
import { LogoutConfirmDialog } from './LogoutConfirmDialog';
import type { AuthMeResponse } from '../types/backoffice-admin.types';

interface Props {
  user: AuthMeResponse | undefined;
  isLoading: boolean;
  variant?: 'light' | 'dark';
}

export function ProfileWidget({ user, isLoading, variant = 'light' }: Props) {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const navigate = useNavigate();
  const isDark = variant === 'dark';

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className={`size-8 rounded-full ${isDark ? 'bg-white/10' : ''}`} />
        <Skeleton className={`h-3.5 w-20 ${isDark ? 'bg-white/10' : ''}`} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2.5 px-2 ${isDark ? 'hover:bg-white/10' : ''}`}
          >
            <div className="flex flex-col items-end gap-px">
              <span
                className={`font-display text-xs font-medium ${isDark ? 'text-white' : 'text-foreground'}`}
              >
                {user.name}
              </span>
              <span
                className={`font-display text-[10px] ${isDark ? 'text-[#444444]' : 'text-muted-foreground'}`}
              >
                {user.tenant.name}
              </span>
            </div>
            <ProfileAvatar name={user.name} avatarUrl={user.avatar_url} size="sm" useA1Color />
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
          <DropdownMenuItem variant="destructive" onSelect={() => setLogoutOpen(true)}>
            <LogOut className="size-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
      <LogoutConfirmDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </>
  );
}
