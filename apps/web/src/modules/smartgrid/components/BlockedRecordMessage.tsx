/**
 * @contract BR-004, FR-006, UX-SGR-002
 * Displayed when evaluate_record_on_open returns blocking_validations.
 * Shows blocking reason and a "Back" button.
 */

import { Button } from '@shared/ui/button';
import { COPY } from '../types/smartgrid.types';

interface BlockedRecordMessageProps {
  readonly blockingReason: string;
  readonly onNavigateBack: () => void;
}

/** @contract BR-004 — blocked-record-message component */
export function BlockedRecordMessage({
  blockingReason,
  onNavigateBack,
}: BlockedRecordMessageProps) {
  return (
    <div role="alert" className="mx-auto mt-16 max-w-md p-8 text-center">
      <div className="mb-4 text-5xl">🚫</div>
      <h2 className="mb-2 text-xl font-semibold text-destructive">Registro bloqueado</h2>
      <p className="mb-6 text-muted-foreground">{COPY.recordBlocked(blockingReason)}</p>
      <Button variant="outline" onClick={onNavigateBack}>
        Voltar
      </Button>
    </div>
  );
}
