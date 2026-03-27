import * as React from 'react';
import { SearchIcon, XIcon } from 'lucide-react';

import { cn } from '@shared/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function SearchBar({ value, onChange, placeholder = 'Buscar...', className }: SearchBarProps) {
  return (
    <div data-slot="search-bar" className={cn('relative', className)}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-a1-text-hint" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full min-w-[200px] rounded-md border border-a1-border bg-white pl-9 pr-8 text-sm text-a1-text-primary outline-none placeholder:text-a1-text-placeholder focus-visible:border-a1-accent focus-visible:ring-[3px] focus-visible:ring-a1-accent/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-a1-text-hint hover:text-a1-text-secondary"
          aria-label="Limpar busca"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export { SearchBar };
export type { SearchBarProps };
