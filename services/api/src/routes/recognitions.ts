import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { recognizeEquipment } from '../core/recognizeEquipment.js';
import type { RecognitionCoreResponse } from '../core/recognizeEquipment.js';
import type { Recognizer } from '../lib/recognizers/types.js';

const requestSchema = z.object({
  imageBase64: z.string().optional(),
  imageDataUrl: z.string().optional(),
  source: z.enum(['camera', 'album']).optional()
});

function statusCodeForResponse(response: RecognitionCoreResponse) {
  if (response.errorCode === 'IMAGE_REQUIRED' || response.errorCode === 'IMAGE_TOO_LARGE') {
    return 400;
  }
  if (response.errorCode === 'RECOGNITION_MAPPING_FAILED') {
    return 500;
  }
  if (response.status === 'timeout') {
    return 504;
  }
  if (response.status === 'error') {
    return 502;
  }
  return 200;
}

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
    const startedAt = Date.now();
    const imageBase64Length = (body.imageBase64 ?? body.imageDataUrl ?? '').length;

    request.log.info(
      {
        source: body.source ?? 'album',
        imageBase64Length
      },
      'recognition request received'
    );

    const result = await recognizeEquipment(body, { recognizer });
    const statusCode = statusCodeForResponse(result);

    request.log[statusCode >= 500 ? 'error' : 'info'](
      {
        durationMs: Date.now() - startedAt,
        status: result.status,
        equipmentId: result.equipmentId,
        confidence: result.confidence,
        candidates: result.candidates,
        errorCode: result.errorCode
      },
      statusCode >= 500 ? 'recognition provider failed' : 'recognition provider completed'
    );

    return reply.status(statusCode).send(result);
  });
}
