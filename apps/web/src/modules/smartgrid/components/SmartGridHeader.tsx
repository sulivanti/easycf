/**
 * @contract UX-SGR-001
 * Header component for the bulk insert grid.
 * Shows operation name, row counters, and action buttons.
 */

import { Button } from '@shared/ui/button';
import { Spinner } from '@shared/ui/spinner';
import type { GridRow } from '../types/smartgrid.types';
import { countByStatus, isSaveEnabled, canValidateAll } from '../hooks/use-grid-rules';

interface SmartGridHeaderProps {
  readonly operationName: string;
  readonly rows: readonly GridRow[];
  readonly validating: boolean;
  readonly saving: boolean;
  readonly onImportJson: () => void;
  readonly onExportJson: () => void;
  readonly onValidateAll: () => void;
  readonly onSave: () => void;
}

/** @contract UX-SGR-001 — grid-header component */
export function SmartGridHeader({
  operationName,
  rows,
  validating,
  saving,
  onImportJson,
  onExportJson,
  onValidateAll,
  onSave,
}: SmartGridHeaderProps) {
  const counts = countByStatus(rows);
  const saveEnabled = isSaveEnabled(rows) && !saving && !validating;
  const validateEnabled = canValidateAll(rows) && !validating && !saving;

  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div>
        <h2 className="m-0 text-xl font-semibold">{operationName}</h2>
        <span className="text-sm text-muted-foreground">
          {rows.length} linhas
          {counts.valid > 0 && (
            <>
              {' '}
              · <span className="text-green-600">{counts.valid} válidas</span>
            </>
          )}
          {counts.blocked > 0 && (
            <>
              {' '}
              · <span className="text-destructive">{counts.blocked} erros</span>
            </>
          )}
          {counts.warning > 0 && (
            <>
              {' '}
              · <span className="text-amber-500">{counts.warning} alertas</span>
            </>
          )}
        </span>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onImportJson} disabled={validating || saving}>
          Importar JSON
        </Button>
        <Button variant="outline" size="sm" onClick={onExportJson} disabled={rows.length === 0}>
          Exportar JSON
        </Button>
        <Button variant="secondary" size="sm" onClick={onValidateAll} disabled={!validateEnabled}>
          {validating ? (
            <span className="flex items-center gap-2">
              <Spinner className="h-4 w-4" /> Validando...
            </span>
          ) : (
            'Validar Tudo'
          )}
        </Button>
        <Button size="sm" onClick={onSave} disabled={!saveEnabled}>
          {saving ? (
            <span className="flex items-center gap-2">
              <Spinner className="h-4 w-4" /> Salvando...
            </span>
          ) : (
            'Salvar'
          )}
        </Button>
      </div>
    </div>
  );
}
