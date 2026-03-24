import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  LoginUseCase,
  type LoginInput,
} from '../../../../src/modules/foundation/application/use-cases/auth/login.use-case.js';
import { Email } from '../../../../src/modules/foundation/domain/value-objects/email.vo.js';
import {
  AuthenticationFailedError,
  EntityBlockedError,
  DomainValidationError,
} from '../../../../src/modules/foundation/domain/errors/domain-errors.js';
import type { UserProps } from '../../../../src/modules/foundation/domain/entities/user.entity.js';
import type {
  UserRepository,
  SessionRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../../../../src/modules/foundation/application/ports/repositories.js';
import type {
  PasswordHashService,
  TokenService,
} from '../../../../src/modules/foundation/application/ports/services.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
function makeUserProps(overrides: Partial<UserProps> = {}): UserProps {
  return {
    id: 'usr-001',
    codigo: 'USR001',
    email: Email.create('john@example.com'),
    passwordHash: '$2b$12$hashed',
    mfaSecret: null,
    status: 'ACTIVE',
    forcePwdReset: false,
    profile: { fullName: 'John Doe', cpfCnpj: null, avatarUrl: null },
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    ...overrides,
  };
}

const defaultInput: LoginInput = {
  email: 'john@example.com',
  password: 'Str0ng!Pass',
  correlationId: 'corr-123',
};

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
function createMocks() {
  const userRepo: UserRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByCodigo: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateProfile: vi.fn(),
    softDelete: vi.fn(),
  };

  const sessionRepo: SessionRepository = {
    findById: vi.fn(),
    findActiveByUserId: vi.fn(),
    create: vi.fn().mockResolvedValue({ id: 'sess-001' }),
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

  const hashService: PasswordHashService = {
    hash: vi.fn(),
    compare: vi.fn(),
  };

  const tokenService: TokenService = {
    generatePair: vi.fn().mockResolvedValue({
      accessToken: 'at-xxx',
      refreshToken: 'rt-xxx',
      expiresIn: 900,
    }),
    verifyAccessToken: vi.fn(),
    generateTempToken: vi.fn().mockResolvedValue('temp-xxx'),
    verifyTempToken: vi.fn(),
  };

  return { userRepo, sessionRepo, eventRepo, uow, hashService, tokenService };
}

describe('LoginUseCase (FR-001, BR-001, BR-008)', () => {
  let mocks: ReturnType<typeof createMocks>;
  let useCase: LoginUseCase;

  beforeEach(() => {
    mocks = createMocks();
    useCase = new LoginUseCase(
      mocks.userRepo,
      mocks.sessionRepo,
      mocks.eventRepo,
      mocks.uow,
      mocks.hashService,
      mocks.tokenService,
    );
  });

  it('returns token pair on successful login', async () => {
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue(makeUserProps());
    vi.mocked(mocks.hashService.compare).mockResolvedValue(true);

    const result = await useCase.execute(defaultInput);

    expect(result).toHaveProperty('tokenPair');
    expect(result).toHaveProperty('sessionId', 'sess-001');
    expect(mocks.sessionRepo.create).toHaveBeenCalled();
    expect(mocks.eventRepo.create).toHaveBeenCalled();
  });

  it('throws AuthenticationFailedError when user not found (BR-001 anti-enumeration)', async () => {
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue(null);

    await expect(useCase.execute(defaultInput)).rejects.toThrow(AuthenticationFailedError);
  });

  it('throws AuthenticationFailedError on wrong password (BR-001 same error)', async () => {
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue(makeUserProps());
    vi.mocked(mocks.hashService.compare).mockResolvedValue(false);

    await expect(useCase.execute(defaultInput)).rejects.toThrow(AuthenticationFailedError);
  });

  it('emits login_failed event on wrong password (best-effort)', async () => {
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue(makeUserProps());
    vi.mocked(mocks.hashService.compare).mockResolvedValue(false);

    await expect(useCase.execute(defaultInput)).rejects.toThrow();
    expect(mocks.eventRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'auth.login_failed' }),
    );
  });

  it('throws EntityBlockedError for BLOCKED user', async () => {
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue(makeUserProps({ status: 'BLOCKED' }));

    await expect(useCase.execute(defaultInput)).rejects.toThrow(EntityBlockedError);
  });

  it('throws DomainValidationError for INACTIVE user', async () => {
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue(makeUserProps({ status: 'INACTIVE' }));

    await expect(useCase.execute(defaultInput)).rejects.toThrow(DomainValidationError);
  });

  it('returns MFA response when user has MFA enabled (BR-008)', async () => {
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue(
      makeUserProps({ mfaSecret: 'TOTP_SECRET' }),
    );
    vi.mocked(mocks.hashService.compare).mockResolvedValue(true);

    const result = await useCase.execute(defaultInput);

    expect(result).toEqual({
      mfaRequired: true,
      tempToken: 'temp-xxx',
      expiresIn: 300,
    });
    // Should NOT create a session for MFA flow
    expect(mocks.sessionRepo.create).not.toHaveBeenCalled();
  });

  it('generates temp token with 300s TTL for MFA', async () => {
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue(makeUserProps({ mfaSecret: 'SECRET' }));
    vi.mocked(mocks.hashService.compare).mockResolvedValue(true);

    await useCase.execute(defaultInput);

    expect(mocks.tokenService.generateTempToken).toHaveBeenCalledWith(
      { userId: 'usr-001', scope: 'mfa-only' },
      300,
    );
  });

  it('passes rememberMe to session creation', async () => {
    vi.mocked(mocks.userRepo.findByEmail).mockResolvedValue(makeUserProps());
    vi.mocked(mocks.hashService.compare).mockResolvedValue(true);

    await useCase.execute({ ...defaultInput, rememberMe: true });

    // Session.create is called inside the use case, verify via sessionRepo.create
    const createCall = vi.mocked(mocks.sessionRepo.create).mock.calls[0]!;
    expect(createCall[0]).toHaveProperty('rememberMe', true);
  });
});
