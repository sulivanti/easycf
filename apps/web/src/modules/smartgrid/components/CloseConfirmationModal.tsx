/**
 * @contract FR-004, BR-010, UX-SGR-001
 * Modal shown when user tries to close the grid with unsaved data.
 * Options: "Export and exit" / "Exit without exporting" / "Cancel"
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';

interface CloseConfirmationModalProps {
  readonly open: boolean;
  readonly onExportAndExit: () => void;
  readonly onExitWithoutExport: () => void;
  readonly onCancel: () => void;
}

/** @contract FR-004 — close-confirmation-modal */
export function CloseConfirmationModal({
  open,
  onExportAndExit,
  onExitWithoutExport,
  onCancel,
}: CloseConfirmationModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dados não salvos</DialogTitle>
          <DialogDescription>
            Você possui dados não salvos. Deseja exportar antes de sair?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="secondary" onClick={onExitWithoutExport}>
            Sair sem exportar
          </Button>
          <Button onClick={onExportAndExit}>Exportar e sair</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
