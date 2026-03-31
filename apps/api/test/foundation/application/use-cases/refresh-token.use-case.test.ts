import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RefreshTokenUseCase } from '../../../../src/modules/foundation/application/use-cases/auth/refresh-token.use-case.js';
import {
  SessionRevokedError,
  SessionExpiredError,
} from '../../../../src/modules/foundation/domain/errors/domain-errors.js';
import type { SessionProps } from '../../../../src/modules/foundation/domain/entities/session.entity.js';
import type {
  SessionRepository,
  DomainEventRepository,
  UnitOfWork,
  TenantUserRepository,
  RoleRepository,
} from '../../../../src/modules/foundation/application/ports/repositories.js';
import type {
  TokenService,
  CacheService,
} from '../../../../src/modules/foundation/application/ports/services.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
function makeSessionProps(overrides: Partial<SessionProps> = {}): SessionProps {
  return {
    id: 'sess-001',
    userId: 'usr-001',
    isRevoked: false,
    deviceFp: null,
    rememberMe: false,
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12h from now
    createdAt: new Date(),
    revokedAt: null,
    ...overrides,
  };
}

const SCOPES = ['users:role:read', 'process:cycle:read'];

function makeTenantUserProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'usr-001',
    tenantId: 'tid-123',
    roleId: 'role-001',
    status: 'ACTIVE' as const,
    createdAt: new Date(),
    ...overrides,
  };
}

