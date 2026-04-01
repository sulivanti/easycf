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
import { EmptyState } from '@shared/ui/empty-state';
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
import { isSaveEnabled, isAddLineDisabled, resetRowsToNeutral, countByStatus } from '../hooks/use-grid-rules';
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
        <Skeleton className="h-6 w-64 bg-a1-border" />
        <Skeleton className="h-48 w-full bg-a1-border" />
      </div>
    );
  }

  if (configError) {
    return (
      <div role="alert" className="p-8 text-center">
        <p className="text-danger-600">{COPY.motorLoadError}</p>
        <Button variant="outline" onClick={onNavigateBack} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  const counts = countByStatus(rows);
  const hasBlockingErrors = counts.blocked > 0;
  const submitEnabled = isSaveEnabled(rows) && !saveBatchMutation.isPending && !validating;

  return (
    <div className="p-6" style={{ backgroundColor: '#F5F5F3', minHeight: '100%' }}>
      {/* PageHeader — UX-011-M01 D1 */}
      <SmartGridHeader
        operationName={operationName}
        rows={rows}
        validating={validating}
        saving={saveBatchMutation.isPending}
        onImportJson={handleImportJson}
        onExportJson={handleExportJson}
      />

      {/* Toolbar — UX-011-M01 D1: "+ Nova Linha" (text link blue) + "Acoes em Lote" dropdown */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddLine}
            disabled={isAddLineDisabled(rows.length, MAX_ROWS)}
            className="h-9 rounded-lg bg-transparent px-3.5 text-xs font-bold disabled:opacity-50"
            style={{ color: '#2E86C1', border: 'none' }}
          >
            + Nova Linha
          </button>
          {isAddLineDisabled(rows.length, MAX_ROWS) && (
            <span className="text-xs text-amber-500">{COPY.limitReached(MAX_ROWS)}</span>
          )}

          {/* Acoes em Lote: renders the MassActionToolbar inline when rows are selected */}
          <MassActionToolbar
            selectedRowIds={selectedRowIds}
            columns={columns}
            onApplyValue={handleApplyValue}
            onClearColumn={handleClearColumn}
            onDuplicate={handleDuplicate}
          />
        </div>

        <span className="text-xs font-normal" style={{ color: '#888888' }}>
          {rows.length} linhas
        </span>
      </div>

      {/* Grid area */}
      {rows.length === 0 ? (
        <EmptyState
          title="Nenhuma linha adicionada"
          description={COPY.emptyState}
          action={
            <Button variant="outline" onClick={handleAddLine}>
              Adicionar linha
            </Button>
          }
        />
      ) : (
        <>
          <SmartDataGrid
            columns={columns}
            rows={rows}
            selectedRowIds={selectedRowIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onCellChange={handleCellChange}
          />

          {/* GridFooter — UX-011-M01 D1: "{X} de {Y} linhas validas" + "Submeter Lote" */}
          <div
            className="flex items-center justify-between rounded-b-xl border border-t-0 px-4"
            style={{
              height: 52,
              backgroundColor: '#FAFAFA',
              borderColor: '#E8E8E6',
              borderTopColor: '#F0F0EE',
            }}
          >
            <span className="text-[13px] font-medium" style={{ color: '#555555' }}>
              {counts.valid} de {rows.length} linhas válidas
            </span>

            <button
              type="button"
              onClick={handleSave}
              disabled={!submitEnabled}
              className="h-10 rounded-lg px-5 text-[13px] font-bold text-white"
              style={{
                backgroundColor: submitEnabled ? '#2E86C1' : '#E8E8E6',
                color: submitEnabled ? '#FFFFFF' : '#CCCCCC',
                cursor: submitEnabled ? 'pointer' : 'not-allowed',
              }}
            >
              {saveBatchMutation.isPending ? 'Submetendo...' : 'Submeter Lote'}
            </button>
          </div>
        </>
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
