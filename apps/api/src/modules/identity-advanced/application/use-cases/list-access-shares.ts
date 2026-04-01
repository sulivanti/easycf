/**
 * @contract FR-001.2, FR-001-M01 D1
 *
 * Use Case: List Access Shares.
 * Admin mode: cursor-paginated with filters (status, grantee_id).
 * Self-service mode: active shares for caller (/my/shared-accesses).
 * Responses include expanded grantee/grantor with name+email (FR-001-M01).
 */

import type { AccessShareRepository, AccessShareListFilters } from '../ports/repositories.js';
import type { PaginationParams } from '../../../foundation/application/ports/repositories.js';
import type { UserLookupPort, UserSummary } from '../ports/services.js';

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

/** @contract FR-001-M01 D1 — Expanded user summary in share responses */
export interface UserSummaryDTO {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

export interface AccessShareListItem {
  readonly id: string;
  readonly grantorId: string;
  readonly grantor: UserSummaryDTO;
  readonly granteeId: string;
  readonly grantee: UserSummaryDTO;
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
  constructor(
    private readonly shareRepo: AccessShareRepository,
    private readonly userLookup: UserLookupPort,
  ) {}

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

    // Batch resolve user names (FR-001-M01 D1)
    const userIds = new Set<string>();
    for (const s of result.data) {
      userIds.add(s.grantorId);
      userIds.add(s.granteeId);
    }
    const userMap = await this.userLookup.getUserSummaries([...userIds]);

    return {
      data: result.data.map((s) => toShareItem(s, userMap)),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }
}

function toUserSummaryDTO(id: string, userMap: ReadonlyMap<string, UserSummary>): UserSummaryDTO {
  const u = userMap.get(id);
  return { id, name: u?.name ?? id, email: u?.email ?? '' };
}

function toShareItem(
  s: import('../../domain/aggregates/access-share.js').AccessShareProps,
  userMap: ReadonlyMap<string, UserSummary>,
): AccessShareListItem {
  return {
    id: s.id,
    grantorId: s.grantorId,
    grantor: toUserSummaryDTO(s.grantorId, userMap),
    granteeId: s.granteeId,
    grantee: toUserSummaryDTO(s.granteeId, userMap),
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
  };
}

// ---------------------------------------------------------------------------
// Self-service listing (/my/shared-accesses)
// ---------------------------------------------------------------------------
export interface ListMySharedAccessesInput {
  readonly tenantId: string;
  readonly granteeId: string;
}

export class ListMySharedAccessesUseCase {
  constructor(
    private readonly shareRepo: AccessShareRepository,
    private readonly userLookup: UserLookupPort,
  ) {}

  async execute(input: ListMySharedAccessesInput): Promise<readonly AccessShareListItem[]> {
    const shares = await this.shareRepo.listByGrantee(input.tenantId, input.granteeId);

    // Batch resolve user names (FR-001-M01 D1)
    const userIds = new Set<string>();
    for (const s of shares) {
      userIds.add(s.grantorId);
      userIds.add(s.granteeId);
    }
    const userMap = await this.userLookup.getUserSummaries([...userIds]);

    return shares.map((s) => toShareItem(s, userMap));
  }
}
