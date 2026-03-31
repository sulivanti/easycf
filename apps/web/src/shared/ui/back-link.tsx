/**
 * @contract UX-000-M04, 07-role-form-spec
 * BackLink — "← Voltar para lista" style link.
 * 13px, weight 600, color #2E86C1, hover underline.
 */

import { Link } from '@tanstack/react-router';

import { cn } from '@shared/lib/utils';

interface BackLinkProps {
  to: string;
  label?: string;
  className?: string;
}

function BackLink({ to, label = '← Voltar para lista', className }: BackLinkProps) {
  return (
    <Link
      to={to}
      data-slot="back-link"
      className={cn(
        'mb-4 inline-block font-display text-[13px] font-semibold text-primary-600 hover:underline',
        className,
      )}
    >
      {label}
    </Link>
  );
}

export { BackLink };
export type { BackLinkProps };
