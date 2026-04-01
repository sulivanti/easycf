/**
 * @contract UX-001-M01 D2, UX-IDN-001
 * Pill de escopo organizacional com variantes PRIMARY/SECONDARY/OVERFLOW.
 */

import { cn } from '@shared/lib/utils';

export interface ScopePillProps {
  name: string;
  type?: 'PRIMARY' | 'SECONDARY';
  overflow?: number;
  onClick?: () => void;
  className?: string;
}

export function ScopePill({ name, type, overflow, onClick, className }: ScopePillProps) {
  if (overflow) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold',
          'border-[#E8E8E6] bg-[#F5F5F3] text-[#888888]',
          'cursor-pointer hover:bg-[#F0F0EE]',
          className,
        )}
      >
        +{overflow}
      </button>
    );
  }

  const isPrimary = type === 'PRIMARY';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-[11px] font-semibold',
        isPrimary
          ? 'border-[#B8D9F2] bg-[#E3F2FD] text-[#2E86C1]'
          : 'border-[#E8E8E6] bg-[#F5F5F3] text-[#555555]',
        className,
      )}
    >
      {name}
      {type && (
        <span
          className={cn(
            'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
            isPrimary ? 'bg-[#2E86C1] text-white' : 'bg-[#F5F5F3] text-[#555555]',
          )}
        >
          {type}
        </span>
      )}
    </span>
  );
}
