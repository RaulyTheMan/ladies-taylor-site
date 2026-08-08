"use client";

// A custom cursor for the public site — replaces the OS pointer with a small
// arrow glyph plus a trailing flat-color bubble that cycles through the
// brand's blunt, irreverent one-liners. Adapted from animate-ui.com's Cursor
// primitive (github.com/imskyleen/animate-ui), trimmed to the global-only
// mode we actually use — no new dependency, it runs on the framer-motion
// already used throughout this site. Deliberately flat (no hard-shadow
// "comic border" treatment here): a shadow reads fine on a static card, but
// felt heavy trailing a moving cursor.

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const PHRASES = [
  "Whatsup Bobby",
  "You want success?",
  "Jaldi The Late",
  "Han Shot First",
  "Loser",
  "We don't work with assholes",
  "Asshole",
  "Creator",
  "Branding",
  "Bhaiya mera Brand Maro",
];

const PHRASE_INTERVAL_MS = 2400;
const FOLLOW_OFFSET = 16;

// Matches the visible bubble's text classes exactly — used both to measure
// its fixed size up front and to render the actual phrase, so the two never
// drift apart.
const BUBBLE_TEXT_CLASS =
  "whitespace-nowrap px-3 py-1.5 text-xs font-bold uppercase tracking-wide";

function useFineHoverPointer() {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    // matchMedia doesn't exist during SSR, so this can only be read after
    // mount — state starts false (matching the server render) and is
    // corrected here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setSupported(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return supported;
}

function CursorInner() {
  const [active, setActive] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [bubbleSize, setBubbleSize] = useState<{ width: number; height: number } | null>(
    null
  );
  const measureRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Nudges the arrow so its tip (not the SVG's bounding-box corner) sits at
  // the actual pointer position — baked into the target value for the same
  // reason as the bubble's offset below.
  const arrowX = useTransform(x, (v) => v - 3);
  const arrowY = useTransform(y, (v) => v - 3);
  // The gap between the arrow and the bubble is baked directly into these
  // target values (rather than applied as a separate `transform` string on
  // the bubble) — framer-motion generates its own transform to animate
  // `scale`/`opacity` on that element, and a hand-written `transform` in
  // `style` gets silently overridden by that whenever they're on the same
  // element, which would just drop the offset entirely.
  const offsetX = useTransform(x, (v) => v + FOLLOW_OFFSET);
  const offsetY = useTransform(y, (v) => v + FOLLOW_OFFSET);
  const followX = useSpring(offsetX, { stiffness: 500, damping: 50 });
  const followY = useSpring(offsetY, { stiffness: 500, damping: 50 });

  // Sizes the bubble to the widest/tallest phrase once, up front, so
  // swapping phrases only ever animates the text — the box itself never
  // resizes (both dimensions, not just width — with only width fixed, the
  // outgoing and incoming phrase spans still briefly coexist in normal
  // document flow and stack on top of each other, inflating the height).
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    let widest = 0;
    let tallest = 0;
    for (const child of el.children) {
      const rect = child as HTMLElement;
      widest = Math.max(widest, rect.offsetWidth);
      tallest = Math.max(tallest, rect.offsetHeight);
    }
    setBubbleSize({ width: widest, height: tallest });
  }, []);

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
      setActive(true);
    }
    function handlePointerOut(e: PointerEvent) {
      if (e.relatedTarget === null) setActive(false);
    }
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") setActive(false);
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerOut, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [x, y]);

  // Hides the real OS cursor only while the custom one is actually active,
  // so nothing looks broken if JS is slow to hydrate or the effect is torn
  // down (route change while a tab is backgrounded, etc).
  useEffect(() => {
    if (!active) return;
    document.documentElement.classList.add("lt-cursor-none");
    return () => document.documentElement.classList.remove("lt-cursor-none");
  }, [active]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % PHRASES.length);
    }, PHRASE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Off-screen, never visible — exists purely to measure the widest
          phrase so the bubble below can be given a fixed width up front. */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 -z-10 opacity-0"
      >
        {PHRASES.map((phrase) => (
          <span key={phrase} className={`block ${BUBBLE_TEXT_CLASS}`}>
            {phrase}
          </span>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <>
            <motion.svg
              key="dot"
              aria-hidden
              viewBox="0 0 40 40"
              style={{
                position: "fixed",
                top: arrowY,
                left: arrowX,
                pointerEvents: "none",
                zIndex: 9999,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="h-5 w-5"
            >
              <path
                fill="var(--color-lt-red)"
                stroke="var(--color-lt-dark)"
                strokeWidth="1.5"
                strokeLinejoin="round"
                d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z"
              />
            </motion.svg>

            <motion.div
              key="follow"
              aria-hidden
              style={{
                position: "fixed",
                top: followY,
                left: followX,
                pointerEvents: "none",
                zIndex: 9998,
                width: bubbleSize?.width,
                height: bubbleSize?.height,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="overflow-hidden rounded-squircle-xs border-2 border-lt-dark bg-lt-red"
            >
              {/* Absolutely positioned (rather than stacked in normal flow)
                  so the outgoing and incoming phrase overlap in place during
                  the crossfade instead of both taking up their own row —
                  that stacking was exactly what made the box balloon in
                  height on every swap. */}
              <AnimatePresence initial={false}>
                <motion.span
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute inset-0 flex items-center justify-center ${BUBBLE_TEXT_CLASS} text-white`}
                >
                  {PHRASES[phraseIndex]}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function SiteCursor() {
  const pathname = usePathname();
  const hasFineHoverPointer = useFineHoverPointer();
  const reduceMotion = useReducedMotion();
  const canShow = hasFineHoverPointer && !reduceMotion;

  // The admin CMS deliberately uses a plain, minimal look distinct from the
  // public "flyer" brand system (see DESIGN.md) — this playful cursor has
  // no business there.
  if (pathname?.startsWith("/admin")) return null;
  if (!canShow) return null;

  return <CursorInner />;
}
