import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { correlationId } from '../middlewares/correlationId.js';
import { tenantParsing } from '../middlewares/tenantParsing.js';
import { errorHandler } from '../handlers/errorHandler.js';

export interface AppConfig {
    fastifyOptions?: FastifyServerOptions;
    corsOrigins?: string[];
    enableCorrelationId?: boolean;
    enableTenantParsing?: boolean;
}

export async function createApp(config: AppConfig = {}): Promise<FastifyInstance> {
    const app = Fastify({
        logger: true,
        ...config.fastifyOptions,
    });

    // Global Error Handler unificado RFC 9457
    app.setErrorHandler(errorHandler);

    // Injeção de Middlewares Base do ECF
    if (config.enableCorrelationId !== false) {
        await app.register(correlationId, { headerName: 'x-correlation-id' });
    }

    if (config.enableTenantParsing !== false) {
        await app.register(tenantParsing, { headerName: 'x-tenant-id' });
    }

    // Hook de Heartbeat padrão do ECF
    app.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    return app;
}
