/**
 * @contract DATA-011, FR-011, UX-011, BR-001..BR-010
 * Types, interfaces, status constants, and copy strings for MOD-011 SmartGrid.
 * MOD-011 is a pure UX consumer of MOD-007 routine engine.
 */

// ---------------------------------------------------------------------------
// Row validation status (visual state per row)
// ---------------------------------------------------------------------------

export type RowValidationStatus = 'neutral' | 'valid' | 'warning' | 'blocked';

// ---------------------------------------------------------------------------
// Motor evaluate request/response (consumed from MOD-007)
// ---------------------------------------------------------------------------

/** @contract FR-001, DATA-011 §3 */
export interface EvaluateRequest {
  readonly framer_id: string;
  readonly object_type: string;
  readonly object_id?: string;
  readonly current_record_state?: Record<string, unknown>;
  readonly data: Record<string, unknown>;
}

/** @contract DATA-011 §3.1 */
export interface EvaluateResponse {
  readonly visible_fields: string[];
  readonly hidden_fields: string[];
  readonly required_fields: string[];
  readonly optional_fields: string[];
  readonly defaults: Record<string, unknown>;
  readonly domain_restrictions: Record<string, string[]>;
  readonly validations: ValidationItem[];
  readonly blocking_validations: ValidationItem[];
  readonly applied_routines: AppliedRoutine[];
}

export interface ValidationItem {
  readonly field: string;
  readonly message: string;
  readonly rule_id?: string;
}

export interface AppliedRoutine {
  readonly routine_id: string;
  readonly routine_name: string;
  readonly items_applied: number;
}

// ---------------------------------------------------------------------------
// Grid row model (client-side state for UX-SGR-001)
// ---------------------------------------------------------------------------

