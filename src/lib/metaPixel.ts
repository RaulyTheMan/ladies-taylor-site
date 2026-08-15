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
