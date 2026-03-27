import * as React from 'react';
import { AlertTriangleIcon, HelpCircleIcon } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}

function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  variant = 'default',
  isLoading = false,
}: ConfirmationModalProps) {
  const isDestructive = variant === 'destructive';
  const Icon = isDestructive ? AlertTriangleIcon : HelpCircleIcon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full ${isDestructive ? 'bg-status-error-bg' : 'bg-status-info-bg'}`}
            >
              <Icon
                className={`size-5 ${isDestructive ? 'text-danger-500' : 'text-primary-500'}`}
              />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { ConfirmationModal };
export type { ConfirmationModalProps };
