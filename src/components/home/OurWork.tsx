"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import OurWorkMosaic from "./OurWorkMosaic";
import { WORK_ITEMS } from "@/lib/work-items";

const OLIVE = "#8f8a5f";
// Framer Motion interpolates this numerically, so it can't be a CSS var
// reference — keep in sync with the --color-lt-dark token in globals.css.
const CENTER_COLOR = "#202224";
const ANGLE_STEP = 32;
const MAX_ANGLE = 80;
const PERSPECTIVE = 1200;

// Half the on-screen (sm+) card width, at the center card's (ring 0) size.
const CARD_HALF = 128;

// Each ring out from center is 10% bigger than the ring before it (ring 1
// cards are 1.1x the center, ring 2 cards are 1.1x ring 1).
const RING_SCALE = 1.1;

function ringScale(ring: number) {
  return Math.pow(RING_SCALE, ring);
}

// Even on-screen gap (px) between every card's outer edge and the next
// card's inner edge, outward from center. A flat "cos(angle)" width step
// isn't enough to guarantee this once rotateY gets steep: CSS perspective
// divides a card's *translated position* by the same factor as its local
// width, so far-out cards land closer together than a naive width-based
// step predicts. This gap is solved against that real perspective
// projection rather than approximated.
const CARD_GAP = 90;

function cardOffset(d: number) {
  const dir = Math.sign(d);
  let prevOuterScreen = CARD_HALF; // center card's own edge (theta=0)
  let x = 0;
  for (let k = 0; k < Math.abs(d); k++) {
    const ring = k + 1;
    const half = CARD_HALF * ringScale(ring);
    const theta = (Math.min(ring * ANGLE_STEP, MAX_ANGLE) * Math.PI) / 180;
    const targetInnerScreen = prevOuterScreen + CARD_GAP;
    const z = half * Math.sin(theta);
    // Solve x such that (x - half*cos(theta)) projected through
    // perspective lands exactly at targetInnerScreen.
    x = (targetInnerScreen * (PERSPECTIVE + z)) / PERSPECTIVE + half * Math.cos(theta);
    const outerPretransform = x + half * Math.cos(theta);
    prevOuterScreen = (outerPretransform * PERSPECTIVE) / (PERSPECTIVE - z);
  }
  return dir * x;
}

// A card at this distance or beyond lands well past 2500px of translateX
// (see cardOffset), so it's guaranteed fully cropped by the container at
// any realistic viewport width. That makes it safe to silently re-anchor
// it n slots to the opposite side (instant, no animation — nothing is
// visible there to see it move) once it drifts this far. Without this, a
// card that keeps getting shifted the same direction would drift off
// forever and the "ahead" side would eventually run out of cards, instead
// of actually looping.
const RECYCLE_THRESHOLD = 5;

export default function OurWork() {
  const [activeIndex, setActiveIndex] = useState(4);
  const [wrapOffsets, setWrapOffsets] = useState<number[]>(() =>
    WORK_ITEMS.map(() => 0)
  );
  // Items recycled by the most recent click (see handleClick) — these
  // should skip their transition for this one render, since the jump only
  // happens while they're fully invisible off-screen. Always replaced
  // wholesale on every click (empty when nothing recycled), so it never
  // needs a separate step to reset it for later clicks.
  const [instantSet, setInstantSet] = useState<Set<number>>(() => new Set());
  const n = WORK_ITEMS.length;
  const captionIndex = ((activeIndex % n) + n) % n;

  const handleClick = (i: number, d: number) => {
    const nextActive = activeIndex + d;
    const nextOffsets = wrapOffsets.slice();
    const recycledIds = new Set<number>();
    for (let j = 0; j < n; j++) {
      let dj = j + wrapOffsets[j] * n - nextActive;
      while (dj >= RECYCLE_THRESHOLD) {
        nextOffsets[j] -= 1;
        dj -= n;
        recycledIds.add(j);
      }
      while (dj <= -RECYCLE_THRESHOLD) {
        nextOffsets[j] += 1;
        dj += n;
        recycledIds.add(j);
      }
    }
    setActiveIndex(nextActive);
    setWrapOffsets(nextOffsets);
    setInstantSet(recycledIds);
  };

  return (
    <section className="bg-lt-yellow px-6 py-16 md:py-20">
      <h2 className="text-center font-gothic text-3xl text-black sm:text-4xl">
        our work
      </h2>

      <div className="md:hidden">
        <OurWorkMosaic />
      </div>

      <div className="hidden md:block">
        <div
          className="relative left-1/2 right-1/2 -mx-[50vw] mt-10 flex h-[26rem] w-screen items-center justify-center overflow-hidden sm:h-[40rem]"
          style={{ perspective: `${PERSPECTIVE}px` }}
        >
          {WORK_ITEMS.map((item, i) => {
            const d = i + wrapOffsets[i] * n - activeIndex;
            const abs = Math.abs(d);
            const sign = Math.sign(d);
            const skipAnimation = instantSet.has(i);

            return (
              <motion.button
                key={i}
                type="button"
                onClick={() => handleClick(i, d)}
                aria-label={`View ${item.label}`}
                className="absolute aspect-[9/16] w-40 shrink-0 cursor-pointer appearance-none overflow-hidden rounded-squircle-lg border-0 p-0 sm:w-64"
                animate={{
                  x: cardOffset(d),
                  scale: ringScale(abs),
                  // Negative sign (vs. classic coverflow) so each card's
                  // outer edge tilts toward the viewer and grows, while its
                  // inner edge (facing the center card) recedes and shrinks.
                  rotateY: -sign * Math.min(abs * ANGLE_STEP, MAX_ANGLE),
                  zIndex: 10 - abs,
                  backgroundColor: abs === 0 ? CENTER_COLOR : OLIVE,
                }}
                transition={
                  skipAnimation
                    ? { duration: 0 }
                    : { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                }
              >
                {abs === 0 ? (
                  <video
                    key={item.video}
                    className="h-full w-full object-cover"
                    src={item.video}
                    poster={item.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <Image
                    src={item.poster}
                    alt=""
                    fill
                    sizes="256px"
                    className="object-cover"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={captionIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 text-center text-xs text-black/60"
          >
            {WORK_ITEMS[captionIndex].handle}
            <br />
            <span className="font-semibold">{WORK_ITEMS[captionIndex].label}</span>
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}
