/**
 * @contract UX-SGR-002, BR-005
 * Dynamic edit form for a single record.
 * Fields are editable or readonly (with lock icon) based on motor response.
 * Supports domain dropdowns, required asterisks, defaults.
 */

import { useState } from 'react';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shared/ui/tooltip';
import { Spinner } from '@shared/ui/spinner';
import type { GridColumn, ValidationItem } from '../types/smartgrid.types';
import { COPY } from '../types/smartgrid.types';

interface SmartEditFormProps {
  readonly columns: readonly GridColumn[];
  readonly initialValues: Record<string, unknown>;
  readonly blockedFields: ReadonlySet<string>;
  readonly validationErrors: readonly ValidationItem[];
  readonly validateLoading: boolean;
  readonly saveLoading: boolean;
  readonly saveEnabled: boolean;
  readonly onValidate: (values: Record<string, unknown>) => void;
  readonly onSave: (values: Record<string, unknown>) => void;
  readonly onCancel: () => void;
}

/** @contract UX-SGR-002 — edit-form component */
export function SmartEditForm({
  columns,
  initialValues,
  blockedFields,
  validationErrors,
  validateLoading,
  saveLoading,
  saveEnabled,
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(values);
      }}
      className="max-w-2xl p-4"
    >
      {visibleColumns.map((col) => {
        const isBlocked = blockedFields.has(col.field);
        const fieldError = errorMap.get(col.field);
        const fieldId = `field-${col.field}`;
        const errorId = `error-${col.field}`;

        return (
          <div key={col.field} className="mb-4">
            <Label htmlFor={fieldId} className="mb-1 flex items-center gap-1">
              {col.label}
              {col.required && <span className="text-destructive">*</span>}
              {isBlocked && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help text-sm">🔒</span>
                    </TooltipTrigger>
                    <TooltipContent>{COPY.fieldReadonlyTooltip}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </Label>

            {col.domainRestrictions ? (
              <select
                id={fieldId}
                value={String(values[col.field] ?? '')}
                onChange={(e) => handleChange(col.field, e.target.value)}
                disabled={isBlocked}
                aria-describedby={fieldError ? errorId : undefined}
                aria-required={col.required}
                className={`w-full rounded-md border px-3 py-2 text-sm ${
                  fieldError ? 'border-destructive' : 'border-input'
                } ${isBlocked ? 'bg-muted' : 'bg-background'}`}
              >
                <option value="">—</option>
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
                disabled={isBlocked}
                readOnly={isBlocked}
                aria-describedby={fieldError ? errorId : undefined}
                aria-required={col.required}
                className={`${fieldError ? 'border-destructive' : ''} ${isBlocked ? 'bg-muted' : ''}`}
              />
            )}

            {fieldError && (
              <p id={errorId} role="alert" className="mt-1 text-sm text-destructive">
                {fieldError}
              </p>
            )}
          </div>
        );
      })}

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel} disabled={saveLoading}>
          Cancelar
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={() => onValidate(values)}
          disabled={validateLoading || saveLoading}
        >
          {validateLoading ? (
            <span className="flex items-center gap-2">
              <Spinner className="h-4 w-4" /> Validando...
            </span>
          ) : (
            'Validar'
          )}
        </Button>
        <Button type="submit" disabled={!saveEnabled || saveLoading || validateLoading}>
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
