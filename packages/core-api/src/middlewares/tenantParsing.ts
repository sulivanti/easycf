import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

export interface TenantParsingOptions {
    headerName?: string;
}

declare module 'fastify' {
    interface FastifyRequest {
        tenantId?: string;
    }
}

const tenantParsingPlugin: FastifyPluginAsync<TenantParsingOptions> = async (fastify, options) => {
    const headerName = options.headerName || 'x-tenant-id';

    fastify.addHook('onRequest', async (request, reply) => {
        const tenantId = request.headers[headerName];
        if (tenantId && typeof tenantId === 'string') {
            request.tenantId = tenantId;
        }
    });
};

export const tenantParsing = fp(tenantParsingPlugin, {
    name: '@easycf/tenant-parsing'
});
