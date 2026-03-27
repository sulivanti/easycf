import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { cn } from '@shared/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const pages = React.useMemo(() => {
    if (totalPages <= 1) return [];
    const items: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (currentPage > 3) items.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) items.push(i);
      if (currentPage < totalPages - 2) items.push('ellipsis');
      items.push(totalPages);
    }
    return items;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav
      data-slot="pagination"
      aria-label="Paginação"
      className={cn('flex items-center gap-1', className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex size-8 items-center justify-center rounded-md text-a1-text-auxiliary hover:bg-a1-bg disabled:pointer-events-none disabled:opacity-50"
        aria-label="Página anterior"
      >
        <ChevronLeftIcon className="size-4" />
      </button>
      {pages.map((page, i) =>
        page === 'ellipsis' ? (
          <span key={`e${i}`} className="px-1 text-a1-text-hint">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-a1-accent text-white'
                : 'text-a1-text-secondary hover:bg-a1-bg',
            )}
          >
            {page}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex size-8 items-center justify-center rounded-md text-a1-text-auxiliary hover:bg-a1-bg disabled:pointer-events-none disabled:opacity-50"
        aria-label="Próxima página"
      >
        <ChevronRightIcon className="size-4" />
      </button>
    </nav>
  );
}

export { Pagination };
export type { PaginationProps };
