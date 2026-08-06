"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { WorkPost } from "@/lib/work-posts";

export default function PostDetail({ post }: { post: WorkPost }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setActiveIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div>
      <div className="flex items-center gap-3 px-6 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-lt-cream">
          <Image
            src="/images/logo/logo-mark.png"
            alt="Ladies Taylor"
            width={253}
            height={72}
            className="h-3 w-auto"
          />
        </div>
        <span className="text-sm font-bold text-black">ladies.taylor</span>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
      >
        {post.images.map((src, i) => (
          <div
            key={src}
            className="relative aspect-[4/5] w-full shrink-0 snap-center"
          >
            <Image
              src={src}
              alt={`${post.caption} — slide ${i + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {post.images.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-2">
          {post.images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i === activeIndex ? "bg-black" : "bg-black/20"
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 px-6 py-2 text-black">
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            <path
              d="M12 20.5s-7.5-4.6-9.8-9.1C.6 8 2 4.5 5.4 3.6c2.1-.5 4.2.4 5.6 2.2 1.4-1.8 3.5-2.7 5.6-2.2 3.4.9 4.8 4.4 3.2 7.8-2.3 4.5-9.8 9.1-9.8 9.1z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-semibold">{post.likes}</span>
        </span>

        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            <path
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-semibold">{post.comments}</span>
        </span>

        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path
            d="M22 2 11 13"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M22 2 15 22l-4-9-9-4 20-7z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="flex-1" />

        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path
            d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <p className="px-6 text-sm text-black">
        <span className="font-bold">ladies.taylor</span> {post.caption}
      </p>

      <p className="px-6 pb-6 pt-2 text-xs text-black/50">{post.timestamp}</p>
    </div>
  );
}
