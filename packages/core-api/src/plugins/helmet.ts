// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Plugin Helmet — NFR-000-04, SEC-000
// Headers de segurança obrigatórios (X-Content-Type-Options, X-Frame-Options, HSTS).

import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';

export interface HelmetPluginOptions {
    /** Desativar HSTS (útil em desenvolvimento). Padrão: false */
    disableHsts?: boolean;
}

/**
 * Plugin `easycfHelmet` — Fastify
 *
 * Injeta headers de segurança obrigatórios via hook `onSend`.
 * Ref: SEC-000, NFR-000-04
 *
 * Headers injetados:
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: DENY
 * - X-XSS-Protection: 0 (não usar — moderno usa CSP)
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - Permissions-Policy: camera=(), microphone=(), geolocation=()
 * - Strict-Transport-Security (em produção)
 * - Content-Security-Policy: default-src 'self'
 */
const helmetPlugin: FastifyPluginAsync<HelmetPluginOptions> = async (fastify, options) => {
    const isProd = process.env.NODE_ENV === 'production';

    fastify.addHook('onSend', async (_request, reply) => {
        reply.header('X-Content-Type-Options', 'nosniff');
        reply.header('X-Frame-Options', 'DENY');
        reply.header('X-XSS-Protection', '0');
        reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
        reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        reply.header('Content-Security-Policy', "default-src 'self'");

        if (isProd && !options.disableHsts) {
            reply.header(
                'Strict-Transport-Security',
                'max-age=63072000; includeSubDomains; preload',
            );
        }
    });
};

export const easycfHelmet = fp(helmetPlugin, {
    name: '@easycf/helmet',
    fastify: '4.x',
});
