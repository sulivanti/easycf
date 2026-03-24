/**
 * @contract UX-APROV-001, FR-005
 * Form for approving or rejecting a movement.
 * Opinion field is mandatory (min 10 characters).
 * Buttons are disabled if caller === requester (segregation).
 */

import { useState } from 'react';
import { Button, Label } from '@shared/ui';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shared/ui';

interface ApproveRejectFormProps {
  movementId: string;
  isSegregated: boolean;
  onApprove: (movementId: string, opinion: string) => void;
  onReject: (movementId: string, opinion: string) => void;
  loading?: boolean;
  error?: string | null;
}

const MIN_OPINION_LENGTH = 10;

export function ApproveRejectForm({
  movementId,
  isSegregated,
  onApprove,
  onReject,
  loading,
  error,
}: ApproveRejectFormProps) {
  const [opinion, setOpinion] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const isValid = opinion.trim().length >= MIN_OPINION_LENGTH;

  const handleApprove = () => {
    if (!isValid) {
      setLocalError(`Parecer deve ter no mínimo ${MIN_OPINION_LENGTH} caracteres.`);
      return;
    }
    setLocalError(null);
    onApprove(movementId, opinion.trim());
    setOpinion('');
  };

  const handleReject = () => {
    if (!isValid) {
      setLocalError(`Parecer deve ter no mínimo ${MIN_OPINION_LENGTH} caracteres.`);
      return;
    }
    setLocalError(null);
    onReject(movementId, opinion.trim());
    setOpinion('');
  };

  const displayError = localError || error;

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`opinion-${movementId}`}>
          Parecer (mínimo {MIN_OPINION_LENGTH} caracteres)
        </Label>
        <textarea
          id={`opinion-${movementId}`}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          value={opinion}
          onChange={(e) => setOpinion(e.target.value)}
          placeholder="Informe seu parecer..."
          rows={3}
          disabled={isSegregated || loading}
        />
        <span className="text-xs text-muted-foreground">
          {opinion.trim().length}/{MIN_OPINION_LENGTH}
        </span>
      </div>

      {displayError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {displayError}
        </div>
      )}

      {isSegregated && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Ação bloqueada: você é o solicitante deste movimento.
        </div>
      )}

      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="default"
                  onClick={handleApprove}
                  disabled={isSegregated || loading || !isValid}
                  isLoading={loading}
                  aria-disabled={isSegregated}
                >
                  Aprovar
                </Button>
              </span>
            </TooltipTrigger>
            {isSegregated && (
              <TooltipContent>Você não pode aprovar o próprio movimento.</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isSegregated || loading || !isValid}
                  isLoading={loading}
                  aria-disabled={isSegregated}
                >
                  Rejeitar
                </Button>
              </span>
            </TooltipTrigger>
            {isSegregated && (
              <TooltipContent>Você não pode reprovar o próprio movimento.</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
