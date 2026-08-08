"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { homeNav } from "@/lib/nav";
import { workPosts } from "@/lib/work-posts";
import { StaggerGrid, StaggerItem } from "@/components/StaggerGrid";
import MobileNavBar from "./MobileNavBar";
import PostFeed from "./PostFeed";

const STATS = [
  { value: "25", label: "clients" },
  { value: "30", label: "taylors" },
  { value: "78", label: "projects" },
];

// Grid is 9 cells: the first 3 are the special interfaces (contact/quiz/
// pricing), the remaining 6 are real posts — both live in the same
// PostFeed, at the same indices as the grid itself.
const GRID_SIZE = 9;

// Grid thumbnails use rasterized JPGs, not the source SVGs directly — the
// SVGs' fine text/strokes vanish when a browser rasterizes them down to a
// ~120px-wide <img>, leaving just the flat background color.
const SPECIAL_SLOTS: {
  image: string;
  label: string;
  stroke?: boolean;
  unoptimized?: boolean;
}[] = [
  // "Get in touch" is yellow-on-yellow like the page background, so it
  // needs its own edge to read as a distinct thumbnail in the grid.
  { image: "/images/special/contact-thumb.jpg", label: "Get in touch", stroke: true },
  { image: "/images/special/quiz-thumb.jpg", label: "Quiz" },
  { image: "/images/special/pricing-thumb.png", label: "Pricing", unoptimized: true },
];

export default function MobileHero() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-lt-yellow">
      <MobileNavBar items={homeNav} />

      <div className="flex items-start gap-3 px-6 pt-8">
        <div className="relative flex h-[110px] w-[110px] shrink-0 items-center justify-center rounded-full border border-black/10 bg-lt-cream">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-lt-yellow">
            <Image
              src="/images/logo/logo-mark.png"
              alt="Ladies Taylor"
              width={253}
              height={72}
              className="h-6 w-auto"
              priority
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2 pt-1">
          <div>
            <h1 className="font-gothic text-2xl leading-none text-black">
              ladies.taylor
            </h1>
            <p className="mt-1 text-sm text-black/70">Ladies Taylor</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-black">
            {STATS.map((stat) => (
              <span key={stat.label} className="whitespace-nowrap">
                <span className="font-bold">{stat.value}</span>{" "}
                <span className="text-black/70">{stat.label}</span>
              </span>
            ))}
          </div>

          <p className="text-xs leading-relaxed text-black/80">
            Welcome to a space dedicated to consumer brands. Branding,
            Packaging and Social Media Management done the right way 🧡🤍💜
          </p>
        </div>
      </div>

      {/* Deliberately not `mode="wait"` — that would gate mounting the new
          view on the old one's exit animation finishing, so tapping into a
          post could hang on a stalled/skipped animation (slow device,
          reduced motion, throttled background tab) instead of switching
          immediately. Default mode mounts the entering view right away and
          lets the exiting one fade out independently. */}
      <AnimatePresence>
        {openIndex !== null ? (
          <motion.div
            key="feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-10"
          >
            <PostFeed initialIndex={openIndex} onClose={() => setOpenIndex(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <StaggerGrid className="mt-10 grid grid-cols-3 gap-1 p-1">
              {Array.from({ length: GRID_SIZE }).map((_, i) => {
                const special = SPECIAL_SLOTS[i];
                if (special) {
                  return (
                    <StaggerItem key={i}>
                      <button
                        type="button"
                        onClick={() => setOpenIndex(i)}
                        className={`relative aspect-[4/5] w-full ${special.stroke ? "border border-black" : ""}`}
                      >
                        <Image
                          src={special.image}
                          alt={special.label}
                          fill
                          className="object-cover"
                          sizes="33vw"
                          unoptimized={special.unoptimized}
                        />
                      </button>
                    </StaggerItem>
                  );
                }

                const post = workPosts[i - SPECIAL_SLOTS.length];

                if (!post) {
                  return (
                    <StaggerItem key={i}>
                      <div className="aspect-[4/5] bg-lt-gray" />
                    </StaggerItem>
                  );
                }

                return (
                  <StaggerItem key={i}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(i)}
                      className="relative aspect-[4/5] w-full"
                    >
                      <Image
                        src={post.images[0]}
                        alt={post.caption}
                        fill
                        className="object-cover"
                        sizes="33vw"
                      />
                    </button>
                  </StaggerItem>
                );
              })}
            </StaggerGrid>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
