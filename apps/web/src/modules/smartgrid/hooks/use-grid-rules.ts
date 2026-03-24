/**
 * @contract BR-001, BR-006, BR-007, BR-008, BR-009
 * Pure utility functions for SmartGrid UI business rules.
 * These are interface behavior rules, not domain rules (those reside in MOD-007).
 */

import type { GridRow, RowValidationStatus } from '../types/smartgrid.types';

/**
 * BR-001: Save enabled ONLY when ALL rows are ✅ (valid).
 * Neutral and blocked rows disable save.
 */
export function isSaveEnabled(rows: readonly GridRow[]): boolean {
  if (rows.length === 0) return false;
  return rows.every((r) => r._status === 'valid');
}

/** BR-006: toolbar hidden when no rows are selected */
export function isToolbarVisible(selectedRowIds: ReadonlySet<string>): boolean {
  return selectedRowIds.size > 0;
}

/** BR-007: exactly 1 row must be selected for duplicate */
export function canDuplicate(selectedRowIds: ReadonlySet<string>): boolean {
  return selectedRowIds.size === 1;
}

/** BR-007: duplicate error message */
export function getDuplicateErrorMessage(selectedCount: number): string | null {
  if (selectedCount === 1) return null;
  return 'Selecione exatamente 1 linha para duplicar.';
}

/**
 * BR-008: mass actions reset affected rows to neutral status.
 */
export function resetRowsToNeutral(
  rows: readonly GridRow[],
  affectedRowIds: ReadonlySet<string>,
): GridRow[] {
  return rows.map((row) => {
    if (!affectedRowIds.has(row._rowId)) return row;
    return {
      ...row,
      _status: 'neutral' as RowValidationStatus,
      _validationMessages: [],
      _blockingMessages: [],
    };
  });
}

/** Count rows by status for grid header counters */
export function countByStatus(rows: readonly GridRow[]): Record<RowValidationStatus, number> {
  const counts: Record<RowValidationStatus, number> = {
    neutral: 0,
    valid: 0,
    warning: 0,
    blocked: 0,
  };
  for (const row of rows) {
    counts[row._status]++;
  }
  return counts;
}

/** BR-009: confirm delete enabled when at least 1 record is allowed */
export function isDeleteConfirmEnabled(
  validationResults: ReadonlyArray<{ allowed: boolean }>,
): boolean {
  return validationResults.some((r) => r.allowed);
}

/** Validate All requires at least 1 row */
export function canValidateAll(rows: readonly GridRow[]): boolean {
  return rows.length > 0;
}

/** FR-005: add line disabled when limit reached */
export function isAddLineDisabled(currentCount: number, maxRows: number): boolean {
  return currentCount >= maxRows;
}
