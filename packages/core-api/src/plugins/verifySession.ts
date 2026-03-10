// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Plugin verifySession — ADR-000-01, BR-000-02, SEC-000
// Kill-Switch: JWT válido + sessão revogada no banco → 401

import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

export interface VerifySessionOptions {
    /**
     * Função injetada pelo consumidor que busca a sessão em banco.
     * Retorna true se sessão está ativa (não revogada) e não expirada.
     * Lança erro ou retorna false se inválida.
     */
    isSessionActive(sessionId: string, userId: string): Promise<boolean>;
}

declare module 'fastify' {
    interface FastifyRequest {
        sessionId?: string;
    }
}

/**
 * Plugin `verifySession` — Hook `preHandler`
 *
 * Confirma que o `sessionId` embutido no JWT existe e não está revogado no banco.
 * ADR-000-01: desvio intencional do JWT stateless clássico para suporte a Kill-Switch.
 *
 * Uso: registrar como preHandler em rotas protegidas via `config.verifySession = true`
 * ou decorar o fastify instance com `fastify.verifyActiveSession`.
 */
const verifySessionPlugin: FastifyPluginAsync<VerifySessionOptions> = async (fastify, options) => {
    fastify.decorateRequest('sessionId', undefined);

    fastify.decorate(
        'verifyActiveSession',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as { sessionId?: string; sub?: string } | undefined;

            if (!user?.sessionId || !user?.sub) {
                return reply.status(401).send({
                    type: 'https://httpstatuses.com/401',
                    title: 'Não autenticado',
                    status: 401,
                    detail: 'Token inválido ou sessão ausente.',
                    instance: request.url,
                    extensions: { correlationId: request.id },
                });
            }

            const active = await options.isSessionActive(user.sessionId, user.sub);
            if (!active) {
                return reply.status(401).send({
                    type: 'https://httpstatuses.com/401',
                    title: 'Sessão inválida',
                    status: 401,
                    detail: 'Sessão revogada ou expirada. Faça login novamente.',
                    instance: request.url,
                    extensions: { correlationId: request.id },
                });
            }

            request.sessionId = user.sessionId;
        },
    );
};

export const verifySession = fp(verifySessionPlugin, {
    name: '@easycf/verify-session',
    fastify: '4.x',
});
