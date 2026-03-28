import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@shared/lib/utils';

const selectVariants = cva(
  'appearance-none rounded-md border border-a1-border bg-white pr-8 text-sm text-a1-text-primary outline-none transition-[color,box-shadow] focus-visible:border-primary-600 focus-visible:ring-[3px] focus-visible:ring-primary-600/20 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'h-9 px-3',
        sm: 'h-8 px-2 text-xs',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

interface SelectProps
  extends Omit<React.ComponentProps<'select'>, 'size'>, VariantProps<typeof selectVariants> {
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

function Select({ options, placeholder, size, className, ...props }: SelectProps) {
  return (
    <div data-slot="select" className="relative inline-flex">
      <select className={cn(selectVariants({ size }), className)} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-a1-text-hint" />
    </div>
  );
}

export { Select, selectVariants };
export type { SelectProps };
