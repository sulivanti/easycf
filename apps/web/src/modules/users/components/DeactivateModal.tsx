/**
 * @contract FR-001, BR-002
 * Confirmation dialog for user deactivation.
 * LGPD: displays user NAME only, NEVER email.
 * Uses shared Dialog component with motion animations.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui';
import { Button } from '@shared/ui';
import { COPY } from '../types/users.types.js';

interface DeactivateModalProps {
  open: boolean;
  userName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeactivateModal({
  open,
  userName,
  loading,
  onConfirm,
  onCancel,
}: DeactivateModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !loading) onCancel();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{COPY.modal.deactivateTitle}</DialogTitle>
          <DialogDescription>{COPY.modal.deactivateBody(userName)}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {COPY.modal.deactivateCancel}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading} aria-busy={loading}>
            {loading ? 'Desativando...' : COPY.modal.deactivateConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
