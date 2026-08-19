import { z } from "zod";

/**
 * Shape of the Meta ad-click snapshot the browser sends with a form
 * submission. Shared by the form routes so the client capture helper and the
 * server validation can't drift apart.
 *
 * Every field is nullable: a visitor who never came from an ad, or whose
 * browser blocked the pixel, still submits successfully — they just arrive
 * without attribution data.
 */
export const metaCaptureSchema = z.object({
  fbp: z.string().max(255).nullable(),
  fbc: z.string().max(255).nullable(),
  eventId: z.string().max(100),
  eventSourceUrl: z.string().max(2000),
});

export type MetaCapture = z.infer<typeof metaCaptureSchema>;
