import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
    // Unificação de Problem Details (RFC 9457)
    const isZodError = error instanceof ZodError || error.code === 'FST_ERR_VALIDATION';
    const statusCode = isZodError ? 400 : error.statusCode || 500;

    // Evita vazar stacks sensíveis e unifica logs de request
    const errorResponse = {
        type: isZodError ? 'about:blank' : `https://httpstatuses.com/${statusCode}`,
        title: isZodError ? 'Validation Error' : error.name || 'Internal Server Error',
        status: statusCode,
        detail: error.message,
        instance: request.url,
        correlationId: request.id,
    };

    if (isZodError && error instanceof ZodError) {
        Object.assign(errorResponse, { errors: error.errors });
    }

    // Faz log se for erro intrínseco de servidor interno (500)
    if (statusCode >= 500) {
        request.log.error({ err: error, reqId: request.id }, 'Unhandled Server Exception');
    } else {
        request.log.warn({ err: error, reqId: request.id }, 'Request Exception');
    }

    reply.status(statusCode).send(errorResponse);
}
