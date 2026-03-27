import * as React from 'react';
import { XIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@shared/lib/utils';

const tagVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[length:var(--type-caption)] font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-status-neutral-bg text-a1-text-secondary',
        accent: 'bg-a1-active-bg text-a1-accent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface TagProps extends VariantProps<typeof tagVariants> {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

function Tag({ children, onRemove, variant, className }: TagProps) {
  return (
    <span data-slot="tag" className={cn(tagVariants({ variant }), className)}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10"
          aria-label="Remover"
        >
          <XIcon className="size-3" />
        </button>
      )}
    </span>
  );
}

export { Tag, tagVariants };
export type { TagProps };
