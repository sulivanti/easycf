import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';

/**
 * Plugin ECF — Rota GET /info
 *
 * Expõe metadados públicos da aplicação: nome, versão, ambiente e timestamp.
 * Os valores são resolvidos via variáveis de ambiente injetadas automaticamente
 * pelo Node.js/pnpm em tempo de boot (npm_package_name, npm_package_version).
 *
 * Não requer autenticação. Análogo ao GET /health — infraestrutura do framework.
 */
async function infoRoutePlugin(app: FastifyInstance): Promise<void> {
    app.get(
        '/info',
        {
            schema: {
                description: 'Retorna metadados públicos da aplicação (versão, ambiente)',
                tags: ['infra'],
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            name:        { type: 'string' },
                            version:     { type: 'string' },
                            environment: { type: 'string' },
                            timestamp:   { type: 'string', format: 'date-time' },
                        },
                        required: ['name', 'version', 'environment', 'timestamp'],
                    },
                },
            },
        },
        async () => {
            return {
                name:        process.env['npm_package_name']    ?? 'unknown',
                version:     process.env['npm_package_version'] ?? 'unknown',
                environment: process.env['NODE_ENV']            ?? 'development',
                timestamp:   new Date().toISOString(),
            };
        },
    );
}

export const infoRoute = fp(infoRoutePlugin, {
    fastify: '4.x',
    name:    'ecf-info-route',
});
