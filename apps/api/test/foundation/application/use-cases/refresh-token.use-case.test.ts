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
} from '../../../../src/modules/foundation/application/ports/repositories.js';
import type { TokenService } from '../../../../src/modules/foundation/application/ports/services.js';

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

  return { sessionRepo, eventRepo, uow, tokenService };
}

describe('RefreshTokenUseCase (FR-003, BR-002)', () => {
  let mocks: ReturnType<typeof createMocks>;
  let useCase: RefreshTokenUseCase;

  beforeEach(() => {
    mocks = createMocks();
    useCase = new RefreshTokenUseCase(
      mocks.sessionRepo,
      mocks.eventRepo,
      mocks.uow,
      mocks.tokenService,
    );
  });

  it('returns a new token pair (rotation) for valid refresh token', async () => {
    vi.mocked(mocks.sessionRepo.findById).mockResolvedValue(makeSessionProps());

    const result = await useCase.execute({
      refreshToken: 'valid-rt',
      correlationId: 'corr-1',
    });

    expect(result.tokenPair.accessToken).toBe('new-at');
    expect(result.tokenPair.refreshToken).toBe('new-rt');
    expect(result.sessionId).toBe('sess-001');
  });

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
