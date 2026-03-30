import * as React from 'react';
import { Link } from '@tanstack/react-router';

import { cn } from '@shared/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  className?: string;
}

function PageHeader({ title, description, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      className={cn('mb-[var(--space-lg)] flex items-start justify-between', className)}
    >
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-1 flex items-center gap-1 text-[length:var(--type-caption)] text-a1-text-hint"
          >
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span>/</span>}
                {crumb.href ? (
                  <Link to={crumb.href} className="hover:text-a1-text-secondary">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="font-display text-[length:var(--type-display)] font-extrabold text-a1-text-primary">
          {title}
        </h1>
        {description && (
          <p className="mt-[var(--space-xs)] text-[length:var(--type-body)] text-a1-text-auxiliary">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-[var(--space-sm)]">{actions}</div>}
    </div>
  );
}

export { PageHeader };
export type { PageHeaderProps, Breadcrumb };
