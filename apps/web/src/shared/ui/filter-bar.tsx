import * as React from 'react';

import { cn } from '@shared/lib/utils';

interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div
      data-slot="filter-bar"
      className={cn(
        'flex flex-wrap items-center gap-[length:var(--space-sm)] rounded-lg border border-a1-border bg-white p-[length:var(--space-sm)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export { FilterBar };
export type { FilterBarProps };
