import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

const PORT = Number(process.env.API_PORT) || 3000;
const HOST = '0.0.0.0';

const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } });

// Plugins
await app.register(helmet);
await app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
  credentials: true,
});

// Health / Info
app.get('/api/v1/info', async () => ({
  name: '@easycode/api',
  version: '0.10.0',
  env: process.env.NODE_ENV ?? 'development',
  uptime: process.uptime(),
}));

// Start
try {
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`API running on ${HOST}:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
