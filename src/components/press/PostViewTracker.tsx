"use client";

import { useEffect } from "react";
import { POST_VIEW_COOLDOWN_MS, postViewStorageKey } from "@/lib/postViews";

// Invisible — fires a fire-and-forget view-count bump once per visitor per
// post per cooldown window. Lives client-side (not in getPostBySlug) so SSR
// renders and prefetches never count as a view.
export default function PostViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = postViewStorageKey(slug);
    const lastViewed = Number(window.localStorage.getItem(key) ?? 0);
    if (Date.now() - lastViewed < POST_VIEW_COOLDOWN_MS) return;

    window.localStorage.setItem(key, String(Date.now()));
    fetch(`/api/blog/${slug}/view`, { method: "POST" }).catch(() => {
      // Best-effort — a failed view bump shouldn't disrupt reading the post.
    });
  }, [slug]);

  return null;
}
