/**
 * @contract BR-006, BR-007, BR-008
 * Bulk action toolbar — hidden when no rows selected (BR-006).
 * Actions: Apply value, Clear column, Duplicate (1 row only).
 */

import { useState } from 'react';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import type { GridColumn } from '../types/smartgrid.types';
import { canDuplicate, getDuplicateErrorMessage } from '../hooks/use-grid-rules';

interface MassActionToolbarProps {
  readonly selectedRowIds: ReadonlySet<string>;
  readonly columns: readonly GridColumn[];
  readonly onApplyValue: (field: string, value: unknown) => void;
  readonly onClearColumn: (field: string) => void;
  readonly onDuplicate: (count: number) => void;
}

/** @contract BR-006 — toolbar hidden when selectedRowIds is empty */
export function MassActionToolbar({
  selectedRowIds,
  columns,
  onApplyValue,
  onClearColumn,
  onDuplicate,
}: MassActionToolbarProps) {
  const [selectedField, setSelectedField] = useState('');
  const [applyValueInput, setApplyValueInput] = useState('');
  const [duplicateCount, setDuplicateCount] = useState(1);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // BR-006: completely hidden when no selection
  if (selectedRowIds.size === 0) return null;

  const editableColumns = columns.filter((c) => !c.readonly);

  const handleApplyValue = () => {
    if (!selectedField || !applyValueInput) return;
    onApplyValue(selectedField, applyValueInput);
    setApplyValueInput('');
  };

  const handleClearColumn = () => {
    if (!selectedField) return;
    onClearColumn(selectedField);
  };

  const handleDuplicate = () => {
    const errMsg = getDuplicateErrorMessage(selectedRowIds.size);
    if (errMsg) {
      setDuplicateError(errMsg);
      return;
    }
    setDuplicateError(null);
    onDuplicate(duplicateCount);
  };

  return (
    <div
      role="toolbar"
      aria-label="Ações em massa"
      className="flex items-center gap-3 border-b border-sky-200 bg-sky-50 px-4 py-2"
    >
      <span className="text-sm font-semibold">{selectedRowIds.size} selecionada(s)</span>

      <select
        value={selectedField}
        onChange={(e) => setSelectedField(e.target.value)}
        aria-label="Selecionar coluna"
        className="rounded-md border border-input bg-background px-2 py-1 text-sm"
      >
        <option value="">Coluna...</option>
        {editableColumns.map((c) => (
          <option key={c.field} value={c.field}>
            {c.label}
          </option>
        ))}
      </select>

      <Input
        value={applyValueInput}
        onChange={(e) => setApplyValueInput(e.target.value)}
        placeholder="Valor..."
        aria-label="Valor para aplicar"
        className="w-40"
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={handleApplyValue}
        disabled={!selectedField || !applyValueInput}
      >
        Aplicar valor
      </Button>

      <Button variant="secondary" size="sm" onClick={handleClearColumn} disabled={!selectedField}>
        Limpar coluna
      </Button>

      <span className="h-6 border-l border-sky-200" />

      <Input
        type="number"
        min={1}
        max={100}
        value={duplicateCount}
        onChange={(e) => setDuplicateCount(Math.max(1, Number(e.target.value)))}
        aria-label="Quantidade de cópias"
        className="w-16"
        disabled={!canDuplicate(selectedRowIds)}
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={handleDuplicate}
        disabled={!canDuplicate(selectedRowIds)}
      >
        Duplicar item
      </Button>

      {duplicateError && (
        <span role="alert" className="text-sm text-destructive">
          {duplicateError}
        </span>
      )}
    </div>
  );
}
