/**
 * @contract UX-SGR-002, BR-005, UX-011-M01 D2
 * Dynamic edit form for a single record.
 * FormCard layout: title, 2-col FieldGrid, readonly fields with LockIcon,
 * ValidationResults panel, FormFooter with Cancelar/Salvar.
 */

import { useState } from 'react';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shared/ui/tooltip';
import { Spinner } from '@shared/ui/spinner';
import type { GridColumn, ValidationItem } from '../types/smartgrid.types';
import { COPY } from '../types/smartgrid.types';

// ---------------------------------------------------------------------------
// LockIcon SVG (14x14, stroke #AAA) — @contract UX-011-M01 D2/D8
// ---------------------------------------------------------------------------

function LockIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#AAAAAA"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SmartEditFormProps {
  readonly columns: readonly GridColumn[];
  readonly initialValues: Record<string, unknown>;
  readonly blockedFields: ReadonlySet<string>;
  readonly validationErrors: readonly ValidationItem[];
  readonly validateLoading: boolean;
  readonly saveLoading: boolean;
  readonly saveEnabled: boolean;
  readonly recordCode?: string;
  readonly onValidate: (values: Record<string, unknown>) => void;
  readonly onSave: (values: Record<string, unknown>) => void;
  readonly onCancel: () => void;
}

/** @contract UX-SGR-002, UX-011-M01 D2 — edit-form component */
export function SmartEditForm({
  columns,
  initialValues,
  blockedFields,
  validationErrors,
  validateLoading,
  saveLoading,
  saveEnabled,
  recordCode,
  onValidate,
  onSave,
  onCancel,
}: SmartEditFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>({ ...initialValues });

  const handleChange = (field: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const visibleColumns = columns.filter((c) => c.visible);
  const errorMap = new Map(validationErrors.map((v) => [v.field, v.message]));

  // Contadores para o SummaryRow
  const alertCount = validationErrors.filter((v) => !v.rule_id || !errorMap.has(v.field)).length;
  const blockingCount = validationErrors.filter((v) => errorMap.has(v.field)).length;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(values);
      }}
      className="rounded-xl border border-[#E8E8E6] bg-white p-6"
    >
      {/* FormTitle — @contract UX-011-M01 D2 */}
      <h2 className="text-lg font-bold text-[#111111]">
        Alterar Registro {recordCode ? `\u2014 ${recordCode}` : ''}
      </h2>

      {/* FieldGrid — 2 columns, gap 16px — @contract UX-011-M01 D2 */}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {visibleColumns.map((col) => {
          const isBlocked = blockedFields.has(col.field);
          const fieldError = errorMap.get(col.field);
          const fieldId = `field-${col.field}`;
          const errorId = `error-${col.field}`;

          return (
            <div key={col.field}>
              <Label
                htmlFor={fieldId}
                className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#888888]"
              >
                {col.label}
                {col.required && <span className="text-destructive"> *</span>}
              </Label>

              {isBlocked ? (
                /* ReadOnlyField — @contract UX-011-M01 D2/D8 */
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex h-[42px] w-full items-center justify-between rounded-lg border border-[#F0F0EE] bg-[#F8F8F6] px-3.5 py-2.5"
                        aria-label={COPY.fieldReadonlyTooltip}
                      >
                        <span className="truncate text-sm font-medium text-[#888888]">
                          {String(values[col.field] ?? '')}
                        </span>
                        <LockIcon className="ml-2 flex-shrink-0" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{COPY.fieldReadonlyTooltip}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : col.domainRestrictions ? (
                <select
                  id={fieldId}
                  value={String(values[col.field] ?? '')}
                  onChange={(e) => handleChange(col.field, e.target.value)}
                  aria-describedby={fieldError ? errorId : undefined}
                  aria-required={col.required}
                  className={`h-[42px] w-full rounded-lg border px-3.5 py-2.5 text-sm font-medium text-[#111111] ${
                    fieldError ? 'border-destructive' : 'border-[#E8E8E6]'
                  }`}
                >
                  <option value="">{'\u2014'}</option>
                  {col.domainRestrictions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={fieldId}
                  value={String(values[col.field] ?? '')}
                  onChange={(e) => handleChange(col.field, e.target.value)}
                  aria-describedby={fieldError ? errorId : undefined}
                  aria-required={col.required}
                  className={`h-[42px] rounded-lg border-[#E8E8E6] px-3.5 py-2.5 text-sm font-medium text-[#111111] ${
                    fieldError ? 'border-destructive' : ''
                  }`}
                />
              )}

              {fieldError && (
                <p id={errorId} role="alert" className="mt-1 text-xs text-destructive">
                  {fieldError}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ValidationResults — @contract UX-011-M01 D2 */}
      {validationErrors.length > 0 && (
        <div className="mt-5 rounded-lg border border-[#E8E8E6] p-4">
          <h3 className="mb-3 text-sm font-bold text-[#111111]">
            Resultados da Valida\u00e7\u00e3o
          </h3>
          <div className="space-y-2">
            {validationErrors.map((item, idx) => (
              <div
                key={`${item.field}-${idx}`}
                className="flex items-center gap-2 rounded-md bg-[#FFF8E1] p-2"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E67E22"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
                <span className="text-xs font-medium text-[#E67E22]">
                  {item.field ? `${item.field}: ` : ''}{item.message}
                </span>
              </div>
            ))}
          </div>
          {/* SummaryRow */}
          <p className="mt-2 text-xs text-[#888888]">
            {alertCount} alerta{alertCount !== 1 ? 's' : ''} &middot; {blockingCount} erro{blockingCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* FormFooter — @contract UX-011-M01 D2 */}
      <div className="mt-5 flex justify-end gap-3">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
          disabled={saveLoading}
          className="h-10 rounded-lg border-[#E8E8E6] bg-white px-5 text-[13px] font-semibold text-[#555555]"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!saveEnabled || saveLoading || validateLoading}
          className="h-10 rounded-lg bg-[#2E86C1] px-5 text-[13px] font-bold text-white hover:bg-[#2574A9] disabled:cursor-not-allowed disabled:bg-[#E8E8E6] disabled:text-[#CCCCCC]"
        >
          {saveLoading ? (
            <span className="flex items-center gap-2">
              <Spinner className="h-4 w-4" /> Salvando...
            </span>
          ) : (
            'Salvar'
          )}
        </Button>
      </div>
    </form>
  );
}
