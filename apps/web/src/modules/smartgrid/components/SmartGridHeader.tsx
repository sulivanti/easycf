/**
 * @contract UX-SGR-001, UX-011-M01 D1
 * PageHeader for the bulk insert grid.
 * Left: "Grade de Inclusao em Massa" + "Operacao: {nome}".
 * Right: Import/Export JSON buttons (secondary style).
 */

import { Button } from '@shared/ui/button';
import type { GridRow } from '../types/smartgrid.types';

interface SmartGridHeaderProps {
  readonly operationName: string;
  readonly rows: readonly GridRow[];
  readonly validating: boolean;
  readonly saving: boolean;
  readonly onImportJson: () => void;
  readonly onExportJson: () => void;
}

/** @contract UX-SGR-001, UX-011-M01 D1 — PageHeader */
export function SmartGridHeader({
  operationName,
  rows,
  validating,
  saving,
  onImportJson,
  onExportJson,
}: SmartGridHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="m-0 text-2xl font-extrabold" style={{ color: '#111111' }}>
          Grade de Inclusão em Massa
        </h2>
        <p className="mt-1 text-[13px] font-normal" style={{ color: '#888888' }}>
          Operação: {operationName}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onImportJson}
          disabled={validating || saving}
          className="h-9 rounded-lg border px-3.5 text-xs font-semibold"
          style={{ borderColor: '#E8E8E6', color: '#555555' }}
        >
          Import JSON
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportJson}
          disabled={rows.length === 0}
          className="h-9 rounded-lg border px-3.5 text-xs font-semibold"
          style={{ borderColor: '#E8E8E6', color: '#555555' }}
        >
          Export JSON
        </Button>
      </div>
    </div>
  );
}
