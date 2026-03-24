/**
 * @contract UX-006, DATA-006
 *
 * Reusable status badge for case status and gate resolution status.
 */

import { Badge } from '../../../shared/ui/index.js';
import type { CaseStatus, GateResolutionStatus } from '../types/case-execution.types.js';
import { STATUS_META, GATE_STATUS_META } from '../types/case-execution.types.js';

interface CaseStatusBadgeProps {
  status: CaseStatus;
}

export function CaseStatusBadge({ status }: CaseStatusBadgeProps) {
  const meta = STATUS_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

interface GateStatusBadgeProps {
  status: GateResolutionStatus;
}

export function GateStatusBadge({ status }: GateStatusBadgeProps) {
  const meta = GATE_STATUS_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
