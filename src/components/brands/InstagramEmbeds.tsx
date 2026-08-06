"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    instgrm?: {
      Embeds: { process: () => void };
    };
  }
}

export type EmbeddablePost = {
  permalink: string;
  html: string | null;
};

export default function InstagramEmbeds({ posts }: { posts: EmbeddablePost[] }) {
  // Instagram's script only auto-processes blockquotes present when it
  // first runs. Client-side route changes (list -> detail, no full reload)
  // can land on a page whose blockquotes it never sees, so re-process
  // explicitly whenever this set of posts mounts.
  useEffect(() => {
    window.instgrm?.Embeds?.process();
  }, [posts]);

  return (
    <>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => window.instgrm?.Embeds?.process()}
      />
      <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
        {posts.map((post) =>
          post.html ? (
            <div
              key={post.permalink}
              className="mb-4 break-inside-avoid"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          ) : (
            <a
              key={post.permalink}
              href={post.permalink}
              target="_blank"
              rel="noreferrer noopener"
              className="mb-4 flex aspect-square break-inside-avoid items-center justify-center rounded-squircle-sm border-2 border-dashed border-black/20 p-4 text-center text-xs text-black/50"
            >
              Post unavailable — view on Instagram
            </a>
          )
        )}
      </div>
    </>
  );
}
