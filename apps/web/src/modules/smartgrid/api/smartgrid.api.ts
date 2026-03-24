/**
 * @contract FR-002, FR-003, FR-006, FR-007, FR-009, BR-002, BR-003, DATA-011
 * HTTP client functions, mappers, and motor evaluator for MOD-011 SmartGrid.
 * All API calls target MOD-007 routine engine or dynamic module endpoints.
 */

import type {
  EvaluateRequest,
  EvaluateResponse,
  GridColumn,
  GridRow,
  OperationConfig,
  SaveBatchResult,
  SaveBatchError,
  DeleteBatchResult,
  DeleteRecordResult,
  DeleteValidationResult,
  BatchEvaluationResult,
} from '../types/smartgrid.types';

const EVALUATE_URL = '/api/v1/routine-engine/evaluate';
const DEFAULT_CONCURRENCY = 5;

// ---------------------------------------------------------------------------
// HTTP client helper
// ---------------------------------------------------------------------------

async function httpJson<T>(url: string, init?: RequestInit, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-correlation-id': crypto.randomUUID(),
      ...(init?.headers ?? {}),
    },
    signal,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.detail ?? res.statusText), {
      status: res.status,
      correlation_id: res.headers.get('x-correlation-id'),
      body,
    });
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Motor evaluate — single (BR-002)
// ---------------------------------------------------------------------------

