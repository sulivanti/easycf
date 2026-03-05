import { createApp } from '@easycf/core-api';

async function bootstrap() {
    const app = await createApp({
        enableCorrelationId: true,
        enableTenantParsing: true
    });

    // Exemplo de uma Rota Protegida de Domínio
    app.get('/api/v1/status', async (request) => {
        return {
            service: '{{project_name}}',
            status: 'operational',
            correlationId: request.id
        };
    });

    try {
        const port = Number(process.env.PORT) || 3000;
        await app.listen({ port, host: '0.0.0.0' });
        app.log.info(`Server listening on port ${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

bootstrap();
