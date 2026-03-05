import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { randomUUID } from 'crypto';

export interface CorrelationIdOptions {
    headerName?: string;
    generateId?: () => string;
}

const correlationIdPlugin: FastifyPluginAsync<CorrelationIdOptions> = async (fastify, options) => {
    const headerName = options.headerName || 'x-correlation-id';
    const generateId = options.generateId || (() => randomUUID());

    fastify.addHook('onRequest', async (request, reply) => {
        const id = request.headers[headerName] || generateId();
        request.id = id as string;
        reply.header(headerName, id);
    });
};

export const correlationId = fp(correlationIdPlugin, {
    name: '@easycf/correlation-id'
});
