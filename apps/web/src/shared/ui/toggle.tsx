import * as React from 'react';

import { cn } from '@shared/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'default';
  className?: string;
}

function Toggle({ checked, onChange, label, disabled, size = 'default', className }: ToggleProps) {
  const isSm = size === 'sm';
  return (
    <label
      data-slot="toggle"
      className={cn(
        'inline-flex items-center gap-2',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-[var(--duration-fast)] outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600/20',
          isSm ? 'h-4 w-7' : 'h-5 w-9',
          checked ? 'bg-primary-600' : 'bg-neutral-300',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-sm transition-transform duration-[var(--duration-fast)]',
            isSm ? 'size-3 translate-y-0.5' : 'size-4 translate-y-0.5',
            checked ? (isSm ? 'translate-x-3.5' : 'translate-x-4.5') : 'translate-x-0.5',
          )}
        />
      </button>
      {label && <span className="text-sm text-a1-text-secondary">{label}</span>}
    </label>
  );
}

export { Toggle };
export type { ToggleProps };
