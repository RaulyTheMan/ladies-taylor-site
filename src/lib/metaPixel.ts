export const META_PIXEL_ID = "1080141997916225";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// Best-effort — the pixel script is loaded with strategy="afterInteractive"
// in MetaPixel, so window.fbq may not exist yet if this fires very early
// (blocked by an ad blocker, or before hydration finishes).
export function trackMetaPixelEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", eventName, params);
}

export type MetaCapture = {
  fbp: string | null;
  fbc: string | null;
  eventId: string;
  eventSourceUrl: string;
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Snapshot of Meta's ad-click identifiers, taken at form-submit time.
 *
 * `_fbp` (browser id) and `_fbc` (click id, derived from the `fbclid` Meta
 * appends to ad links) are what let a conversion reported days later be tied
 * back to the ad that produced it. They only exist in the visitor's browser, so
 * if we don't capture them here they're gone the moment the tab closes.
 *
 * When someone lands straight from an ad, `_fbc` may not be written yet — fall
 * back to building it from the URL, which is the format Meta expects.
 */
export function captureMetaSignals(): MetaCapture {
  const fbp = readCookie("_fbp");
  let fbc = readCookie("_fbc");

  if (!fbc && typeof window !== "undefined") {
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
  }

  return {
    fbp,
    fbc,
    // Shared with the server-side event so Meta counts the pair once.
    eventId: crypto.randomUUID(),
    eventSourceUrl:
      typeof window === "undefined" ? "" : window.location.href.split("#")[0],
  };
}

/** Fires the browser pixel event with an id the server event can dedupe against. */
export function trackMetaPixelEventWithId(
  eventName: string,
  eventId: string,
  params?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", eventName, params, { eventID: eventId });
}
