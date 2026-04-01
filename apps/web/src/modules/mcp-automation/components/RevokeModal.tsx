/**
 * @contract FR-002, BR-015, UX-MCP-001, UX-010-M01 (D8)
 *
 * Revocation confirmation modal with mandatory reason (min 10 chars).
 * Irreversible action — destructive button style.
 *
 * D8 — Warning icon, textarea, centered layout.
 */

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
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
        {/* D8 — Centered layout with warning icon */}
        <div className="flex flex-col items-center text-center">
          {/* D8 — Warning icon 48x48 red background */}
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="size-6 text-destructive" />
          </div>

          <DialogHeader className="items-center">
            <DialogTitle className="text-center text-destructive">Confirmar Revogação</DialogTitle>
            <DialogDescription className="text-center">
              Revogar o agente &ldquo;{agentName}&rdquo;? Esta ação é irreversível.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="my-4 space-y-3">
          <Label
            htmlFor="revoke-reason"
            className="text-[10px] font-semibold uppercase tracking-wider"
          >
            Motivo da revogação
          </Label>
          {/* D8 — Textarea instead of Input */}
          <textarea
            id="revoke-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Informe o motivo (mínimo 10 caracteres)"
            aria-invalid={reason.length > 0 && !isValid}
            rows={3}
            className="w-full rounded-md border border-a1-border bg-white px-3 py-2 text-sm text-a1-text-primary outline-none placeholder:text-a1-text-placeholder focus-visible:border-primary-600 focus-visible:ring-[3px] focus-visible:ring-primary-600/20 aria-[invalid=true]:border-destructive"
          />
          {reason.length > 0 && !isValid && (
            <p className="text-sm text-destructive">
              Informe o motivo da revogação (mínimo 10 caracteres).
            </p>
          )}
        </div>

        {/* D8 — Centered buttons */}
        <div className="flex justify-center gap-3">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
