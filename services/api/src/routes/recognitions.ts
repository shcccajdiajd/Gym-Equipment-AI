import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { resolveEquipmentPayload } from '../lib/catalog-service.js';
import type { Recognizer } from '../lib/recognizers/types.js';

const requestSchema = z.object({
  imageBase64: z.string().min(16),
  source: z.enum(['camera', 'album'])
});

export function registerRecognitionRoutes(app: FastifyInstance, recognizer: Recognizer) {
  app.post('/api/recognitions', async (request, reply) => {
    const parsedBody = requestSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.status(400).send({
        status: 'invalid_request',
        message: '请求参数不合法，请检查图片数据和来源类型。'
      });
    }

    const body = parsedBody.data;
    const result = await recognizer.recognize(body);

    if (!result.topMatchId) {
      return reply.status(200).send({
        status: 'unsupported',
        message: '这类器械暂未收录，请尝试重新拍摄或查看支持列表。'
      });
    }

    const equipment = resolveEquipmentPayload(result.topMatchId);
    if (!equipment) {
      return reply.status(500).send({
        status: 'error',
        message: '识别结果未能映射到器械内容，请检查目录数据。'
      });
    }

    return {
      status: result.confidence >= 0.75 ? 'recognized' : 'low_confidence',
      equipment,
      confidence: result.confidence,
      alternatives: result.alternatives
    };
  });
}
