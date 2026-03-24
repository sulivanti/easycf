/**
 * @contract FR-004, SEC-000
 *
 * Use Case: Get Profile (GET /auth/me)
 * Returns user data + scopes. Never exposes passwordHash or mfaSecret.
 */

import { EntityNotFoundError } from '../../../domain/errors/domain-errors.js';
import type {
  UserRepository,
  TenantUserRepository,
  RoleRepository,
} from '../../ports/repositories.js';
import type { CacheService } from '../../ports/services.js';

export interface GetProfileInput {
  readonly userId: string;
  readonly activeTenantId?: string;
}

export interface ProfileOutput {
  readonly id: string;
  readonly email: string;
  readonly codigo: string;
  readonly fullName: string;
  readonly avatarUrl: string | null;
  readonly status: string;
  readonly activeTenantId: string | null;
  readonly scopes: readonly string[];
}

export class GetProfileUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tenantUserRepo: TenantUserRepository,
    private readonly roleRepo: RoleRepository,
    private readonly cache: CacheService,
  ) {}

  async execute(input: GetProfileInput): Promise<ProfileOutput> {
    const userProps = await this.userRepo.findById(input.userId);
    if (!userProps) {
      throw new EntityNotFoundError('User', input.userId);
    }

    // Resolve scopes for active tenant (BR-011: cached in Redis)
    let scopes: readonly string[] = [];

    if (input.activeTenantId) {
      const binding = await this.tenantUserRepo.findByKey(input.userId, input.activeTenantId);

      if (binding) {
        scopes = await this.cache.getOrSet(
          `auth:scopes:role:${binding.roleId}`,
          async () => {
            const role = await this.roleRepo.findById(binding.roleId);
            return role?.scopes.map((s) => s.value) ?? [];
          },
          300, // 5min TTL
        );
      }
    }

    return {
      id: userProps.id,
      email: userProps.email.value,
      codigo: userProps.codigo,
      fullName: userProps.profile?.fullName ?? '',
      avatarUrl: userProps.profile?.avatarUrl ?? null,
      status: userProps.status,
      activeTenantId: input.activeTenantId ?? null,
      scopes,
    };
  }
}
