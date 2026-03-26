/**
 * @contract FR-011
 *
 * GET /info — public endpoint returning system version and metadata.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const infoResponse = z.object({
  version: z.string(),
  environment: z.string(),
  timestamp: z.string(),
});

export async function infoRoute(app: FastifyInstance): Promise<void> {
  app.get('/info', {
    schema: {
      tags: ['system'],
      operationId: 'system_get_info',
      response: { 200: infoResponse },
    },
    handler: async (_request, reply) => {
      return reply.status(200).send({
        version: process.env.APP_VERSION ?? '0.0.1',
        environment: process.env.NODE_ENV ?? 'development',
        timestamp: new Date().toISOString(),
      });
    },
  });
}
