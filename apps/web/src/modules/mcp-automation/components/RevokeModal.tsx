/**
 * @contract FR-002, BR-015, UX-MCP-001
 *
 * Revocation confirmation modal with mandatory reason (min 10 chars).
 * Irreversible action — destructive button style.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from '@shared/ui';

interface RevokeModalProps {
  agentName: string;
  loading: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function RevokeModal({ agentName, loading, onConfirm, onCancel }: RevokeModalProps) {
  const [reason, setReason] = useState('');
  const isValid = reason.trim().length >= 10;

  return (
    <Dialog
      open
      onOpenChange={(open: boolean) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Confirmar Revogacao</DialogTitle>
          <DialogDescription>
            Revogar o agente &ldquo;{agentName}&rdquo;? Esta acao e irreversivel.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-3">
          <Label htmlFor="revoke-reason">Motivo da revogacao</Label>
          <Input
            id="revoke-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Informe o motivo (minimo 10 caracteres)"
            aria-invalid={reason.length > 0 && !isValid}
          />
          {reason.length > 0 && !isValid && (
            <p className="text-sm text-destructive">
              Informe o motivo da revogacao (minimo 10 caracteres).
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(reason.trim())}
            disabled={!isValid || loading}
          >
            {loading ? 'Revogando...' : 'Revogar definitivamente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