/** @contract UX-SGR-001, BR-001 */
export interface GridRow {
  readonly _rowId: string;
  readonly _status: RowValidationStatus;
  readonly _validationMessages: ValidationItem[];
  readonly _blockingMessages: ValidationItem[];
  data: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Grid column definition (derived from motor response)
// ---------------------------------------------------------------------------

/** @contract DATA-011 §3 */
export interface GridColumn {
  readonly field: string;
  readonly label: string;
  readonly required: boolean;
  readonly defaultValue?: unknown;
  readonly domainRestrictions?: string[];
  readonly visible: boolean;
  readonly readonly?: boolean;
}

// ---------------------------------------------------------------------------
// Export/import JSON envelope (client-side persistence)
// ---------------------------------------------------------------------------

/** @contract FR-004, SEC-011 §7 */
export interface SmartGridExportEnvelope {
  readonly version: '1.0';
  readonly framer_id: string;
  readonly object_type: string;
  readonly exported_at: string;
  readonly rows: GridRowExport[];
}

export interface GridRowExport {
  readonly data: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Save batch request/response (for UX-SGR-001 bulk create)
// ---------------------------------------------------------------------------

/** @contract FR-009 */
export interface SaveBatchResult {
  readonly total: number;
  readonly succeeded: number;
  readonly failed: number;
  readonly errors: SaveBatchError[];
}

export interface SaveBatchError {
  readonly rowIndex: number;
  readonly message: string;
  readonly correlation_id?: string;
}

// ---------------------------------------------------------------------------
// Delete validation result (for UX-SGR-003)
// ---------------------------------------------------------------------------

/** @contract FR-007, UX-SGR-003 */
export interface DeleteValidationResult {
  readonly record_id: string;
  readonly display_label: string;
  readonly allowed: boolean;
  readonly blocking_reason?: string;
}

/** @contract FR-007, BR-009 */
export interface DeleteBatchResult {
  readonly total: number;
  readonly succeeded: number;
  readonly failed: number;
  readonly results: DeleteRecordResult[];
}

export interface DeleteRecordResult {
  readonly record_id: string;
  readonly success: boolean;
  readonly error?: string;
}

// ---------------------------------------------------------------------------
// Operation config (loaded on mount from motor)
// ---------------------------------------------------------------------------

/** @contract FR-002 */
export interface OperationConfig {
  readonly framer_id: string;
  readonly object_type: string;
  readonly columns: GridColumn[];
  readonly defaults: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Screen route params
// ---------------------------------------------------------------------------

export interface BulkInsertRouteParams {
  readonly modulo: string;
  readonly rotina: string;
}

export interface RecordEditRouteParams {
  readonly modulo: string;
  readonly rotina: string;
  readonly id: string;
}

/** @contract UX-SGR-002 — metadata sidebar data */
export interface RecordMetadata {
  readonly status?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly framerId?: string;
  readonly framerLabel?: string;
}

export interface BulkDeleteRouteParams {
  readonly modulo: string;
  readonly rotina: string;
}

// ---------------------------------------------------------------------------
// Batch evaluation result (for motor-evaluator)
// ---------------------------------------------------------------------------

export interface BatchEvaluationResult {
  readonly rowId: string;
  readonly response?: EvaluateResponse;
  readonly error?: Error;
}

// ---------------------------------------------------------------------------
// Import validation result
// ---------------------------------------------------------------------------

export interface ImportValidation {
  readonly valid: boolean;
  readonly error?: string;
  readonly envelope?: SmartGridExportEnvelope;
  readonly sameOperation: boolean;
}

// ---------------------------------------------------------------------------
// Status visual mapping — @contract UX-011
// ---------------------------------------------------------------------------

/** Status → visual emoji */
export const STATUS_ICON: Record<RowValidationStatus, string> = {
  neutral: '',
  valid: '\u2705',
  warning: '\u26A0\uFE0F',
  blocked: '\u274C',
};

/** Status → aria-label for accessibility */
export const STATUS_ARIA_LABEL: Record<RowValidationStatus, string> = {
  neutral: 'Linha sem avaliação',
  valid: 'Linha válida',
  warning: 'Linha com alerta',
  blocked: 'Linha com erro bloqueante',
};

/** Status → Tailwind text color class */
export const STATUS_COLOR_CLASS: Record<RowValidationStatus, string> = {
  neutral: 'text-muted-foreground',
  valid: 'text-green-500',
  warning: 'text-amber-500',
  blocked: 'text-destructive',
};

/** Status → Tailwind background class for rows */
export const STATUS_ROW_BG: Record<RowValidationStatus, string> = {
  neutral: '',
  valid: 'bg-green-50',
  warning: 'bg-amber-50',
  blocked: 'bg-red-50',
};

/** Status → border-left inline style color (3px solid) — @contract UX-011-M01 D9 */
export const STATUS_BORDER_LEFT_COLOR: Record<RowValidationStatus, string> = {
  neutral: 'transparent',
  valid: '#27AE60',
  warning: '#F39C12',
  blocked: '#E74C3C',
};

/** Status → cell background class for alert/error cells — @contract UX-011-M01 D1 */
export const CELL_ALERT_BG = 'bg-amber-50';
export const CELL_ERROR_BG = 'bg-red-50';

// ---------------------------------------------------------------------------
// Copy strings (pt-BR) — centralized for i18n readiness
// @contract UX-011
// ---------------------------------------------------------------------------

export const COPY = {
  // UX-SGR-001 — Bulk Insert
  saveBatchSuccess: (n: number) => `${n} registros incluídos com sucesso.`,
  saveBatchPartialError: (ok: number, fail: number) =>
    `${fail} de ${ok + fail} registros falharam. Verifique os erros e tente novamente.`,
  motorLoadError: 'Não foi possível carregar a configuração da Operação.',
  validateLineError: 'Erro ao validar linha.',
  emptyState: "Nenhuma linha adicionada. Clique em 'Adicionar linha' para começar.",
  limitReached: (max: number) => `Limite máximo de ${max} linhas atingido.`,
  closeModalTitle: 'Você possui dados não salvos. Deseja exportar antes de sair?',
  importDifferentOp:
    'O arquivo importado foi gerado para outra Operação. Os dados serão carregados, mas devem ser revalidados.',
  importInvalidSchema: 'O arquivo selecionado não é um JSON válido do SmartGrid.',
  importOverLimit: (n: number, max: number) =>
    `O arquivo contém ${n} linhas, excedendo o limite de ${max}.`,

  // UX-SGR-002 — Record Edit
  saveChangesSuccess: 'Registro alterado com sucesso.',
  saveChangesError: 'Não foi possível salvar as alterações.',
  evaluateRecordError: 'Não foi possível verificar o registro.',
  validateChangesError: 'Não foi possível validar as alterações.',
  recordBlocked: (reason: string) => `Este registro não pode ser editado. Motivo: ${reason}`,
  fieldReadonlyTooltip: 'Este campo não pode ser editado para o status atual do registro.',

  // UX-SGR-003 — Bulk Delete
  deleteSuccess: (n: number) => `${n} registros excluídos com sucesso.`,
  deletePartial: (ok: number, fail: number) => `${ok} registros excluídos. ${fail} falharam.`,
  validateDeleteError: 'Não foi possível verificar o registro.',
  deleteError: 'Não foi possível excluir os registros.',
  allBlocked: 'Nenhum registro pode ser excluído no status atual.',
  recordBlockedDelete: (reason: string) => `Registro bloqueado: ${reason}`,
  alreadyDeleted: 'Registro já foi excluído anteriormente.',
  deleteConfirmation: (n: number) =>
    `Você está prestes a excluir ${n} registros. Esta ação é irreversível. Deseja continuar?`,

  // Common
  duplicateError: 'Selecione exatamente 1 linha para duplicar.',
} as const;
