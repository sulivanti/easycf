/**
 * @contract UX-SGR-001
 * Editable data grid with checkbox selection, status column,
 * defaults, required asterisks, and domain dropdowns.
 */

import { useCallback } from 'react';
import type { GridColumn, GridRow } from '../types/smartgrid.types';
import { STATUS_ROW_BG, STATUS_BORDER_LEFT_COLOR } from '../types/smartgrid.types';
import { RowStatusIcon } from './RowStatusIcon';

interface SmartDataGridProps {
  readonly columns: readonly GridColumn[];
  readonly rows: readonly GridRow[];
  readonly selectedRowIds: ReadonlySet<string>;
  readonly onToggleSelect: (rowId: string) => void;
  readonly onToggleSelectAll: () => void;
  readonly onCellChange: (rowId: string, field: string, value: unknown) => void;
}

/** @contract UX-SGR-001, UX-011-M01 D1 — data-grid component */
export function SmartDataGrid({
  columns,
  rows,
  selectedRowIds,
  onToggleSelect,
  onToggleSelectAll,
  onCellChange,
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
    <div className="mt-3 overflow-hidden rounded-xl border bg-white" style={{ borderColor: '#E8E8E6' }}>
      <table role="grid" className="w-full border-collapse">
        <thead>
          <tr
            className="border-b"
            style={{ height: 44, backgroundColor: '#FAFAFA', borderColor: '#F0F0EE' }}
          >
            <th className="w-9 px-4 py-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                aria-label="Selecionar todas as linhas"
                className="h-[18px] w-[18px] rounded accent-primary"
              />
            </th>
            <th className="w-10 px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: '#888888' }} />
            {visibleColumns.map((col) => (
              <th
                key={col.field}
                className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider"
                style={{ color: '#888888', letterSpacing: '0.8px' }}
              >
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

/** @contract UX-011-M01 D1, D9 — row with border-left status indicator + cell states */
function GridRowComponent({
  row,
  columns,
  selected,
  onToggleSelect,
  onCellChange,
}: GridRowComponentProps) {
  const borderColor = STATUS_BORDER_LEFT_COLOR[row._status];

  // Build a set of fields that have warnings or blocking errors for cell-level coloring
  const warningFields = new Set(row._validationMessages.map((v) => v.field));
  const errorFields = new Set(row._blockingMessages.map((v) => v.field));

  return (
    <tr
      className={`border-b ${STATUS_ROW_BG[row._status]}`}
      style={{
        height: 48,
        borderColor: '#F0F0EE',
        borderLeftWidth: 3,
        borderLeftStyle: 'solid',
        borderLeftColor: borderColor,
      }}
    >
      <td className="px-4 py-1 text-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(row._rowId)}
          aria-label={`Selecionar linha ${row._rowId.slice(0, 8)}`}
          className="h-[18px] w-[18px] rounded accent-primary"
        />
      </td>
      <td className="px-2 py-1 text-center">
        <RowStatusIcon status={row._status} />
      </td>
      {columns.map((col) => {
        // Cell-level background per UX-011-M01 D1: alert → amber-50, error → red-50
        const hasError = errorFields.has(col.field);
        const hasWarning = !hasError && warningFields.has(col.field);
        const cellBg = hasError ? 'bg-red-50' : hasWarning ? 'bg-amber-50' : '';

        return (
          <td key={col.field} className={`px-4 py-1 ${cellBg}`}>
            {col.domainRestrictions ? (
              <select
                value={String(row.data[col.field] ?? '')}
                onChange={(e) => onCellChange(row._rowId, col.field, e.target.value)}
                aria-label={col.label}
                className="w-full rounded-md border border-input bg-background px-2 py-1 text-[13px] font-medium focus:border-transparent focus:outline-none focus:ring-2"
                style={{ color: '#111111' }}
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
                className="w-full rounded-md border border-input bg-background px-2 py-1 text-[13px] font-medium focus:border-transparent focus:outline-none"
                style={{
                  color: '#111111',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '2px solid #2E86C1';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '';
                  e.currentTarget.classList.add('border', 'border-input');
                }}
              />
            )}
          </td>
        );
      })}
    </tr>
  );
}
