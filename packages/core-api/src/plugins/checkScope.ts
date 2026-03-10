// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Plugin checkScope — BR-000-04, FR-000-F06, SEC-000
// RBAC por escopos modulo:recurso:acao. DENY explícito prevalece sobre ALLOW.

import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

export interface CheckScopeOptions {
    /**
     * Função injetada pelo consumidor que retorna os escopos efetivos do usuário.
     * Deve consultar Redis (cache 5min) ou banco como fallback.
     * Ref: FR-000-F06, NFR-000-01
     */
    getUserScopes(userId: string, tenantId: string): Promise<string[]>;

    /**
     * Função opcional para cache Redis (TTL 5min por userId+tenantId).
     * Se não fornecida, sempre consultará banco.
     */
    cache?: {
        get(key: string): Promise<string | null>;
        set(key: string, value: string, ttlSeconds: number): Promise<unknown>;
    };
}

declare module 'fastify' {
    interface FastifyInstance {
        /**
         * Decorator de rota: verifica se o usuário possui o escopo requerido.
         * DENY explícito (escopo prefixado com `-`) prevalece sobre qualquer ALLOW.
         *
         * @example
         * app.get('/users', { preHandler: [app.requireAuth, app.checkScope('users:list:read')] }, handler)
         */
        checkScope(scope: string): (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

const checkScopePlugin: FastifyPluginAsync<CheckScopeOptions> = async (fastify, options) => {
    fastify.decorate(
        'checkScope',
        (requiredScope: string) =>
            async (request: FastifyRequest, reply: FastifyReply) => {
                const user = request.user as { sub?: string; tenantId?: string } | undefined;

                if (!user?.sub || !user?.tenantId) {
                    return reply.status(401).send({
                        type: 'https://httpstatuses.com/401',
                        title: 'Não autenticado',
                        status: 401,
                        detail: 'Usuário não identificado na requisição.',
                        instance: request.url,
                        extensions: { correlationId: request.id },
                    });
                }

                // Tentar cache primeiro
                let scopes: string[];
                const cacheKey = `rbac:${user.sub}:${user.tenantId}`;

                if (options.cache) {
                    const cached = await options.cache.get(cacheKey);
                    if (cached) {
                        scopes = JSON.parse(cached);
                    } else {
                        scopes = await options.getUserScopes(user.sub, user.tenantId);
                        await options.cache.set(cacheKey, JSON.stringify(scopes), 300); // TTL 5min
                    }
                } else {
                    scopes = await options.getUserScopes(user.sub, user.tenantId);
                }

                // DENY explícito: escopo com prefixo `-` nega acesso — BR-000-04
                const denyScope = `-${requiredScope}`;
                if (scopes.includes(denyScope)) {
                    return reply.status(403).send({
                        type: 'https://httpstatuses.com/403',
                        title: 'Acesso negado',
                        status: 403,
                        detail: `Permissão '${requiredScope}' explicitamente negada para este usuário.`,
                        instance: request.url,
                        extensions: { correlationId: request.id },
                    });
                }

                // ALLOW: verificar se escopo está presente
                if (!scopes.includes(requiredScope)) {
                    return reply.status(403).send({
                        type: 'https://httpstatuses.com/403',
                        title: 'Acesso negado',
                        status: 403,
                        detail: `Permissão insuficiente. Escopo requerido: '${requiredScope}'.`,
                        instance: request.url,
                        extensions: { correlationId: request.id },
                    });
                }
            },
    );
};

export const checkScope = fp(checkScopePlugin, {
    name: '@easycf/check-scope',
    fastify: '4.x',
});
