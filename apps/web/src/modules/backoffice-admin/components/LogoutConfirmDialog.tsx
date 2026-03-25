/**
 * @contract DOC-UX-011-M03, UX-000-C01, UX-SHELL-001
 *
 * LogoutConfirmDialog — confirmation dialog before logout.
 * Uses shared Dialog primitives + useLogout mutation.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';
import { Loader2 } from 'lucide-react';
import { useLogout } from '../hooks/use-logout';
import { emitClientOnly } from '../api/telemetry';

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutConfirmDialog({ open, onOpenChange }: LogoutConfirmDialogProps) {
  const logout = useLogout();

  function handleConfirm() {
    emitClientOnly({ screenId: 'UX-SHELL-001', actionId: 'confirm_logout' });
    logout.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Encerrar sessão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja sair? Você precisará fazer login novamente para acessar o
            sistema.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={logout.isPending}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={logout.isPending}>
            {logout.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saindo...
              </>
            ) : (
              'Sair'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
