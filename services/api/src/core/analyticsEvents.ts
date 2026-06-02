import { z } from 'zod';

export const analyticsEventNameSchema = z.enum([
  'page_open',
  'upload_start',
  'recognition_success',
  'recognition_error',
  'search_click',
  'copy_query'
]);

export const analyticsEventSchema = z.object({
  visitorId: z.string().min(8).max(96),
  eventName: analyticsEventNameSchema,
  timestamp: z.string().datetime(),
  properties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional()
});

export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;

export function parseAnalyticsEvent(input: unknown) {
  return analyticsEventSchema.safeParse(input);
}
