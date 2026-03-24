/**
 * @contract DOC-GNP-00, SEC-007, BR-001, BR-003, BR-005, BR-006, BR-007, BR-012
 *
 * Maps MOD-007 domain errors to RFC 9457 Problem Details responses.
 * Propagates X-Correlation-ID.
 */

import type { FastifyReply, FastifyRequest } from 'fastify';
import { DomainError } from '../../foundation/domain/errors/domain-errors.js';

export function contextualParamsErrorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply,
): boolean {
  if (!(error instanceof DomainError)) {
    return false;
  }

  const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

  const problem = {
    type: error.type,
    title: error.name,
    status: error.statusHint,
    detail: error.message,
    instance: request.url,
    correlationId,
  };

  void reply
    .status(error.statusHint)
    .header('X-Correlation-ID', correlationId)
    .header('Content-Type', 'application/problem+json')
    .send(problem);

  return true;
}
