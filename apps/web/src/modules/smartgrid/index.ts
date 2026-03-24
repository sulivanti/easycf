/**
 * @contract MOD-011 — SmartGrid: Componente de Grade com Edição em Massa
 * Barrel export for the smartgrid web module (Pattern A).
 */

// Types
export type {
  GridRow,
  GridColumn,
  RowValidationStatus,
  EvaluateRequest,
  EvaluateResponse,
  OperationConfig,
  SmartGridExportEnvelope,
  SaveBatchResult,
  DeleteValidationResult,
  DeleteBatchResult,
  BatchEvaluationResult,
  ImportValidation,
  BulkInsertRouteParams,
  RecordEditRouteParams,
  BulkDeleteRouteParams,
} from './types/smartgrid.types';

export {
  STATUS_ICON,
  STATUS_ARIA_LABEL,
  STATUS_COLOR_CLASS,
  STATUS_ROW_BG,
  COPY,
} from './types/smartgrid.types';

// API
export {
  evaluateSingle,
  evaluateBatch,
  loadOperationConfig,
  saveBatch,
  saveChanges,
  validateForDelete,
  deleteBatch,
  mapResponseToColumns,
  mapResponseToOperationConfig,
  createEmptyRow,
  applyEvaluationToRow,
  mapResponseToEditColumns,
  resolveRowStatus,
} from './api/smartgrid.api';

export {
  exportToJson,
  downloadJson,
  parseImportFile,
  importRowsFromEnvelope,
} from './api/json-serializer';

// Hooks
export { useOperationConfig } from './hooks/use-operation-config';
export { useEvaluateMotor, useBatchEvaluate } from './hooks/use-evaluate';
export { useSaveBatch, useSaveChanges } from './hooks/use-save';
export { useValidateForDelete, useDeleteBatch } from './hooks/use-delete';
export {
  isSaveEnabled,
  isToolbarVisible,
  canDuplicate,
  countByStatus,
  resetRowsToNeutral,
  isDeleteConfirmEnabled,
  canValidateAll,
  isAddLineDisabled,
} from './hooks/use-grid-rules';

// Pages
export { BulkInsertPage } from './pages/BulkInsertPage';
export { RecordEditPage } from './pages/RecordEditPage';
export { BulkDeletePage } from './pages/BulkDeletePage';

// Components (for composition)
export { SmartGridHeader } from './components/SmartGridHeader';
export { MassActionToolbar } from './components/MassActionToolbar';
export { SmartDataGrid } from './components/SmartDataGrid';
export { RowStatusIcon } from './components/RowStatusIcon';
export { CloseConfirmationModal } from './components/CloseConfirmationModal';
export { BlockedRecordMessage } from './components/BlockedRecordMessage';
export { SelectionList } from './components/SelectionList';
export { DeleteConfirmationPanel } from './components/DeleteConfirmationPanel';
export { DeleteResultFeedback } from './components/DeleteResultFeedback';
export { SmartEditForm } from './components/SmartEditForm';
