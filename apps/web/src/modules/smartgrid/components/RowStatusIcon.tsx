/**
 * @contract UX-011 a11y
 * Visual status icon per row: ✅ valid, ❌ blocked, ⚠️ warning, — neutral.
 * Includes aria-label for screen readers.
 */

import type { RowValidationStatus } from '../types/smartgrid.types';
import { STATUS_ICON, STATUS_ARIA_LABEL, STATUS_COLOR_CLASS } from '../types/smartgrid.types';

interface RowStatusIconProps {
  readonly status: RowValidationStatus;
}

export function RowStatusIcon({ status }: RowStatusIconProps) {
  if (status === 'neutral') {
    return (
      <span
        aria-label={STATUS_ARIA_LABEL.neutral}
        role="img"
        className="text-muted-foreground text-base"
      >
        —
      </span>
    );
  }

  return (
    <span
      aria-label={STATUS_ARIA_LABEL[status]}
      role="img"
      className={`text-base ${STATUS_COLOR_CLASS[status]}`}
    >
      {STATUS_ICON[status]}
    </span>
  );
}
