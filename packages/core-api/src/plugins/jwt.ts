import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
    interface FastifyRequest {
        user?: any;
    }
}

export interface JwtPluginOptions {
    secret: string | (() => string);
    // Extensibility for custom validation (e.g., kill-switch, status check)
    validateToken?: (decoded: any, req: FastifyRequest) => Promise<boolean>;
}

const jwtPlugin: FastifyPluginAsync<JwtPluginOptions> = async (fastify, options) => {
    fastify.decorateRequest('user', null);

    fastify.decorate('requireAuth', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return reply.status(401).send({
                    type: 'about:blank',
                    title: 'Unauthorized',
                    status: 401,
                    detail: 'Missing or invalid Authorization header.',
                });
            }

            const token = authHeader.split(' ')[1];
            // In a real scenario, this would import 'jsonwebtoken' or similar to verify.
            // ECF lets the consumer inject 'validateToken' or rely on external libraries.
            // For now, this acts as a basic structure for the jwt plugin.

            let decoded: any = { token }; // stub for decoding

            if (options.validateToken) {
                const isValid = await options.validateToken(decoded, request);
                if (!isValid) {
                    return reply.status(401).send({
                        type: 'about:blank',
                        title: 'Unauthorized',
                        status: 401,
                        detail: 'Token validation failed (e.g. revoked).',
                    });
                }
            }

            request.user = decoded;
        } catch (err) {
            return reply.status(401).send({
                type: 'about:blank',
                title: 'Unauthorized',
                status: 401,
                detail: 'Invalid token.',
            });
        }
    });
};

export const easycfJwt = fp(jwtPlugin, {
    name: '@easycf/jwt',
    fastify: '4.x'
});
