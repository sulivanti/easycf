import * as React from 'react';

import { cn } from '@shared/lib/utils';
import { Label } from '@shared/ui/label';

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

function FormField({ label, name, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div data-slot="form-field" className={cn('flex flex-col gap-1.5', className)}>
      <Label
        htmlFor={name}
        className="font-display text-[length:var(--type-label)] font-semibold uppercase tracking-wide text-a1-text-tertiary"
      >
        {label}
        {required && <span className="ml-0.5 text-danger-500">*</span>}
      </Label>
      {React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<{
              id?: string;
              'aria-invalid'?: boolean;
              'aria-describedby'?: string;
            }>,
            {
              id: name,
              'aria-invalid': !!error || undefined,
              'aria-describedby': error ? `${name}-error` : hint ? `${name}-hint` : undefined,
            },
          )
        : children}
      {error && (
        <p
          id={`${name}-error`}
          className="text-[length:var(--type-caption)] text-danger-500"
          role="alert"
        >
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${name}-hint`} className="text-[length:var(--type-caption)] text-a1-text-hint">
          {hint}
        </p>
      )}
    </div>
  );
}

export { FormField };
export type { FormFieldProps };
