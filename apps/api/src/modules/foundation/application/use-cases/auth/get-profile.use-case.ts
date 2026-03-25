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
  TenantRepository,
} from '../../ports/repositories.js';
import type { CacheService } from '../../ports/services.js';

export interface GetProfileInput {
  readonly userId: string;
  readonly activeTenantId?: string;
}

export interface ProfileOutput {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly tenant: { readonly id: string; readonly name: string } | null;
  readonly scopes: readonly string[];
}

export class GetProfileUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tenantUserRepo: TenantUserRepository,
    private readonly roleRepo: RoleRepository,
    private readonly cache: CacheService,
    private readonly tenantRepo: TenantRepository,
  ) {}

  async execute(input: GetProfileInput): Promise<ProfileOutput> {
    const userProps = await this.userRepo.findById(input.userId);
    if (!userProps) {
      throw new EntityNotFoundError('User', input.userId);
    }

    // Resolve scopes + tenant for active tenant (BR-011: cached in Redis)
    let scopes: readonly string[] = [];
    let tenant: { id: string; name: string } | null = null;

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

        // Resolve tenant name (FR-000-C02)
        const tenantProps = await this.tenantRepo.findById(input.activeTenantId);
        if (tenantProps) {
          tenant = { id: tenantProps.id, name: tenantProps.name };
        }
      }
    }

    return {
      id: userProps.id,
      email: userProps.email.value,
      name: userProps.profile?.fullName ?? '',
      avatarUrl: userProps.profile?.avatarUrl ?? null,
      tenant,
      scopes,
    };
  }
}
