import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { createDefaultRecognizer } from '../core/defaultRecognizer.js';
import { parseAnalyticsEvent } from '../core/analyticsEvents.js';
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
  'content-type': 'application/json; charset=utf-8'
};

const STATIC_HEADERS = {
  'content-disposition': 'inline'
};

const STATIC_CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
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

function text(statusCode: number, body: string, contentType: string): FcResponse {
  return {
    statusCode,
    headers: {
      ...STATIC_HEADERS,
      'content-type': contentType
    },
    body
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

function getPath(event: FcEvent) {
  return event.rawPath ?? event.requestContext?.http?.path ?? '/';
}

function isRecognitionApiPath(path: string) {
  return path === '/api/recognitions' || path.startsWith('/api/recognitions?');
}

function isEventApiPath(path: string) {
  return path === '/api/events' || path.startsWith('/api/events?');
}

function getStaticRoot() {
  return resolve(process.env.ALIYUN_FC_STATIC_ROOT ?? 'public');
}

function getStaticFilePath(path: string, staticRoot = getStaticRoot()) {
  const pathname = decodeURIComponent(path.split('?')[0] || '/');
  const relativePath = pathname === '/' ? '/index.html' : pathname;
  const candidate = resolve(staticRoot, `.${relativePath}`);
  const rootPrefix = staticRoot.endsWith(sep) ? staticRoot : `${staticRoot}${sep}`;

  if (candidate !== staticRoot && !candidate.startsWith(rootPrefix)) {
    return undefined;
  }

  return candidate;
}

function serveStaticAsset(path: string): FcResponse {
  const requestedFile = getStaticFilePath(path);

  if (requestedFile && existsSync(requestedFile) && statSync(requestedFile).isFile()) {
    return text(
      200,
      readFileSync(requestedFile, 'utf8'),
      STATIC_CONTENT_TYPES[extname(requestedFile)] ?? 'application/octet-stream'
    );
  }

  if (!path.startsWith('/assets/')) {
    const indexFile = getStaticFilePath('/');
    if (indexFile && existsSync(indexFile) && statSync(indexFile).isFile()) {
      return text(200, readFileSync(indexFile, 'utf8'), STATIC_CONTENT_TYPES['.html']);
    }
  }

  return text(404, 'Not Found', 'text/plain; charset=utf-8');
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

export async function aliyunFcEvent(event: FcEvent): Promise<FcResponse> {
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

  const parsedEvent = parseAnalyticsEvent(body);
  if (!parsedEvent.success) {
    return json(400, {
      status: 'invalid_request',
      message: '事件参数不合法。',
      errorCode: 'INVALID_EVENT'
    });
  }

  console.info(JSON.stringify({
    msg: 'analytics event received',
    analyticsEvent: parsedEvent.data
  }));

  return json(202, { status: 'ok' });
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

  const method = getMethod(event);
  const path = getPath(event);
  if ((method === 'GET' || method === 'HEAD') && !isRecognitionApiPath(path)) {
    const result = serveStaticAsset(path);
    if (method === 'HEAD') {
      result.body = '';
    }

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

  const result = isEventApiPath(path) ? await aliyunFcEvent(event) : await aliyunFcRecognition(event);

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
