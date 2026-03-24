/**
 * @contract UX-APROV-001, FR-007
 * Dialog for overriding a movement decision.
 * Requires justification (min 20 chars) and confirmation checkbox.
 * Uses shared Dialog from @shared/ui.
 */

import { useState } from 'react';
import {
  Button,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui';

interface OverrideModalProps {
  open: boolean;
  movementCode: string;
  onConfirm: (justification: string) => void;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
}

const MIN_JUSTIFICATION_LENGTH = 20;

export function OverrideModal({
  open,
  movementCode,
  onConfirm,
  onClose,
  loading,
  error,
}: OverrideModalProps) {
  const [justification, setJustification] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isValid = justification.trim().length >= MIN_JUSTIFICATION_LENGTH && confirmed;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setLocalError(
        !confirmed
          ? 'Confirme que deseja sobrescrever a decisão.'
          : `Justificativa deve ter no mínimo ${MIN_JUSTIFICATION_LENGTH} caracteres.`,
      );
      return;
    }
    setLocalError(null);
    onConfirm(justification.trim());
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      onClose();
      setJustification('');
      setConfirmed(false);
      setLocalError(null);
    }
  };

  const displayError = localError || error;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent role="alertdialog" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Override — {movementCode}</DialogTitle>
          <DialogDescription>
            Esta ação sobrescreve a decisão do fluxo de aprovação. A operação será registrada em
            auditoria.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="override-justification">
              Justificativa (mínimo {MIN_JUSTIFICATION_LENGTH} caracteres)
            </Label>
            <textarea
              id="override-justification"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Descreva o motivo para o override..."
              rows={4}
              disabled={loading}
            />
            <span className="text-xs text-muted-foreground">
              {justification.trim().length}/{MIN_JUSTIFICATION_LENGTH}
            </span>
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={loading}
              className="mt-0.5 rounded border-input"
            />
            <span className="text-muted-foreground">
              Confirmo que desejo sobrescrever esta decisão e estou ciente que a ação será auditada.
            </span>
          </label>

          {displayError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {displayError}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!isValid || loading}
              isLoading={loading}
            >
              Confirmar Override
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
