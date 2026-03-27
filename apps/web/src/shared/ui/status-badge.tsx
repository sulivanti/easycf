import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@shared/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-[length:var(--type-caption)] font-medium whitespace-nowrap',
  {
    variants: {
      status: {
        success: 'bg-status-success-bg text-success-600',
        warning: 'bg-status-warning-bg text-warning-600',
        error: 'bg-status-error-bg text-danger-600',
        info: 'bg-status-info-bg text-primary-600',
        neutral: 'bg-status-neutral-bg text-neutral-600',
        purple: 'bg-status-purple-bg text-purple-600',
      },
    },
    defaultVariants: {
      status: 'neutral',
    },
  },
);

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
}

function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span data-slot="status-badge" className={cn(statusBadgeVariants({ status }), className)}>
      {children}
    </span>
  );
}

export { StatusBadge, statusBadgeVariants };
export type { StatusBadgeProps, StatusType };
