/**
 * @contract FR-007, INT-006, DOC-FND-000 §1.3
 *
 * Dialog de alteração de senha (3 campos) com validação client-side.
 * - nova_senha === confirmar_nova_senha
 * - nova_senha !== senha_atual
 * - nova_senha >= 8 chars, 1 maiúscula, 1 minúscula, 1 número (DOC-FND-000 §1.1)
 * - Toggle visibilidade em todos os campos
 * - Campos limpos ao fechar (segurança)
 * - 200 → Toast sucesso + fechar + invalidar auth_me
 * - 422 → Toast + foco no campo
 */

import { useState, useRef, useEffect, startTransition, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@shared/ui/dialog';
import { useChangePassword } from '../hooks/use-change-password';
import { ApiError } from '../api/api-client';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FieldErrors {
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function ChangePasswordModal({ open, onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const currentRef = useRef<HTMLInputElement>(null);
  const mutation = useChangePassword();

  // Limpar campos ao fechar (segurança)
  useEffect(() => {
    if (!open) {
      startTransition(() => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
      });
    }
  }, [open]);

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!currentPassword) e.current_password = 'Campo obrigatório.';
    if (newPassword && newPassword === currentPassword) {
      e.new_password = 'A nova senha deve ser diferente da atual.';
    }
    if (newPassword && !PASSWORD_REGEX.test(newPassword)) {
      e.new_password = 'Mínimo 8 caracteres, 1 maiúscula, 1 minúscula e 1 número.';
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      e.confirm_password = 'As senhas não coincidem.';
    }
    return e;
  }

  const fieldErrors = validate();
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    Object.keys(fieldErrors).length === 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    mutation.mutate(
      {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
      {
        onSuccess: () => {
          toast.success('Senha alterada com sucesso.');
          onClose();
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            if (error.status === 422 && error.problem.extensions?.field === 'current_password') {
              toast.error('Senha atual incorreta.', {
                description: `ID: ${error.correlationId}`,
              });
              currentRef.current?.focus();
            } else if (error.status === 422) {
              toast.error(error.problem.detail ?? 'Erro de validação.', {
                description: `ID: ${error.correlationId}`,
              });
            } else {
              toast.error('Erro ao alterar senha.', {
                description: `ID: ${error.correlationId}`,
              });
            }
          }
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para alterar sua senha.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Senha Atual */}
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha atual</Label>
            <div className="relative">
              <Input
                ref={currentRef}
                id="current-password"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label="Alternar visibilidade"
              >
                {showCurrent ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </Button>
            </div>
            {fieldErrors.current_password && (
              <p className="text-xs text-destructive">{fieldErrors.current_password}</p>
            )}
          </div>

          {/* Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowNew(!showNew)}
                aria-label="Alternar visibilidade"
              >
                {showNew ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </Button>
            </div>
            {fieldErrors.new_password && (
              <p className="text-xs text-destructive">{fieldErrors.new_password}</p>
            )}
          </div>

          {/* Confirmar Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar nova senha</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label="Alternar visibilidade"
              >
                {showConfirm ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </Button>
            </div>
            {fieldErrors.confirm_password && (
              <p className="text-xs text-destructive">{fieldErrors.confirm_password}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit} isLoading={mutation.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
