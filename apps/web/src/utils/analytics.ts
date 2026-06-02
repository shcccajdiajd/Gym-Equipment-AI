export type AnalyticsEventName =
  | 'page_open'
  | 'upload_start'
  | 'recognition_success'
  | 'recognition_error'
  | 'search_click'
  | 'copy_query';

type AnalyticsEventProperties = Record<string, string | number | boolean | null>;

type TrackEventOptions = {
  fetcher?: typeof fetch;
  storage?: Storage;
  properties?: AnalyticsEventProperties;
};

const VISITOR_ID_KEY = 'gym-equipment-ai:visitor-id';

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || '';
}

export function getEventEndpoint(inputBaseUrl = getApiBaseUrl()) {
  const baseUrl = inputBaseUrl.replace(/\/$/, '');

  if (!baseUrl) {
    return '/api/events';
  }

  if (baseUrl.endsWith('/api/events')) {
    return baseUrl;
  }

  if (baseUrl.endsWith('/api/recognitions')) {
    return baseUrl.replace(/\/api\/recognitions$/, '/api/events');
  }

  return `${baseUrl}/api/events`;
}

function createVisitorId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `visitor_${crypto.randomUUID()}`;
  }

  return `visitor_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateVisitorId(storage: Storage = localStorage) {
  const existing = storage.getItem(VISITOR_ID_KEY);
  if (existing) {
    return existing;
  }

  const visitorId = createVisitorId();
  storage.setItem(VISITOR_ID_KEY, visitorId);
  return visitorId;
}

export async function trackEvent(eventName: AnalyticsEventName, options: TrackEventOptions = {}) {
  if (typeof localStorage === 'undefined' && !options.storage) {
    return;
  }

  const storage = options.storage ?? localStorage;
  const fetcher = options.fetcher ?? fetch;

  try {
    await fetcher(getEventEndpoint(), {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        visitorId: getOrCreateVisitorId(storage),
        eventName,
        timestamp: new Date().toISOString(),
        properties: options.properties
      }),
      keepalive: true
    });
  } catch {
    // Analytics must never block the recognition flow.
  }
}