/** @contract BR-002 — motor called 1 object at a time */
export async function evaluateSingle(
  framerId: string,
  objectType: string,
  rowData: Record<string, unknown>,
  currentRecordState?: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<EvaluateResponse> {
  const req: EvaluateRequest = {
    framer_id: framerId,
    object_type: objectType,
    data: rowData,
    ...(currentRecordState ? { current_record_state: currentRecordState } : {}),
  };
  return httpJson<EvaluateResponse>(
    EVALUATE_URL,
    { method: 'POST', body: JSON.stringify(req) },
    signal,
  );
}

// ---------------------------------------------------------------------------
// Motor evaluate — batch with throttling (BR-003)
// ---------------------------------------------------------------------------

/**
 * Evaluate all rows in a throttled batch (BR-003: always full re-validation).
 * @contract BR-002, BR-003
 */
export async function evaluateBatch(
  framerId: string,
  objectType: string,
  rows: readonly GridRow[],
  onRowResult: (result: BatchEvaluationResult) => void,
  concurrency = DEFAULT_CONCURRENCY,
  signal?: AbortSignal,
): Promise<BatchEvaluationResult[]> {
  const results: BatchEvaluationResult[] = [];
  const queue = [...rows];
  const active: Promise<void>[] = [];

  async function processNext(): Promise<void> {
    while (queue.length > 0) {
      if (signal?.aborted) return;
      const row = queue.shift()!;
      try {
        const response = await evaluateSingle(framerId, objectType, row.data, undefined, signal);
        const result: BatchEvaluationResult = { rowId: row._rowId, response };
        results.push(result);
        onRowResult(result);
      } catch (err) {
        if (signal?.aborted) return;
        const error = err instanceof Error ? err : new Error(String(err));
        const result: BatchEvaluationResult = { rowId: row._rowId, error };
        results.push(result);
        onRowResult(result);
      }
    }
  }

  for (let i = 0; i < Math.min(concurrency, rows.length); i++) {
    active.push(processNext());
  }
  await Promise.all(active);
  return results;
}

// ---------------------------------------------------------------------------
// Load operation config (FR-002)
// ---------------------------------------------------------------------------

/** @contract FR-002 — load operation config via motor evaluation */
export async function loadOperationConfig(
  framerId: string,
  objectType: string,
  signal?: AbortSignal,
): Promise<EvaluateResponse> {
  return httpJson<EvaluateResponse>(
    EVALUATE_URL,
    {
      method: 'POST',
      body: JSON.stringify({ framer_id: framerId, object_type: objectType, data: {} }),
    },
    signal,
  );
}

// ---------------------------------------------------------------------------
// Save batch (FR-009)
// ---------------------------------------------------------------------------

/** @contract FR-009 — save validated rows to target module endpoint */
export async function saveBatch(
  targetEndpoint: string,
  rows: Record<string, unknown>[],
): Promise<SaveBatchResult> {
  const errors: SaveBatchError[] = [];
  let succeeded = 0;

  for (let i = 0; i < rows.length; i++) {
    try {
      await httpJson(targetEndpoint, { method: 'POST', body: JSON.stringify(rows[i]) });
      succeeded++;
    } catch (err) {
      const e = err as Error & { correlation_id?: string };
      errors.push({ rowIndex: i, message: e.message, correlation_id: e.correlation_id });
    }
  }

  return { total: rows.length, succeeded, failed: errors.length, errors };
}

// ---------------------------------------------------------------------------
// Save changes — single record (FR-006)
// ---------------------------------------------------------------------------

/** @contract FR-006 — save single record changes */
export async function saveChanges(
  targetEndpoint: string,
  recordId: string,
  changes: Record<string, unknown>,
): Promise<void> {
  await httpJson(`${targetEndpoint}/${recordId}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

// ---------------------------------------------------------------------------
// Validate for delete (FR-007)
// ---------------------------------------------------------------------------

/** @contract FR-007, BR-009 — validate each record for soft-delete eligibility */
export async function validateForDelete(
  framerId: string,
  objectType: string,
  records: Array<{ id: string; displayLabel: string; currentState: Record<string, unknown> }>,
): Promise<DeleteValidationResult[]> {
  const results: DeleteValidationResult[] = [];

  for (const record of records) {
    try {
      const res = await httpJson<EvaluateResponse>(EVALUATE_URL, {
        method: 'POST',
        body: JSON.stringify({
          framer_id: framerId,
          object_type: objectType,
          object_id: record.id,
          current_record_state: record.currentState,
          data: record.currentState,
        }),
      });
      results.push({
        record_id: record.id,
        display_label: record.displayLabel,
        allowed: res.blocking_validations.length === 0,
        blocking_reason: res.blocking_validations[0]?.message,
      });
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      results.push({
        record_id: record.id,
        display_label: record.displayLabel,
        allowed: false,
        blocking_reason: e.message,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Delete batch (FR-007, BR-009)
// ---------------------------------------------------------------------------

/** @contract FR-007, BR-009 — soft-delete allowed records */
export async function deleteBatch(
  targetEndpoint: string,
  recordIds: string[],
): Promise<DeleteBatchResult> {
  const results: DeleteRecordResult[] = [];
  let succeeded = 0;

  for (const id of recordIds) {
    try {
      await httpJson(`${targetEndpoint}/${id}`, { method: 'DELETE' });
      results.push({ record_id: id, success: true });
      succeeded++;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      results.push({ record_id: id, success: false, error: e.message });
    }
  }

  return { total: recordIds.length, succeeded, failed: recordIds.length - succeeded, results };
}

// ---------------------------------------------------------------------------
// Mappers — @contract DATA-011 §3
// ---------------------------------------------------------------------------

/** Derive grid column definitions from motor evaluate response */
export function mapResponseToColumns(res: EvaluateResponse): GridColumn[] {
  const requiredSet = new Set(res.required_fields);
  const hiddenSet = new Set(res.hidden_fields);

  return res.visible_fields
    .filter((field) => !hiddenSet.has(field))
    .map((field) => ({
      field,
      label: formatFieldLabel(field),
      required: requiredSet.has(field),
      defaultValue: res.defaults[field],
      domainRestrictions: res.domain_restrictions[field],
      visible: true,
    }));
}

/** Build OperationConfig from motor response — @contract FR-002 */
export function mapResponseToOperationConfig(
  framerId: string,
  objectType: string,
  res: EvaluateResponse,
): OperationConfig {
  return {
    framer_id: framerId,
    object_type: objectType,
    columns: mapResponseToColumns(res),
    defaults: res.defaults,
  };
}

/** Create a new empty grid row with defaults — @contract UX-SGR-001 */
export function createEmptyRow(columns: GridColumn[], defaults: Record<string, unknown>): GridRow {
  const data: Record<string, unknown> = {};
  for (const col of columns) {
    data[col.field] = col.defaultValue ?? defaults[col.field] ?? null;
  }
  return {
    _rowId: crypto.randomUUID(),
    _status: 'neutral',
    _validationMessages: [],
    _blockingMessages: [],
    data,
  };
}

/** Merge motor evaluate response into a grid row — @contract DATA-011 §3, FR-003 */
export function applyEvaluationToRow(row: GridRow, res: EvaluateResponse): GridRow {
  if (res.blocking_validations.length > 0) {
    return {
      ...row,
      _status: 'blocked',
      _blockingMessages: res.blocking_validations,
      _validationMessages: res.validations,
    };
  }
  if (res.validations.length > 0) {
    return {
      ...row,
      _status: 'warning',
      _blockingMessages: [],
      _validationMessages: res.validations,
    };
  }
  return { ...row, _status: 'valid', _blockingMessages: [], _validationMessages: [] };
}

/** Derive column definitions for edit form including readonly state — @contract BR-005, FR-006 */
export function mapResponseToEditColumns(res: EvaluateResponse): GridColumn[] {
  const requiredSet = new Set(res.required_fields);
  const hiddenSet = new Set(res.hidden_fields);

  return res.visible_fields.map((field) => ({
    field,
    label: formatFieldLabel(field),
    required: requiredSet.has(field),
    defaultValue: res.defaults[field],
    domainRestrictions: res.domain_restrictions[field],
    visible: !hiddenSet.has(field),
    readonly: false,
  }));
}

/** Resolve row visual status from motor response — @contract DATA-011 §3 */
export function resolveRowStatus(res: EvaluateResponse): 'blocked' | 'warning' | 'valid' {
  if (res.blocking_validations.length > 0) return 'blocked';
  if (res.validations.length > 0) return 'warning';
  return 'valid';
}

function formatFieldLabel(field: string): string {
  return field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
