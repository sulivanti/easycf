/**
 * @contract UX-001-M01 D9
 * ReadOnlyField — campo somente-leitura com lock icon opcional.
 * Spec: label 10px 700 #888 uppercase, valor h:42 r:8 fill:#F8F8F6 border:#F0F0EE.
 */

import { LockIcon } from 'lucide-react';

export interface ReadOnlyFieldProps {
  label: string;
  value: string | null | undefined;
  showLock?: boolean;
  className?: string;
}

export function ReadOnlyField({ label, value, showLock, className }: ReadOnlyFieldProps) {
  return (
    <div className={className}>
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-a1-text-hint">
        {label}
      </span>
      <div className="flex h-[42px] items-center rounded-lg border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] px-3.5 py-2.5">
        <span className="flex-1 truncate text-sm font-medium text-a1-text-primary">
          {value || '—'}
        </span>
        {showLock && <LockIcon className="ml-2 size-3.5 shrink-0 text-a1-text-hint" />}
      </div>
    </div>
  );
}
