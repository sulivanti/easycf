import { describe, it, expect, vi, beforeEach } from 'vitest';
import { foundationErrorHandler } from '../../../src/modules/foundation/presentation/error-handler.js';
import {
  AuthenticationFailedError,
  RateLimitExceededError,
  DomainValidationError,
  EntityNotFoundError,
} from '../../../src/modules/foundation/domain/errors/domain-errors.js';
import type { FastifyRequest, FastifyReply, FastifyError } from 'fastify';

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------
function createMockRequest(overrides: Partial<FastifyRequest> = {}): FastifyRequest {
  return {
    headers: { 'x-correlation-id': 'corr-test-123' },
    url: '/api/v1/test',
    id: 'req-fallback-id',
    log: { error: vi.fn() },
    ...overrides,
  } as unknown as FastifyRequest;
}

function createMockReply() {
  const reply = {
    status: vi.fn().mockReturnThis(),
    header: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return reply as unknown as FastifyReply;
}

describe('foundationErrorHandler (RFC 9457)', () => {
  let request: FastifyRequest;
  let reply: ReturnType<typeof createMockReply>;

  beforeEach(() => {
    request = createMockRequest();
    reply = createMockReply();
  });

  describe('DomainError mapping', () => {
    it('maps AuthenticationFailedError to 401 Problem Details', () => {
      foundationErrorHandler(
        new AuthenticationFailedError(),
        request,
        reply as unknown as FastifyReply,
      );

      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.header).toHaveBeenCalledWith('Content-Type', 'application/problem+json');
      expect(reply.header).toHaveBeenCalledWith('X-Correlation-ID', 'corr-test-123');
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '/problems/authentication-failed',
          status: 401,
          instance: '/api/v1/test',
          extensions: { correlationId: 'corr-test-123' },
        }),
      );
    });

    it('maps EntityNotFoundError to 404', () => {
      foundationErrorHandler(
        new EntityNotFoundError('User', 'abc'),
        request,
        reply as unknown as FastifyReply,
      );

      expect(reply.status).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({ type: '/problems/not-found', status: 404 }),
      );
    });

    it('maps DomainValidationError to 422', () => {
      foundationErrorHandler(
        new DomainValidationError('bad input'),
        request,
        reply as unknown as FastifyReply,
      );

      expect(reply.status).toHaveBeenCalledWith(422);
    });
  });

  describe('RateLimitExceededError (BR-003)', () => {
    it('adds Retry-After header', () => {
      foundationErrorHandler(
        new RateLimitExceededError(60),
        request,
        reply as unknown as FastifyReply,
      );

      expect(reply.status).toHaveBeenCalledWith(429);
      expect(reply.header).toHaveBeenCalledWith('Retry-After', '60');
    });
  });

  describe('Fastify validation errors', () => {
    it('maps validation errors to 422 Problem Details', () => {
      const fastifyError = {
        validation: [{ message: 'bad' }],
        statusCode: 400,
        message: 'body must have property email',
      } as unknown as FastifyError;

      foundationErrorHandler(fastifyError, request, reply as unknown as FastifyReply);

      expect(reply.status).toHaveBeenCalledWith(422);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '/problems/validation-error',
          status: 422,
        }),
      );
    });
  });

  describe('unknown errors', () => {
    it('maps to 500 without leaking details', () => {
      const unknownErr = new Error('SQL connection failed at db:5432');

      foundationErrorHandler(unknownErr, request, reply as unknown as FastifyReply);

      expect(reply.status).toHaveBeenCalledWith(500);
      const sent = (reply.send as ReturnType<typeof vi.fn>).mock.calls[0]![0];
      expect(sent.detail).toBe('Erro interno do servidor.');
      expect(sent.detail).not.toContain('SQL');
      expect(sent.detail).not.toContain('5432');
    });

    it('logs the original error', () => {
      const unknownErr = new Error('something broke');

      foundationErrorHandler(unknownErr, request, reply as unknown as FastifyReply);

      expect(request.log.error as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
        unknownErr,
        'Unhandled error',
      );
    });
  });

  describe('correlation ID', () => {
    it('uses X-Correlation-ID header when present', () => {
      foundationErrorHandler(
        new AuthenticationFailedError(),
        request,
        reply as unknown as FastifyReply,
      );

      expect(reply.header).toHaveBeenCalledWith('X-Correlation-ID', 'corr-test-123');
    });

    it('falls back to request.id when header missing', () => {
      const reqNoCorr = createMockRequest({ headers: {} });

      foundationErrorHandler(
        new AuthenticationFailedError(),
        reqNoCorr,
        reply as unknown as FastifyReply,
      );

      expect(reply.header).toHaveBeenCalledWith('X-Correlation-ID', 'req-fallback-id');
    });
  });
});
