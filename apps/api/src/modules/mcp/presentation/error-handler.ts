/**
 * @contract DOC-GNP-00, SEC-010, BR-001, BR-006, BR-010, BR-012
 *
 * Maps MOD-010 MCP domain errors to RFC 9457 Problem Details responses.
 * Propagates X-Correlation-ID.
 */

import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { DomainError } from '../../foundation/domain/errors/domain-errors.js';
import type { ProblemDetails } from './dtos/common.dto.js';

export function mcpErrorHandler(
  error: FastifyError | DomainError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

  // Domain errors → Problem Details
  if (error instanceof DomainError) {
    const problem: ProblemDetails = {
      type: error.type,
      title: error.name,
      status: error.statusHint,
      detail: error.message,
      instance: request.url,
      extensions: { correlationId },
    };

    void reply
      .status(error.statusHint)
      .header('X-Correlation-ID', correlationId)
      .header('Content-Type', 'application/problem+json')
      .send(problem);
    return;
  }

  // Fastify validation errors (Zod via fastify-type-provider-zod)
  if ('validation' in error && error.statusCode === 400) {
    const problem: ProblemDetails = {
      type: '/problems/validation-error',
      title: 'Validation Error',
      status: 422,
      detail: error.message,
      instance: request.url,
      extensions: { correlationId },
    };

    void reply
      .status(422)
      .header('X-Correlation-ID', correlationId)
      .header('Content-Type', 'application/problem+json')
      .send(problem);
    return;
  }

  // Unknown errors → 500 (never leak internal details)
  request.log.error(error, 'Unhandled error in MCP module');

  const problem: ProblemDetails = {
    type: '/problems/internal-error',
    title: 'Internal Server Error',
    status: 500,
    detail: 'Erro interno do servidor.',
    instance: request.url,
    extensions: { correlationId },
  };

  void reply
    .status(500)
    .header('X-Correlation-ID', correlationId)
    .header('Content-Type', 'application/problem+json')
    .send(problem);
}
