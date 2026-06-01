import { createDefaultRecognizer } from '../core/defaultRecognizer.js';
import { recognizeEquipment } from '../core/recognizeEquipment.js';
import type { RecognitionCoreResponse } from '../core/recognizeEquipment.js';
import type { Recognizer } from '../lib/recognizers/types.js';

type FcEvent = {
  httpMethod?: string;
  method?: string;
  requestMethod?: string;
  rawPath?: string;
  headers?: Record<string, string | string[] | undefined>;
  queryParameters?: Record<string, string | undefined>;
  requestContext?: {
    http?: {
      method?: string;
      path?: string;
    };
  };
  body?: Buffer | string | Record<string, unknown> | null;
  isBase64Encoded?: boolean;
};

type FcResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

type FcHttpRequest = FcEvent & {
  body?: Buffer | string | Record<string, unknown> | null;
};

type FcHttpResponse = {
  setStatusCode(statusCode: number): void;
  setHeader(name: string, value: string): void;
  send(body: string): void;
};

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type,authorization'
};

function compactResponse(payload: RecognitionCoreResponse) {
  return {
    status: payload.status,
    equipmentId: payload.equipmentId,
    confidence: payload.confidence,
    candidates: payload.candidates ?? payload.alternatives,
    message: payload.message,
    errorCode: payload.errorCode
  };
}

function statusCodeForResponse(payload: RecognitionCoreResponse) {
  if (payload.errorCode === 'IMAGE_REQUIRED' || payload.errorCode === 'IMAGE_TOO_LARGE') {
    return 400;
  }
  if (payload.errorCode === 'RECOGNITION_MAPPING_FAILED') {
    return 500;
  }
  if (payload.status === 'timeout') {
    return 504;
  }
  if (payload.status === 'error') {
    return 502;
  }
  return 200;
}

function json(statusCode: number, payload: Record<string, unknown>): FcResponse {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload)
  };
}

function parseHandlerInput(input: unknown): FcEvent {
  if (!input) {
    return {};
  }

  if (Buffer.isBuffer(input)) {
    return JSON.parse(input.toString('utf8')) as FcEvent;
  }

  if (typeof input === 'string') {
    return JSON.parse(input) as FcEvent;
  }

  return input as FcEvent;
}

function parseBody(event: FcEvent) {
  if (!event.body) {
    return {};
  }

  if (Buffer.isBuffer(event.body)) {
    return JSON.parse(event.body.toString('utf8')) as Record<string, unknown>;
  }

  if (typeof event.body === 'object') {
    return event.body;
  }

  const text = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  if (!text.trim()) {
    return {};
  }

  return JSON.parse(text) as Record<string, unknown>;
}

function hasHttpResponseMethods(value: unknown): value is FcHttpResponse {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'setStatusCode' in value &&
      typeof value.setStatusCode === 'function' &&
      'setHeader' in value &&
      typeof value.setHeader === 'function' &&
      'send' in value &&
      typeof value.send === 'function'
  );
}

function getMethod(event: FcEvent) {
  return (event.httpMethod ??
    event.method ??
    event.requestMethod ??
    event.requestContext?.http?.method ??
    'GET').toUpperCase();
}

export async function aliyunFcRecognition(
  event: FcEvent,
  options: { recognizer?: Recognizer } = {}
): Promise<FcResponse> {
  const method = getMethod(event);
  if (method === 'OPTIONS') {
    return json(204, {});
  }

  if (method !== 'POST') {
    return json(405, {
      status: 'error',
      message: '只支持 POST 请求。',
      errorCode: 'METHOD_NOT_ALLOWED'
    });
  }

  let body: Record<string, unknown>;
  try {
    body = parseBody(event);
  } catch {
    return json(400, {
      status: 'invalid_request',
      message: '请求 JSON 解析失败。',
      errorCode: 'INVALID_REQUEST'
    });
  }

  const payload = await recognizeEquipment(
    {
      imageBase64: typeof body.imageBase64 === 'string' ? body.imageBase64 : undefined,
      imageDataUrl: typeof body.imageDataUrl === 'string' ? body.imageDataUrl : undefined,
      source: body.source === 'camera' ? 'camera' : 'album'
    },
    {
      recognizer: options.recognizer ?? createDefaultRecognizer()
    }
  );

  return json(statusCodeForResponse(payload), compactResponse(payload));
}

export async function handler(request: FcHttpRequest | Buffer | string, response?: unknown) {
  let event: FcEvent;
  try {
    event = parseHandlerInput(request);
  } catch {
    const result = json(400, {
      status: 'invalid_request',
      message: '请求 JSON 解析失败。',
      errorCode: 'INVALID_REQUEST'
    });

    if (!hasHttpResponseMethods(response)) {
      return result;
    }

    response.setStatusCode(result.statusCode);
    for (const [name, value] of Object.entries(result.headers)) {
      response.setHeader(name, value);
    }
    response.send(result.body);
    return;
  }

  const result = await aliyunFcRecognition(event);

  if (!hasHttpResponseMethods(response)) {
    return result;
  }

  response.setStatusCode(result.statusCode);
  for (const [name, value] of Object.entries(result.headers)) {
    response.setHeader(name, value);
  }
  response.send(result.body);
}

export default aliyunFcRecognition;
