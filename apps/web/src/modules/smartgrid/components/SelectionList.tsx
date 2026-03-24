/**
 * @contract UX-SGR-003
 * List of records selected for bulk deletion.
 * Shows each record with a label and a "Verify" button to validate all.
 */

import { Button } from '@shared/ui/button';
import { Spinner } from '@shared/ui/spinner';

interface SelectionListRecord {
  readonly id: string;
  readonly displayLabel: string;
}

interface SelectionListProps {
  readonly records: readonly SelectionListRecord[];
  readonly verifying: boolean;
  readonly onVerify: () => void;
}

/** @contract UX-SGR-003 — selection-list component */
export function SelectionList({ records, verifying, onVerify }: SelectionListProps) {
  return (
    <div className="p-4">
      <h3 className="mt-0 text-lg font-semibold">
        Registros selecionados para exclusão ({records.length})
      </h3>

      <ul className="my-4 list-none p-0">
        {records.map((rec) => (
          <li key={rec.id} className="border-b border-border px-3 py-2 text-sm">
            {rec.displayLabel}
            <span className="ml-2 text-muted-foreground">({rec.id})</span>
          </li>
        ))}
      </ul>

      <Button onClick={onVerify} disabled={verifying || records.length === 0}>
        {verifying ? (
          <span className="flex items-center gap-2">
            <Spinner className="h-4 w-4" /> Verificando...
          </span>
        ) : (
          'Verificar'
        )}
      </Button>
    </div>
  );
}
