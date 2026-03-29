import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@shared/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.3px] whitespace-nowrap',
  {
    variants: {
      status: {
        success: 'border-status-success-border bg-status-success-bg text-success-600',
        warning: 'border-status-pending-border bg-status-warning-bg text-warning-600',
        error: 'border-status-error-border bg-status-error-bg text-danger-600',
        info: 'border-accent-border bg-status-info-bg text-primary-600',
        neutral: 'border-status-neutral-border bg-status-neutral-bg text-status-neutral-text',
        purple: 'border-purple-200 bg-status-purple-bg text-purple-600',
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
