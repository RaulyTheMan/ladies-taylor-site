// Falls back to localhost for local dev; set NEXT_PUBLIC_SITE_URL in
// production so absolute URLs (OG images, sitemap, canonical links) resolve
// to the real domain.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "Ladies Taylor";
export const SITE_DESCRIPTION =
  "Social Media, Branding, Web Development and Packaging for consumer brands — done in-house, the right way.";
export const DEFAULT_OG_IMAGE = "/images/logo/logo-mark.png";
