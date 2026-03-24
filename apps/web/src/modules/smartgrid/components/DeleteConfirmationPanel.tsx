/**
 * @contract UX-SGR-003, BR-009
 * Split view: allowed records (green) vs blocked records (red with reason).
 * Buttons: "Cancel" / "Confirm delete ({X} records)".
 */

import { Button } from '@shared/ui/button';
import type { DeleteValidationResult } from '../types/smartgrid.types';
import { COPY } from '../types/smartgrid.types';
import { isDeleteConfirmEnabled } from '../hooks/use-grid-rules';

interface DeleteConfirmationPanelProps {
  readonly results: readonly DeleteValidationResult[];
  readonly deleting: boolean;
  readonly onConfirmDelete: () => void;
  readonly onCancel: () => void;
}

/** @contract UX-SGR-003 — delete-confirmation-panel component */
export function DeleteConfirmationPanel({
  results,
  deleting,
  onConfirmDelete,
  onCancel,
}: DeleteConfirmationPanelProps) {
  const allowed = results.filter((r) => r.allowed);
  const blocked = results.filter((r) => !r.allowed);
  const confirmEnabled = isDeleteConfirmEnabled(results) && !deleting;

  return (
    <div className="p-4">
      <h3 className="mt-0 text-lg font-semibold">Resultado da verificação</h3>

      <p className="text-sm text-muted-foreground">
        {allowed.length} liberado(s) para exclusão · {blocked.length} bloqueado(s)
      </p>

      {allowed.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-green-600">Liberados</h4>
          <ul className="list-none p-0">
            {allowed.map((r) => (
              <li
                key={r.record_id}
                className="mb-1 border-l-3 border-green-500 bg-green-50 px-3 py-1.5 text-sm"
              >
                ✅ {r.display_label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {blocked.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-destructive">Bloqueados</h4>
          <ul className="list-none p-0">
            {blocked.map((r) => (
              <li
                key={r.record_id}
                className="mb-1 border-l-3 border-destructive bg-red-50 px-3 py-1.5 text-sm"
              >
                ❌ {r.display_label}
                {r.blocking_reason && (
                  <span className="ml-2 text-muted-foreground">— {r.blocking_reason}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {allowed.length === 0 && (
        <p role="alert" className="font-semibold text-destructive">
          {COPY.allBlocked}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={deleting}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={onConfirmDelete} disabled={!confirmEnabled}>
          {deleting ? 'Excluindo...' : `Confirmar exclusão (${allowed.length} registros)`}
        </Button>
      </div>
    </div>
  );
}
