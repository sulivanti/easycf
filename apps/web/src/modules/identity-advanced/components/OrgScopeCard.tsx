/**
 * @contract UX-001.1, FR-001.1, BR-001.1
 * Card component displaying a single org scope binding.
 * Shows scope type badge, org unit breadcrumb, expiration, and remove action.
 */

import { Badge, Button } from '@shared/ui';
import type { OrgScopeDTO } from '../types/identity-advanced.types.js';
import {
  getScopeTypeBadge,
  getStatusBadge,
  getExpirationInfo,
  formatOrgUnitBreadcrumb,
  formatDatePtBr,
} from '../types/identity-advanced.types.js';

export interface OrgScopeCardProps {
  scope: OrgScopeDTO;
  canWrite: boolean;
  onRemove: (scopeId: string) => void;
}

export function OrgScopeCard({ scope, canWrite, onRemove }: OrgScopeCardProps) {
  const typeBadge = getScopeTypeBadge(scope.scope_type);
  const statusBadge = getStatusBadge(scope.status);
  const expiration = getExpirationInfo(scope.valid_until, scope.status);
  const breadcrumb = formatOrgUnitBreadcrumb(scope.org_unit);
  const isActive = scope.status === 'ACTIVE';
  const isInactive = !isActive;

  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-4 ${
        isInactive ? 'border-muted bg-muted/30 opacity-60' : 'border-border bg-card'
      }`}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Badge variant={typeBadge.variant} aria-label={`Tipo: ${typeBadge.label}`}>
            {typeBadge.label}
          </Badge>
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          {expiration && (
            <Badge variant={expiration.variant} aria-label={expiration.ariaLabel}>
              {expiration.label}
            </Badge>
          )}
        </div>

        <p className="text-sm font-medium text-foreground">{breadcrumb}</p>

        <p className="text-xs text-muted-foreground">
          Nível {scope.org_unit.nivel} &middot; Vinculado em {formatDatePtBr(scope.created_at)}
        </p>
      </div>

      {canWrite && isActive && (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onRemove(scope.id)}
        >
          Remover
        </Button>
      )}
    </div>
  );
}
