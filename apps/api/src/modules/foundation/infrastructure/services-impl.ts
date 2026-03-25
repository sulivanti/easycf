// @contract BR-010, BR-011, BR-012, BR-013, DOC-ARC-004
//
// Service implementations for Foundation module (MOD-000).
// Concrete adapters for bcrypt, JWT, SHA-256, cache, and email.

import { hash, compare } from 'bcrypt';
import { createHash, randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type {
  PasswordHashService,
  TokenService,
  TokenPayload,
  TokenPair,
  TempTokenPayload,
  CacheService,
  HashUtilService,
  EmailService,
} from '../application/ports/services.js';

const BCRYPT_ROUNDS = 12;

// ─────────────────────────────────────────────────────────────────────────────
// PasswordHashService — bcrypt
// ─────────────────────────────────────────────────────────────────────────────

export class BcryptPasswordHashService implements PasswordHashService {
  async hash(plainPassword: string): Promise<string> {
    return hash(plainPassword, BCRYPT_ROUNDS);
  }

  async compare(plainPassword: string, hashed: string): Promise<boolean> {
    return compare(plainPassword, hashed);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TokenService — Fastify JWT wrapper
// ─────────────────────────────────────────────────────────────────────────────

export class FastifyJwtTokenService implements TokenService {
  constructor(
    private app: FastifyInstance,
    private refreshExpiresIn: string = '7d',
  ) {}

  async generatePair(payload: TokenPayload): Promise<TokenPair> {
    const accessToken = this.app.jwt.sign(
      {
        sub: payload.userId,
        sid: payload.sessionId,
        tid: payload.tenantId ?? null,
        scopes: payload.scopes ?? [],
      },
    );

    const refreshToken = this.app.jwt.sign(
      { sub: payload.userId, sid: payload.sessionId, type: 'refresh' },
      { expiresIn: this.refreshExpiresIn },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 min default from JWT config
    };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    const decoded = this.app.jwt.verify<{
      sub: string;
      sid: string;
      tid: string | null;
      scopes?: string[];
    }>(token);

    return {
      userId: decoded.sub,
      sessionId: decoded.sid,
      tenantId: decoded.tid ?? undefined,
      scopes: decoded.scopes ?? [],
    };
  }

  async generateTempToken(payload: TempTokenPayload, ttlSeconds: number): Promise<string> {
    const { userId, scope, ...rest } = payload;
    return this.app.jwt.sign(
      { sub: userId, scope, ...rest },
      { expiresIn: `${ttlSeconds}s` },
    );
  }

  async verifyTempToken(token: string, expectedScope: string): Promise<TempTokenPayload> {
    const decoded = this.app.jwt.verify<TempTokenPayload & { sub: string; scope: string }>(
      token,
    );

    if (decoded.scope !== expectedScope) {
      throw new Error(`Token scope mismatch: expected ${expectedScope}, got ${decoded.scope}`);
    }

    return { userId: decoded.sub, scope: decoded.scope };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CacheService — in-memory fallback (Redis can be swapped in later)
// ─────────────────────────────────────────────────────────────────────────────

export class InMemoryCacheService implements CacheService {
  private store = new Map<string, { value: unknown; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = Date.now() + (ttlSeconds ?? 300) * 1000;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IdempotencyService — in-memory stub (Redis-based in production)
// ─────────────────────────────────────────────────────────────────────────────

import type { IdempotencyService, IdempotencyResult } from '../application/ports/services.js';

export class InMemoryIdempotencyService implements IdempotencyService {
  private _cache = new Map<string, { value: unknown; expiresAt: number }>();

  async check<T>(key: string): Promise<IdempotencyResult<T> | null> {
    const entry = this._cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this._cache.delete(key);
      return null;
    }
    return { cached: true, value: entry.value as T };
  }

  async store<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this._cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HashUtilService — SHA-256 + UUID
// ─────────────────────────────────────────────────────────────────────────────

export class CryptoHashUtilService implements HashUtilService {
  sha256(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  generateUuid(): string {
    return randomUUID();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EmailService — log-only stub (replace with real SMTP/SES later)
// ─────────────────────────────────────────────────────────────────────────────

export class LogEmailService implements EmailService {
  async sendPasswordReset(email: string, _token: string, expiresAt: Date): Promise<void> {
    console.log(`[EmailService] Password reset email → ${email} (expires: ${expiresAt.toISOString()})`);
  }

  async sendWelcome(email: string, fullName: string): Promise<void> {
    console.log(`[EmailService] Welcome email → ${email} (${fullName})`);
  }
}
