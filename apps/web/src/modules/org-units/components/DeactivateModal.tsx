/**
 * @contract UX-001-M01 D7
 * DeactivateModal — custom deactivation modal with warning box and impact count.
 * Replaces generic ConfirmationModal for delete operations.
 * Spec: 480px, r:16, icon alert, warning box, Cancelar + Desativar (danger).
 */

import { AlertTriangleIcon } from 'lucide-react';
import { Dialog, DialogContent } from '@shared/ui/dialog.js';
import { Button } from '@shared/ui/button.js';

export interface DeactivateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codigo: string;
  nome: string;
  activeChildrenCount: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeactivateModal({
  open,
  onOpenChange,
  codigo,
  nome,
  activeChildrenCount,
  onConfirm,
  isLoading = false,
}: DeactivateModalProps) {
  const hasActiveChildren = activeChildrenCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-8 text-center">
        {/* Alert icon */}
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-status-error-bg">
          <AlertTriangleIcon className="size-6 text-danger-500" />
        </div>

        {/* Title */}
        <h2 className="mt-4 text-xl font-bold text-a1-text-primary">Desativar unidade?</h2>

        {/* Description */}
        <p className="mx-auto mt-2 max-w-[380px] text-sm text-a1-text-auxiliary">
          A unidade &apos;{codigo} — {nome}&apos; será desativada e ficará invisível na árvore.
        </p>

        {/* Warning box */}
        {hasActiveChildren ? (
          <div className="mx-auto mt-5 flex items-center gap-3 rounded-lg bg-[var(--color-warning-50)] px-4 py-3">
            <AlertTriangleIcon className="size-4 shrink-0 text-[var(--color-warning-600)]" />
            <span className="text-sm text-[var(--color-warning-700)]">
              Esta unidade possui {activeChildrenCount} subunidade(s) ativa(s). Desative-as
              primeiro.
            </span>
          </div>
        ) : (
          <div className="mx-auto mt-5 flex items-center gap-3 rounded-lg bg-[var(--color-warning-50)] px-4 py-3">
            <AlertTriangleIcon className="size-4 shrink-0 text-[var(--color-warning-600)]" />
            <span className="text-sm text-[var(--color-warning-700)]">
              Esta ação pode ser revertida via &quot;Restaurar&quot; no menu contextual.
            </span>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            className="w-[180px]"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="w-[180px]"
            onClick={onConfirm}
            disabled={hasActiveChildren || isLoading}
            isLoading={isLoading}
          >
            Desativar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
