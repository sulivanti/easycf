/**
 * @contract UX-006, UX-006-M01, DATA-006
 *
 * Reusable status badge for case status and gate resolution status.
 * Supports 5 variants: OPEN, IN_PROGRESS, COMPLETED, CANCELLED, ON_HOLD.
 * IN_PROGRESS is derived on the frontend — the backend sends OPEN, but if the
 * case has already transitioned past the initial stage, display as IN_PROGRESS.
 */

import { Badge } from '../../../shared/ui/index.js';
import type { CaseStatus, CaseDisplayStatus, GateResolutionStatus } from '../types/case-execution.types.js';
import { STATUS_STYLE, GATE_STATUS_META } from '../types/case-execution.types.js';

interface CaseStatusBadgeProps {
  status: CaseStatus;
  /** When true, an OPEN case is displayed as IN_PROGRESS (past initial stage). */
  isProgressing?: boolean;
}

export function CaseStatusBadge({ status, isProgressing }: CaseStatusBadgeProps) {
  const displayStatus: CaseDisplayStatus =
    status === 'OPEN' && isProgressing ? 'IN_PROGRESS' : status;

  const style = STATUS_STYLE[displayStatus];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        paddingLeft: '0.625rem',
        paddingRight: '0.625rem',
        paddingTop: '0.125rem',
        paddingBottom: '0.125rem',
        borderRadius: '0.25rem',
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: style.color,
        backgroundColor: style.bg,
        border: style.border,
      }}
    >
      {style.label}
    </span>
  );
}

interface GateStatusBadgeProps {
  status: GateResolutionStatus;
}

export function GateStatusBadge({ status }: GateStatusBadgeProps) {
  const meta = GATE_STATUS_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
