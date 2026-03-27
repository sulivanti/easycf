import * as React from 'react';
import { InboxIcon } from 'lucide-react';

import { cn } from '@shared/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'flex flex-col items-center justify-center py-[var(--space-3xl)] text-center',
        className,
      )}
    >
      <div className="mb-[var(--space-md)] text-a1-text-hint">
        {icon ?? <InboxIcon className="size-12" />}
      </div>
      <h3 className="font-display text-[length:var(--type-title)] font-bold text-a1-text-primary">
        {title}
      </h3>
      {description && (
        <p className="mt-[var(--space-xs)] max-w-sm text-[length:var(--type-body)] text-a1-text-auxiliary">
          {description}
        </p>
      )}
      {action && <div className="mt-[var(--space-lg)]">{action}</div>}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
