/**
 * @contract DOC-GNP-00, SEC-007, BR-001, BR-003, BR-005, BR-006, BR-007, BR-012
 *
 * Maps MOD-007 domain errors to RFC 9457 Problem Details responses.
 * Propagates X-Correlation-ID.
 */

import type { FastifyReply, FastifyRequest } from 'fastify';

interface DomainErrorLike {
  readonly code: string;
  readonly statusCode: number;
  readonly message: string;
}

const KNOWN_ERROR_CODES = new Set([
  'CODIGO_IMMUTABLE',
  'INCIDENCE_CONFLICT',
  'ROUTINE_IMMUTABLE',
  'ROUTINE_NO_ITEMS',
  'ROUTINE_DRAFT_LINK',
  'ROUTINE_DEPRECATED_LINK',
  'LIMIT_EXCEEDED',
]);

function isDomainError(error: unknown): error is DomainErrorLike {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as unknown as DomainErrorLike).code === 'string' &&
    KNOWN_ERROR_CODES.has((error as unknown as DomainErrorLike).code)
  );
}

export function contextualParamsErrorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply,
): boolean {
  if (!isDomainError(error)) {
    return false;
  }

  const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

  const problem = {
    type: `/problems/${error.code.toLowerCase().replace(/_/g, '-')}`,
    title: error.code,
    status: error.statusCode,
    detail: error.message,
    instance: request.url,
    correlationId,
  };

  void reply
    .status(error.statusCode)
    .header('X-Correlation-ID', correlationId)
    .header('Content-Type', 'application/problem+json')
    .send(problem);

  return true;
}
