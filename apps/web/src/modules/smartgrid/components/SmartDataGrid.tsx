/**
 * @contract UX-SGR-001
 * Editable data grid with checkbox selection, status column,
 * defaults, required asterisks, and domain dropdowns.
 */

import { useCallback } from 'react';
import { Button } from '@shared/ui/button';
import type { GridColumn, GridRow } from '../types/smartgrid.types';
import { STATUS_ROW_BG } from '../types/smartgrid.types';
import { RowStatusIcon } from './RowStatusIcon';

interface SmartDataGridProps {
  readonly columns: readonly GridColumn[];
  readonly rows: readonly GridRow[];
  readonly selectedRowIds: ReadonlySet<string>;
  readonly onToggleSelect: (rowId: string) => void;
  readonly onToggleSelectAll: () => void;
  readonly onCellChange: (rowId: string, field: string, value: unknown) => void;
  readonly onAddLine: () => void;
  readonly onRemoveSelected: () => void;
  readonly addLineDisabled: boolean;
  readonly addLineDisabledMessage?: string;
}

/** @contract UX-SGR-001 — data-grid component */
export function SmartDataGrid({
  columns,
  rows,
  selectedRowIds,
  onToggleSelect,
  onToggleSelectAll,
  onCellChange,
  onAddLine,
  onRemoveSelected,
  addLineDisabled,
  addLineDisabledMessage,
}: SmartDataGridProps) {
  const allSelected = rows.length > 0 && selectedRowIds.size === rows.length;
  const visibleColumns = columns.filter((c) => c.visible);

  const handleCellChange = useCallback(
    (rowId: string, field: string, value: string) => {
      onCellChange(rowId, field, value);
    },
    [onCellChange],
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-2 px-4 py-2">
        <Button variant="outline" size="sm" onClick={onAddLine} disabled={addLineDisabled}>
          + Adicionar linha
        </Button>
        {addLineDisabled && addLineDisabledMessage && (
          <span className="self-center text-sm text-amber-500">{addLineDisabledMessage}</span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onRemoveSelected}
          disabled={selectedRowIds.size === 0}
        >
          Remover selecionadas
        </Button>
      </div>

      <table role="grid" className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="w-10 p-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                aria-label="Selecionar todas as linhas"
                className="accent-primary"
              />
            </th>
            <th className="w-12 p-2 text-sm font-medium">Status</th>
            {visibleColumns.map((col) => (
              <th key={col.field} className="p-2 text-left text-sm font-medium">
                {col.label}
                {col.required && <span className="text-destructive"> *</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <GridRowComponent
              key={row._rowId}
              row={row}
              columns={visibleColumns}
              selected={selectedRowIds.has(row._rowId)}
              onToggleSelect={onToggleSelect}
              onCellChange={handleCellChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row component
// ---------------------------------------------------------------------------

interface GridRowComponentProps {
  readonly row: GridRow;
  readonly columns: readonly GridColumn[];
  readonly selected: boolean;
  readonly onToggleSelect: (rowId: string) => void;
  readonly onCellChange: (rowId: string, field: string, value: string) => void;
}

function GridRowComponent({
  row,
  columns,
  selected,
  onToggleSelect,
  onCellChange,
}: GridRowComponentProps) {
  return (
    <tr className={`border-b border-border ${STATUS_ROW_BG[row._status]}`}>
      <td className="px-2 py-1 text-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(row._rowId)}
          aria-label={`Selecionar linha ${row._rowId.slice(0, 8)}`}
          className="accent-primary"
        />
      </td>
      <td className="px-2 py-1 text-center">
        <RowStatusIcon status={row._status} />
      </td>
      {columns.map((col) => (
        <td key={col.field} className="px-2 py-1">
          {col.domainRestrictions ? (
            <select
              value={String(row.data[col.field] ?? '')}
              onChange={(e) => onCellChange(row._rowId, col.field, e.target.value)}
              aria-label={col.label}
              className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
            >
              <option value="">—</option>
              {col.domainRestrictions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={String(row.data[col.field] ?? '')}
              onChange={(e) => onCellChange(row._rowId, col.field, e.target.value)}
              aria-label={col.label}
              aria-required={col.required}
              className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
            />
          )}
        </td>
      ))}
    </tr>
  );
}
