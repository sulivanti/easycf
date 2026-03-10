// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Plugin de Idempotência — ADR-000-03, BR-000-06, FR-000-F01/F04/F16
// Middleware centralizado: Proibido reimplementar em módulos individuais.

import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

export interface IdempotencyOptions {
    /** Cliente Redis compatível com `get`/`set`/`expire`. Injetado pelo consumidor. */
    redis: {
        get(key: string): Promise<string | null>;
        set(key: string, value: string): Promise<unknown>;
        expire(key: string, seconds: number): Promise<unknown>;
    };
    /** TTL em segundos. Padrão: 30 (ADR-000-03) */
    ttlSeconds?: number;
    /** Header a ser lido. Padrão: 'idempotency-key' */
    headerName?: string;
}

declare module 'fastify' {
    interface FastifyRequest {
        idempotencyKey?: string;
    }
}

/**
 * Plugin `idempotency` — Fastify
 *
 * - Lê o header `Idempotency-Key` (obrigatório em mutações com efeito colateral)
 * - Se a resposta já estiver cacheada no Redis → retorna 200 com o corpo anterior (sem re-execução)
 * - Após execução: armazena resposta no Redis com TTL configurado (padrão 30s)
 * - Ref: ADR-000-03, BR-000-06, DOC-DEV-001 §0.0
 */
const idempotencyPlugin: FastifyPluginAsync<IdempotencyOptions> = async (fastify, options) => {
    const { redis, ttlSeconds = 30, headerName = 'idempotency-key' } = options;

    fastify.decorateRequest('idempotencyKey', undefined);

    fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
        const routeConfig = (request.routeOptions as any)?.config;
        if (!routeConfig?.idempotent) return; // Apenas rotas marcadas com config.idempotent

        const key = request.headers[headerName] as string | undefined;
        if (!key) {
            return reply.status(400).send({
                type: 'https://httpstatuses.com/400',
                title: 'Idempotency-Key obrigatório',
                status: 400,
                detail: `O header '${headerName}' é obrigatório nesta rota.`,
                instance: request.url,
                extensions: { correlationId: request.id },
            });
        }

        request.idempotencyKey = key;

        const cacheKey = `idempotency:${key}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            return reply.status(parsed.statusCode ?? 200).send(parsed.body);
        }
    });

    fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload) => {
        if (!request.idempotencyKey) return payload;

        const cacheKey = `idempotency:${request.idempotencyKey}`;
        const statusCode = reply.statusCode;
        if (statusCode >= 200 && statusCode < 300) {
            const body = typeof payload === 'string' ? JSON.parse(payload) : payload;
            await redis.set(cacheKey, JSON.stringify({ statusCode, body }));
            await redis.expire(cacheKey, ttlSeconds);
        }

        return payload;
    });
};

export const idempotency = fp(idempotencyPlugin, {
    name: '@easycf/idempotency',
    fastify: '4.x',
});
