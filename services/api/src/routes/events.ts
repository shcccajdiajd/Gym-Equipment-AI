import type { FastifyInstance } from 'fastify';
import { parseAnalyticsEvent } from '../core/analyticsEvents.js';

export function registerEventRoutes(app: FastifyInstance) {
  app.post('/api/events', async (request, reply) => {
    const parsedBody = parseAnalyticsEvent(request.body);

    if (!parsedBody.success) {
      return reply.status(400).send({
        status: 'invalid_request',
        message: '事件参数不合法。',
        errorCode: 'INVALID_EVENT'
      });
    }

    request.log.info(
      {
        analyticsEvent: parsedBody.data
      },
      'analytics event received'
    );

    return reply.status(202).send({ status: 'ok' });
  });
}
