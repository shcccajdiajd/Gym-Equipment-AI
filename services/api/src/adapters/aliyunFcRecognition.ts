type DebugResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

const DEBUG_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'Content-Type,Authorization'
};

function safeJsonSnippet(value: unknown) {
  try {
    return JSON.stringify(value).slice(0, 2000);
  } catch (error) {
    return `[JSON.stringify failed: ${(error as Error).message}]`;
  }
}

function getObjectKeys(value: unknown) {
  if (!value || typeof value !== 'object') {
    return [];
  }

  return Object.keys(value);
}

function getHeaderValue(headers: unknown, key: string) {
  if (!headers || typeof headers !== 'object') {
    return undefined;
  }

  const record = headers as Record<string, unknown>;
  return record[key] ?? record[key.toLowerCase()] ?? record[key.toUpperCase()];
}

function readMethodCandidate(value: unknown, path: string[]) {
  let current = value as Record<string, unknown> | undefined;

  for (const segment of path) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    current = current[segment] as Record<string, unknown> | undefined;
  }

  return typeof current === 'string' ? current : undefined;
}

function buildDebugResponse(event: unknown, context: unknown, argLength: number): DebugResponse {
  const eventType = typeof event;
  const isBuffer = Buffer.isBuffer(event);
  const eventConstructorName =
    event && typeof event === 'object' ? event.constructor?.name : undefined;
  const eventKeys = getObjectKeys(event);
  const contextKeys = getObjectKeys(context);

  if (isBuffer) {
    console.log('[fc-debug] event buffer preview', event.toString('utf8').slice(0, 2000));
  } else if (typeof event === 'string') {
    console.log('[fc-debug] event string preview', event.slice(0, 2000));
  } else if (event && typeof event === 'object') {
    console.log('[fc-debug] event keys', eventKeys);
    console.log('[fc-debug] event json preview', safeJsonSnippet(event));
  }

  console.log('[fc-debug] typeof event', eventType);
  console.log('[fc-debug] Buffer.isBuffer(event)', isBuffer);
  console.log('[fc-debug] event constructor', eventConstructorName);
  console.log('[fc-debug] context keys', contextKeys);
  console.log('[fc-debug] arguments.length', argLength);

  const methodCandidates = {
    httpMethod: readMethodCandidate(event, ['httpMethod']),
    method: readMethodCandidate(event, ['method']),
    requestContextHttpMethod: readMethodCandidate(event, ['requestContext', 'http', 'method']),
    headersMethod: getHeaderValue((event as { headers?: unknown } | undefined)?.headers, 'x-http-method-override')
  };

  const method = Object.values(methodCandidates).find((value) => typeof value === 'string');
  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: DEBUG_HEADERS,
      body: ''
    };
  }

  return {
    statusCode: 200,
    headers: DEBUG_HEADERS,
    body: JSON.stringify({
      debug: true,
      eventType,
      isBuffer,
      eventConstructorName,
      eventKeys,
      contextKeys,
      argumentsLength: argLength,
      methodCandidates
    })
  };
}

export async function handler(event: unknown, context?: unknown) {
  return buildDebugResponse(event, context, arguments.length);
}

export async function aliyunFcRecognition(event: unknown, context?: unknown) {
  return buildDebugResponse(event, context, arguments.length);
}

export default handler;
