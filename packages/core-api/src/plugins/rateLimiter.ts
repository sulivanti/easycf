// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Plugin Rate Limiter — NFR-000-04, SEC-000, FR-000-F01/F04

import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';

export interface RateLimiterConfig {
    /** Número máximo de requisições no janela `windowMs` */
    max: number;
    /** Janela em milissegundos. Ex: 900000 = 15min */
    windowMs: number;
    /** Mensagem de erro (RFC 9457) */
    message?: string;
    /** Chave de agrupamento: 'ip' (padrão) ou função customizada */
    keyGenerator?: (request: import('fastify').FastifyRequest) => string;
}

export interface RateLimiterPluginOptions {
    redis: {
        incr(key: string): Promise<number>;
        pexpire(key: string, ms: number): Promise<unknown>;
        pttl(key: string): Promise<number>;
    };
    /** Mapa de políticas por rota. Chave = `METHOD:path`. Ex: `'POST:/api/v1/auth/login'` */
    policies: Record<string, RateLimiterConfig>;
    /** Política padrão (usada quando a rota não está no mapa) */
    defaultPolicy?: RateLimiterConfig;
}

/**
 * Plugin `rateLimiter` — Fastify
 *
 * Implementa rate limiting por Redis (sem fallback silencioso para in-memory).
 * Se Redis indisponível, falha aberta com log de warning (NFR-000-03).
 *
 * Políticas pré-definidas conforme NFR-000-04:
 * - `POST /auth/login`: 10 req/15min/IP
 * - `POST /auth/forgot-password`: 3 req/15min/email
 */
const rateLimiterPlugin: FastifyPluginAsync<RateLimiterPluginOptions> = async (
    fastify,
    options,
) => {
    const { redis, policies, defaultPolicy } = options;

    fastify.addHook('onRequest', async (request, reply) => {
        const routeKey = `${request.method}:${request.routeOptions?.url ?? request.url}`;
        const policy = policies[routeKey] ?? defaultPolicy;
        if (!policy) return;

        const { max, windowMs, message, keyGenerator } = policy;
        const key = keyGenerator
            ? keyGenerator(request)
            : `ratelimit:${routeKey}:${request.ip}`;

        try {
            const count = await redis.incr(key);
            if (count === 1) {
                await redis.pexpire(key, windowMs);
            }

            if (count > max) {
                const ttlMs = await redis.pttl(key);
                const retryAfter = Math.ceil(ttlMs / 1000);
                reply.header('Retry-After', String(retryAfter));
                reply.header('X-RateLimit-Limit', String(max));
                reply.header('X-RateLimit-Remaining', '0');

                return reply.status(429).send({
                    type: 'https://httpstatuses.com/429',
                    title: 'Too Many Requests',
                    status: 429,
                    detail: message ?? `Limite de tentativas atingido. Tente novamente em ${retryAfter}s.`,
                    instance: request.url,
                    extensions: {
                        correlationId: request.id,
                        retryAfter,
                    },
                });
            }

            reply.header('X-RateLimit-Limit', String(max));
            reply.header('X-RateLimit-Remaining', String(Math.max(0, max - count)));
        } catch (err) {
            // Fallback aberto: Redis indisponível não bloqueia a requisição
            request.log.warn({ err, key }, 'RateLimiter: Redis indisponível, fallback aberto');
        }
    });
};

export const rateLimiter = fp(rateLimiterPlugin, {
    name: '@easycf/rate-limiter',
    fastify: '4.x',
});

// Políticas padrão exportadas para facilitar configuração nos apps
export const RATE_LIMIT_POLICIES: RateLimiterPluginOptions['policies'] = {
    'POST:/api/v1/auth/login': {
        max: 10,
        windowMs: 15 * 60 * 1000, // 15min
        message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
    },
    'POST:/api/v1/auth/forgot-password': {
        max: 3,
        windowMs: 15 * 60 * 1000, // 15min
        keyGenerator: (req) => {
            const body = req.body as { email?: string } | undefined;
            return `ratelimit:forgot-password:${body?.email ?? req.ip}`;
        },
        message: 'Limite de solicitações de recuperação de senha excedido.',
    },
};
