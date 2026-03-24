/**
 * @contract UX-SGR-001, F02, F05
 * Page: Grade de Inclusão em Massa.
 * Route: /{modulo}/{rotina}/inclusao-em-massa
 *
 * Orchestrates: SmartGridHeader, MassActionToolbar, SmartDataGrid, CloseConfirmationModal.
 * Consumes MOD-007 motor for config loading and per-line validation.
 */

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@shared/ui/skeleton';
import { Button } from '@shared/ui/button';
import type { GridRow } from '../types/smartgrid.types';
import { COPY } from '../types/smartgrid.types';
import { createEmptyRow } from '../api/smartgrid.api';
import {
  exportToJson,
  downloadJson,
  parseImportFile,
  importRowsFromEnvelope,
} from '../api/json-serializer';
import { useOperationConfig } from '../hooks/use-operation-config';
import { useBatchEvaluate } from '../hooks/use-evaluate';
import { useSaveBatch } from '../hooks/use-save';
import { isSaveEnabled, isAddLineDisabled, resetRowsToNeutral } from '../hooks/use-grid-rules';
import { SmartGridHeader } from '../components/SmartGridHeader';
import { MassActionToolbar } from '../components/MassActionToolbar';
import { SmartDataGrid } from '../components/SmartDataGrid';
import { CloseConfirmationModal } from '../components/CloseConfirmationModal';

const MAX_ROWS = 500;

interface BulkInsertPageProps {
  readonly framerId: string;
  readonly objectType: string;
  readonly operationName: string;
  readonly targetEndpoint: string;
  readonly onNavigateBack: () => void;
}

