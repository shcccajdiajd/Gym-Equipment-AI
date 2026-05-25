import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { resolveEquipmentPayload } from '../lib/catalog-service.js';
import { RECOGNIZED_CONFIDENCE_THRESHOLD } from '../lib/recognizers/prompt.js';
import { RecognitionProviderError } from '../lib/recognizers/types.js';
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
    const startedAt = Date.now();

    request.log.info(
      {
        source: body.source,
        imageBase64Length: body.imageBase64.length
      },
      'recognition request received'
    );

    let result;

    try {
      result = await recognizer.recognize(body);
    } catch (error) {
      if (error instanceof RecognitionProviderError) {
        const statusCode = error.code === 'timeout' ? 504 : 502;
        request.log.error(
          {
            code: error.code,
            durationMs: Date.now() - startedAt,
            message: error.message
          },
          'recognition provider failed'
        );

        return reply.status(statusCode).send({
          status: error.code === 'timeout' ? 'timeout' : 'error',
          message:
            error.code === 'timeout'
              ? '识别服务响应超时，请稍后重试或换一张更清晰的图片。'
              : '识别服务暂时不可用，请稍后重试。'
        });
      }

      request.log.error(
        {
          durationMs: Date.now() - startedAt,
          error
        },
        'recognition request crashed unexpectedly'
      );
      throw error;
    }

    request.log.info(
      {
        durationMs: Date.now() - startedAt,
        topMatchId: result.topMatchId,
        confidence: result.confidence,
        alternatives: result.alternatives
      },
      'recognition provider completed'
    );

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
      status:
        result.confidence >= RECOGNIZED_CONFIDENCE_THRESHOLD ? 'recognized' : 'low_confidence',
      equipment,
      confidence: result.confidence,
      alternatives: result.alternatives
    };
  });
}
