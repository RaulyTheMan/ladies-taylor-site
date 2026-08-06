// A visitor only bumps a given post's view count once per this window,
// tracked client-side (localStorage) — mirrors the cooldown approach already
// used for the live-stream chat rate limit in src/lib/stream.ts.
export const POST_VIEW_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours

export function postViewStorageKey(slug: string) {
  return `lt_viewed_post_${slug}`;
}
