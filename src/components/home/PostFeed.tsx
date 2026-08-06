"use client";

import { useEffect, useRef } from "react";
import { workPosts } from "@/lib/work-posts";
import PostDetail from "./PostDetail";
import ContactFormCard from "./ContactFormCard";
import QuizCard from "./QuizCard";
import PricingCard from "./PricingCard";

export default function PostFeed({
  initialIndex,
  onClose,
}: {
  initialIndex: number;
  onClose: () => void;
}) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current[initialIndex]?.scrollIntoView({ block: "start" });
  }, [initialIndex]);

  // Matches the grid's own order exactly: the 3 special slots (positions
  // 0-2), then the real posts (positions 3-8) — so a grid cell's index is
  // always this list's index too.
  const items = [
    <ContactFormCard key="contact" />,
    <QuizCard key="quiz" />,
    <PricingCard key="pricing" />,
    ...workPosts.map((post, i) => <PostDetail key={i} post={post} />),
  ];

  return (
    <div>
      <div className="flex items-center gap-3 px-6 py-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to grid"
          className="flex h-8 w-8 items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="text-sm font-bold text-black">ladies.taylor</span>
      </div>

      {items.map((item, i) => (
        <div
          key={i}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          className={i === 0 ? "" : "mt-6 border-t border-black/10 pt-6"}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
