import "server-only";
import { createHash } from "node:crypto";
import { META_PIXEL_ID } from "@/lib/metaPixel";

const GRAPH_VERSION = "v21.0";

/**
 * Server-side Meta Conversions API.
 *
 * Two jobs. First, it backs up the browser pixel: `fbq` is blocked for a
 * meaningful share of visitors by ad blockers, and those conversions are
 * otherwise lost entirely. Second, it carries CRM outcomes back to Meta, so
 * the algorithm learns which ad clicks became real business rather than just
 * which ones produced a form fill.
 *
 * Matching a CRM status change weeks later back to the original ad click needs
 * the `_fbp`/`_fbc` cookies captured at submit time — see captureMetaCookies on
 * the client. Hashed email/phone alone still matches, but far more weakly.
 */

export type MetaUserData = {
  email?: string | null;
  phone?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
};

export type MetaEvent = {
  eventName: string;
  /** Shared with the browser pixel so Meta dedupes the pair. */
  eventId?: string | null;
  eventSourceUrl?: string | null;
  /** "website" for a live page action, "system_generated" for CRM outcomes. */
  actionSource?: "website" | "system_generated";
  eventTime?: number;
  customData?: Record<string, unknown>;
  userData: MetaUserData;
};

/** Meta requires PII to be SHA-256 hashed, normalized to lowercase and trimmed. */
function hash(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Meta matches on E.164 digits without the leading "+". Indian numbers are
 * stored inconsistently across our forms (bare 10-digit, 0-prefixed, +91…),
 * so normalize to a country-coded form before hashing or nothing matches.
 */
function hashPhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.length === 10) digits = `91${digits}`;
  else if (digits.length === 11 && digits.startsWith("0")) digits = `91${digits.slice(1)}`;

  return createHash("sha256").update(digits).digest("hex");
}

function buildUserData(user: MetaUserData): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  if (user.email) data.em = [hash(user.email)];
  if (user.phone) {
    const ph = hashPhone(user.phone);
    if (ph) data.ph = [ph];
  }
  // Not hashed — Meta expects these raw.
  if (user.fbp) data.fbp = user.fbp;
  if (user.fbc) data.fbc = user.fbc;
  if (user.clientIp) data.client_ip_address = user.clientIp;
  if (user.userAgent) data.client_user_agent = user.userAgent;

  return data;
}

/**
 * Best-effort by design: a failed conversion report must never break a form
 * submission or a CRM save. Returns whether Meta accepted the event so callers
 * can record it, and logs failures rather than swallowing them silently.
 */
export async function sendMetaEvent(event: MetaEvent): Promise<boolean> {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) return false;

  const payload: Record<string, unknown> = {
    event_name: event.eventName,
    event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
    action_source: event.actionSource ?? "website",
    user_data: buildUserData(event.userData),
  };

  if (event.eventId) payload.event_id = event.eventId;
  if (event.eventSourceUrl) payload.event_source_url = event.eventSourceUrl;
  if (event.customData) payload.custom_data = event.customData;

  const body: Record<string, unknown> = { data: [payload] };
  // Set while validating in Events Manager → Test Events; unset in production.
  if (process.env.META_CAPI_TEST_EVENT_CODE) {
    body.test_event_code = process.env.META_CAPI_TEST_EVENT_CODE;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(
        `[meta-capi] ${event.eventName} rejected (${response.status}): ${detail.slice(0, 500)}`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[meta-capi] ${event.eventName} failed to send:`, error);
    return false;
  }
}