/** @contract UX-SGR-001 */
export function BulkInsertPage({
  framerId,
  objectType,
  operationName,
  targetEndpoint,
  onNavigateBack,
}: BulkInsertPageProps) {
  // ---------------------------------------------------------------------------
  // Data hooks
  // ---------------------------------------------------------------------------
  const {
    columns,
    config,
    isLoading: configLoading,
    isError: configError,
  } = useOperationConfig(framerId, objectType);
  const { validateAll, validating } = useBatchEvaluate();
  const saveBatchMutation = useSaveBatch();

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [rows, setRows] = useState<GridRow[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [showCloseModal, setShowCloseModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleAddLine = useCallback(() => {
    if (!config) return;
    const newRow = createEmptyRow(config.columns, config.defaults);
    setRows((prev) => [...prev, newRow]);
  }, [config]);

  const handleRemoveSelected = useCallback(() => {
    setRows((prev) => prev.filter((r) => !selectedRowIds.has(r._rowId)));
    setSelectedRowIds(new Set());
  }, [selectedRowIds]);

  const handleToggleSelect = useCallback((rowId: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedRowIds((prev) => {
      if (prev.size === rows.length) return new Set();
      return new Set(rows.map((r) => r._rowId));
    });
  }, [rows]);

  const handleCellChange = useCallback((rowId: string, field: string, value: unknown) => {
    setRows((prev) =>
      prev.map((r) =>
        r._rowId === rowId
          ? {
              ...r,
              data: { ...r.data, [field]: value },
              _status: 'neutral' as const,
              _validationMessages: [],
              _blockingMessages: [],
            }
          : r,
      ),
    );
  }, []);

  /** @contract BR-002, BR-003 — validate all rows (full re-validation) */
  const handleValidateAll = useCallback(async () => {
    await validateAll(framerId, objectType, rows, setRows);
  }, [framerId, objectType, rows, validateAll]);

  /** @contract FR-009 */
  const handleSave = useCallback(async () => {
    if (!isSaveEnabled(rows)) return;
    const result = await saveBatchMutation.mutateAsync({
      targetEndpoint,
      rows: rows.map((r) => r.data),
    });
    if (result.failed === 0) {
      toast.success(COPY.saveBatchSuccess(result.succeeded));
      setRows([]);
    } else {
      toast.error(COPY.saveBatchPartialError(result.succeeded, result.failed));
    }
  }, [rows, saveBatchMutation, targetEndpoint]);

  // Export/Import JSON
  const handleExportJson = useCallback(() => {
    const envelope = exportToJson(framerId, objectType, rows);
    downloadJson(envelope);
  }, [framerId, objectType, rows]);

  const handleImportJson = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const validation = await parseImportFile(file, framerId, MAX_ROWS);
      if (!validation.valid) {
        toast.error(validation.error ?? COPY.importInvalidSchema);
      } else if (validation.envelope) {
        if (!validation.sameOperation) {
          toast.warning(COPY.importDifferentOp);
        }
        const imported = importRowsFromEnvelope(validation.envelope);
        setRows(imported);
        setSelectedRowIds(new Set());
      }
      e.target.value = '';
    },
    [framerId],
  );

  // Mass actions (BR-008: reset status to neutral)
  const handleApplyValue = useCallback(
    (field: string, value: unknown) => {
      setRows((prev) => {
        const updated = prev.map((r) =>
          selectedRowIds.has(r._rowId) ? { ...r, data: { ...r.data, [field]: value } } : r,
        );
        return resetRowsToNeutral(updated, selectedRowIds);
      });
    },
    [selectedRowIds],
  );

  const handleClearColumn = useCallback(
    (field: string) => {
      setRows((prev) => {
        const updated = prev.map((r) =>
          selectedRowIds.has(r._rowId) ? { ...r, data: { ...r.data, [field]: null } } : r,
        );
        return resetRowsToNeutral(updated, selectedRowIds);
      });
    },
    [selectedRowIds],
  );

  const handleDuplicate = useCallback(
    (count: number) => {
      const sourceId = [...selectedRowIds][0];
      const source = rows.find((r) => r._rowId === sourceId);
      if (!source) return;
      const copies: GridRow[] = Array.from({ length: count }, () => ({
        _rowId: crypto.randomUUID(),
        _status: 'neutral' as const,
        _validationMessages: [],
        _blockingMessages: [],
        data: { ...source.data },
      }));
      setRows((prev) => [...prev, ...copies]);
      setSelectedRowIds(new Set());
    },
    [selectedRowIds, rows],
  );

  const _handleClose = useCallback(() => {
    if (rows.length > 0) {
      setShowCloseModal(true);
    } else {
      onNavigateBack();
    }
  }, [rows.length, onNavigateBack]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (configLoading) {
    return (
      <div className="space-y-3 p-8">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (configError) {
    return (
      <div role="alert" className="p-8 text-center">
        <p className="text-destructive">{COPY.motorLoadError}</p>
        <Button variant="outline" onClick={onNavigateBack} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div>
      <SmartGridHeader
        operationName={operationName}
        rows={rows}
        validating={validating}
        saving={saveBatchMutation.isPending}
        onImportJson={handleImportJson}
        onExportJson={handleExportJson}
        onValidateAll={handleValidateAll}
        onSave={handleSave}
      />

      <MassActionToolbar
        selectedRowIds={selectedRowIds}
        columns={columns}
        onApplyValue={handleApplyValue}
        onClearColumn={handleClearColumn}
        onDuplicate={handleDuplicate}
      />

      {rows.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          <p>{COPY.emptyState}</p>
          <Button variant="outline" onClick={handleAddLine} className="mt-4">
            Adicionar linha
          </Button>
        </div>
      ) : (
        <SmartDataGrid
          columns={columns}
          rows={rows}
          selectedRowIds={selectedRowIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onCellChange={handleCellChange}
          onAddLine={handleAddLine}
          onRemoveSelected={handleRemoveSelected}
          addLineDisabled={isAddLineDisabled(rows.length, MAX_ROWS)}
          addLineDisabledMessage={
            isAddLineDisabled(rows.length, MAX_ROWS) ? COPY.limitReached(MAX_ROWS) : undefined
          }
        />
      )}

      <CloseConfirmationModal
        open={showCloseModal}
        onExportAndExit={() => {
          handleExportJson();
          onNavigateBack();
        }}
        onExitWithoutExport={onNavigateBack}
        onCancel={() => setShowCloseModal(false)}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileSelected}
      />
    </div>
  );
}