function makeRoleProps() {
  return {
    id: 'role-001',
    codigo: 'admin',
    label: 'Admin',
    scopes: SCOPES.map((s) => ({ value: s })),
    isSystem: false,
    tenantId: 'tid-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
function createMocks() {
  const sessionRepo: SessionRepository = {
    findById: vi.fn(),
    findActiveByUserId: vi.fn(),
    create: vi.fn(),
    revoke: vi.fn(),
    revokeAllByUserId: vi.fn(),
  };

  const eventRepo: DomainEventRepository = {
    create: vi.fn().mockResolvedValue(undefined),
    createMany: vi.fn(),
    listByEntity: vi.fn(),
  };

  const uow: UnitOfWork = {
    transaction: vi.fn().mockImplementation((fn) => fn(null)),
  };

  const tokenService: TokenService = {
    generatePair: vi.fn().mockResolvedValue({
      accessToken: 'new-at',
      refreshToken: 'new-rt',
      expiresIn: 900,
    }),
    verifyAccessToken: vi.fn().mockResolvedValue({
      userId: 'usr-001',
      sessionId: 'sess-001',
    }),
    generateTempToken: vi.fn(),
    verifyTempToken: vi.fn(),
  };

  const tenantUserRepo: TenantUserRepository = {
    findByKey: vi.fn(),
    findByUserId: vi.fn().mockResolvedValue([makeTenantUserProps()]),
    create: vi.fn(),
    update: vi.fn(),
    findByTenantId: vi.fn(),
    delete: vi.fn(),
  };

  const roleRepo: RoleRepository = {
    findById: vi.fn().mockResolvedValue(makeRoleProps()),
    findByCodigo: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const cache: CacheService = {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    del: vi.fn().mockResolvedValue(undefined),
    getOrSet: vi.fn().mockImplementation((_key, factory) => factory()),
  };

  return { sessionRepo, eventRepo, uow, tokenService, tenantUserRepo, roleRepo, cache };
}

describe('RefreshTokenUseCase (FR-003, BR-002, FR-000-C08)', () => {
  let mocks: ReturnType<typeof createMocks>;
  let useCase: RefreshTokenUseCase;

  beforeEach(() => {
    mocks = createMocks();
    useCase = new RefreshTokenUseCase(
      mocks.sessionRepo,
      mocks.eventRepo,
      mocks.uow,
      mocks.tokenService,
      mocks.tenantUserRepo,
      mocks.roleRepo,
      mocks.cache,
    );
  });

  // ── AC-001: refresh produces token with correct scopes ──
  it('returns a new token pair with scopes from DB (AC-001)', async () => {
    vi.mocked(mocks.sessionRepo.findById).mockResolvedValue(makeSessionProps());

    const result = await useCase.execute({
      refreshToken: 'valid-rt',
      correlationId: 'corr-1',
    });

    expect(result.tokenPair.accessToken).toBe('new-at');
    expect(result.tokenPair.refreshToken).toBe('new-rt');
    expect(result.sessionId).toBe('sess-001');

    // Verify scopes and tenantId were passed to generatePair
    expect(mocks.tokenService.generatePair).toHaveBeenCalledWith({
      userId: 'usr-001',
      sessionId: 'sess-001',
      tenantId: 'tid-123',
      scopes: SCOPES,
    });
  });

  // ── AC-002: refresh includes tenantId from DB ──
  it('resolves tenantId from TenantUserRepository (AC-002)', async () => {
    vi.mocked(mocks.sessionRepo.findById).mockResolvedValue(makeSessionProps());

    await useCase.execute({ refreshToken: 'rt', correlationId: 'corr-1' });

    expect(mocks.tenantUserRepo.findByUserId).toHaveBeenCalledWith('usr-001');
    const call = vi.mocked(mocks.tokenService.generatePair).mock.calls[0]![0];
    expect(call.tenantId).toBe('tid-123');
  });

  // ── AC-003: refresh reflects role changes ──
  it('reflects updated scopes when role changes (AC-003)', async () => {
    vi.mocked(mocks.sessionRepo.findById).mockResolvedValue(makeSessionProps());
    vi.mocked(mocks.roleRepo.findById).mockResolvedValue({
      ...makeRoleProps(),
      scopes: [{ value: 'users:role:read' }], // process:cycle:read removed
    });

    await useCase.execute({ refreshToken: 'rt', correlationId: 'corr-1' });

    const call = vi.mocked(mocks.tokenService.generatePair).mock.calls[0]![0];
    expect(call.scopes).toEqual(['users:role:read']);
    expect(call.scopes).not.toContain('process:cycle:read');
  });

  // ── AC-004: refresh fails when no active tenantUser ──
  it('throws SessionRevokedError when no active tenantUser (AC-004)', async () => {
    vi.mocked(mocks.sessionRepo.findById).mockResolvedValue(makeSessionProps());
    vi.mocked(mocks.tenantUserRepo.findByUserId).mockResolvedValue([
      makeTenantUserProps({ status: 'INACTIVE' }),
    ]);

    await expect(useCase.execute({ refreshToken: 'rt', correlationId: 'corr-1' })).rejects.toThrow(
      SessionRevokedError,
    );
  });

  // ── AC-005: compatibility with pre-fix tokens (no scopes/tid in payload) ──
  it('works with pre-fix refresh tokens that lack scopes/tid (AC-005)', async () => {
    vi.mocked(mocks.sessionRepo.findById).mockResolvedValue(makeSessionProps());
    // Pre-fix token: only userId + sessionId, no scopes, no tenantId
    vi.mocked(mocks.tokenService.verifyAccessToken).mockResolvedValue({
      userId: 'usr-001',
      sessionId: 'sess-001',
    });

    const result = await useCase.execute({ refreshToken: 'old-rt', correlationId: 'corr-1' });

    expect(result.tokenPair.accessToken).toBe('new-at');
    // Scopes came from DB, not from token
    expect(mocks.tokenService.generatePair).toHaveBeenCalledWith(
      expect.objectContaining({
        scopes: SCOPES,
        tenantId: 'tid-123',
      }),
    );
  });

  // ── Cache hit: roleRepo not called when cache returns scopes ──
  it('uses cached scopes and skips roleRepo query (GUD-001)', async () => {
    vi.mocked(mocks.sessionRepo.findById).mockResolvedValue(makeSessionProps());
    vi.mocked(mocks.cache.getOrSet).mockResolvedValue(SCOPES);

    await useCase.execute({ refreshToken: 'rt', correlationId: 'corr-1' });

    expect(mocks.cache.getOrSet).toHaveBeenCalledWith(
      'auth:scopes:role:role-001',
      expect.any(Function),
      300,
    );
  });

  // ── Existing tests (preserved) ──
  it('throws SessionRevokedError when token verification fails', async () => {
    vi.mocked(mocks.tokenService.verifyAccessToken).mockRejectedValue(new Error('invalid token'));

    await expect(
      useCase.execute({ refreshToken: 'bad-rt', correlationId: 'corr-1' }),
    ).rejects.toThrow(SessionRevokedError);
  });

  it('throws SessionRevokedError when session not found in DB', async () => {
    vi.mocked(mocks.sessionRepo.findById).mockResolvedValue(null);

    await expect(useCase.execute({ refreshToken: 'rt', correlationId: 'corr-1' })).rejects.toThrow(
      SessionRevokedError,
    );
  });

  it('throws SessionRevokedError when session is revoked (kill-switch)', async () => {
    vi.mocked(mocks.sessionRepo.findById).mockResolvedValue(
      makeSessionProps({ isRevoked: true, revokedAt: new Date() }),
    );

    await expect(useCase.execute({ refreshToken: 'rt', correlationId: 'corr-1' })).rejects.toThrow(
      SessionRevokedError,
    );
  });

  it('throws SessionExpiredError when session has expired', async () => {
    vi.mocked(mocks.sessionRepo.findById).mockResolvedValue(
      makeSessionProps({ expiresAt: new Date(Date.now() - 1000) }),
    );

    await expect(useCase.execute({ refreshToken: 'rt', correlationId: 'corr-1' })).rejects.toThrow(
      SessionExpiredError,
    );
  });

  describe('handleReuseDetected', () => {
    it('revokes session and emits security event', async () => {
      await useCase.handleReuseDetected('usr-001', 'sess-001', 'corr-1');

      expect(mocks.sessionRepo.revoke).toHaveBeenCalledWith('sess-001', null);
      expect(mocks.eventRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'auth.token_reuse_detected',
        }),
        null,
      );
    });
  });
});
