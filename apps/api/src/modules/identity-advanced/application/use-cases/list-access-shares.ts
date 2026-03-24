/**
 * @contract FR-001.2
 *
 * Use Case: List Access Shares.
 * Admin mode: cursor-paginated with filters (status, grantee_id).
 * Self-service mode: active shares for caller (/my/shared-accesses).
 */

import type { AccessShareRepository, AccessShareListFilters } from '../ports/repositories.js';
import type { PaginationParams } from '../../../foundation/application/ports/repositories.js';

// ---------------------------------------------------------------------------
// Admin listing
// ---------------------------------------------------------------------------
export interface ListAccessSharesInput {
  readonly tenantId: string;
  readonly status?: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  readonly granteeId?: string;
  readonly cursor?: string;
  readonly limit?: number;
}

export interface AccessShareListItem {
  readonly id: string;
  readonly grantorId: string;
  readonly granteeId: string;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly allowedActions: string[];
  readonly reason: string;
  readonly authorizedBy: string;
  readonly validFrom: string;
  readonly validUntil: string;
  readonly status: string;
  readonly revokedAt: string | null;
  readonly revokedBy: string | null;
  readonly createdAt: string;
}

export interface ListAccessSharesOutput {
  readonly data: readonly AccessShareListItem[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class ListAccessSharesUseCase {
  constructor(private readonly shareRepo: AccessShareRepository) {}

  async execute(input: ListAccessSharesInput): Promise<ListAccessSharesOutput> {
    const limit = Math.min(input.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const filters: AccessShareListFilters = {
      status: input.status,
      granteeId: input.granteeId,
    };

    const params: PaginationParams = {
      cursor: input.cursor,
      limit,
    };

    const result = await this.shareRepo.list(input.tenantId, filters, params);

    return {
      data: result.data.map((s) => ({
        id: s.id,
        grantorId: s.grantorId,
        granteeId: s.granteeId,
        resourceType: s.resourceType,
        resourceId: s.resourceId,
        allowedActions: s.allowedActions,
        reason: s.reason,
        authorizedBy: s.authorizedBy,
        validFrom: s.validFrom.toISOString(),
        validUntil: s.validUntil.toISOString(),
        status: s.status,
        revokedAt: s.revokedAt?.toISOString() ?? null,
        revokedBy: s.revokedBy,
        createdAt: s.createdAt.toISOString(),
      })),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }
}

// ---------------------------------------------------------------------------
// Self-service listing (/my/shared-accesses)
// ---------------------------------------------------------------------------
export interface ListMySharedAccessesInput {
  readonly tenantId: string;
  readonly granteeId: string;
}

export class ListMySharedAccessesUseCase {
  constructor(private readonly shareRepo: AccessShareRepository) {}

  async execute(input: ListMySharedAccessesInput): Promise<readonly AccessShareListItem[]> {
    const shares = await this.shareRepo.listByGrantee(input.tenantId, input.granteeId);

    return shares.map((s) => ({
      id: s.id,
      grantorId: s.grantorId,
      granteeId: s.granteeId,
      resourceType: s.resourceType,
      resourceId: s.resourceId,
      allowedActions: s.allowedActions,
      reason: s.reason,
      authorizedBy: s.authorizedBy,
      validFrom: s.validFrom.toISOString(),
      validUntil: s.validUntil.toISOString(),
      status: s.status,
      revokedAt: s.revokedAt?.toISOString() ?? null,
      revokedBy: s.revokedBy,
      createdAt: s.createdAt.toISOString(),
    }));
  }
}
