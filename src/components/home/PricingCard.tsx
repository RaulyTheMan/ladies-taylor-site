"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { PRIMARY_BUTTON_CLASS } from "@/lib/ui";

const STEP_TRANSITION = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

// Pricing engine — one anchor (₹75,000 for 6 reels + 6 carousels), split by
// percentage into four buckets, three of which become per-piece rates:
//   Creative Operator 50% of 75,000  = 37,500 flat
//   Production        20% of 75,000  = 15,000 / 12 pieces = 1,250 per piece
//   Reels             20% of 75,000  = 15,000 / 6 reels    = 2,500 per reel
//   Carousels         10% of 75,000  =  7,500 / 6 carousels = 1,250 per carousel
// total = operator budget + (pieces × 1,250) + (reels × 2,500) + (carousels × 1,250)
// Capacity is a step function, not a smooth curve: one operator covers up
// to 12 pieces. Past that the user has to explicitly add a second creative
// operator (+25,000, matching the original 37,500 → 62,500 jump) to unlock
// capacity up to 24 — a hard wall past that, no third operator.
const OPERATOR_BASE = 37_500;
const OPERATOR_ADDITIONAL = 25_000;
const TIER_1_MAX_PIECES = 12;
const TIER_2_MAX_PIECES = 24;
const PRODUCTION_PER_PIECE = 1_250;
const REEL_RATE = 2_500;
const CAROUSEL_RATE = 1_250;
const BOOST_COST = 15_000;
const MAX_BOOSTS = 3;

// Consistent height across all 3 steps so clicking through doesn't jump
// the surrounding feed content around.
const PAGE_MIN_HEIGHT = "min-h-[520px]";

function formatRupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

// Shrinks its own font-size until the text actually fits its container,
// measured against the real rendered width in the browser rather than a
// guessed character-width ratio — Druk Wide doesn't scale linearly enough
// at small sizes for a fixed clamp() formula to be reliably correct.
// useLayoutEffect applies the fitted size before paint, so there's no
// flash of oversized/cut-off text first.
function FitHeadline({
  children,
  className,
  minFontSize,
  maxFontSize,
}: {
  children: React.ReactNode;
  className?: string;
  minFontSize: number;
  maxFontSize: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      let size = maxFontSize;
      el.style.fontSize = `${size}px`;
      while (el.scrollWidth > el.offsetWidth && size > minFontSize) {
        size -= 1;
        el.style.fontSize = `${size}px`;
      }
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [minFontSize, maxFontSize]);

  return (
    <p ref={ref} className={className} style={{ fontSize: minFontSize }}>
      {children}
    </p>
  );
}

function Stepper({
  label,
  value,
  onIncrement,
  onDecrement,
  disableIncrement,
}: {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disableIncrement?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-black">{label}</span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onDecrement}
          aria-label={`Decrease ${label}`}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-black text-black"
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-bold text-black">
          {value}
        </span>
        <button
          type="button"
          disabled={disableIncrement}
          onClick={onIncrement}
          aria-label={`Increase ${label}`}
          className={`flex h-7 w-7 items-center justify-center rounded-full border border-black text-black ${
            disableIncrement ? "opacity-30" : ""
          }`}
        >
          +
        </button>
      </div>
    </div>
  );
}

type Step = "cover" | "tool" | "terms";

export default function PricingCard() {
  const [step, setStep] = useState<Step>("cover");
  const [reels, setReels] = useState(6);
  const [carousels, setCarousels] = useState(6);
  const [boosts, setBoosts] = useState(0);
  const [extraOperator, setExtraOperator] = useState(false);

  const totalPieces = reels + carousels;
  const capacity = extraOperator ? TIER_2_MAX_PIECES : TIER_1_MAX_PIECES;
  const atCapacity = totalPieces >= capacity;
  const canAddOperator = !extraOperator && totalPieces >= TIER_1_MAX_PIECES;

  // Guard the cap inside the updater itself (using the value each setter
  // sees when React actually applies it), not just via the button's
  // `disabled` attribute — a burst of clicks fired before a re-render
  // commits would otherwise all land, since a not-yet-rerendered disabled
  // attribute doesn't stop a click that's already been dispatched.
  const incrementReels = () =>
    setReels((prev) => (prev + carousels < capacity ? prev + 1 : prev));
  const incrementCarousels = () =>
    setCarousels((prev) => (reels + prev < capacity ? prev + 1 : prev));
  const incrementBoosts = () =>
    setBoosts((prev) => (prev < MAX_BOOSTS ? prev + 1 : prev));

  const operatorBudget = OPERATOR_BASE + (extraOperator ? OPERATOR_ADDITIONAL : 0);
  const productionCost = totalPieces * PRODUCTION_PER_PIECE;
  const reelsCost = reels * REEL_RATE;
  const carouselsCost = carousels * CAROUSEL_RATE;
  const boostCost = boosts * BOOST_COST;
  const total =
    operatorBudget + productionCost + reelsCost + carouselsCost + boostCost;

  const scrollToGetInTouch = () => {
    document
      .getElementById("feed-get-in-touch")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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

      <div className={`overflow-hidden bg-lt-cream px-6 py-16 ${PAGE_MIN_HEIGHT}`}>
      {/* Not `mode="wait"` — gating the next step on the previous one's exit
          animation finishing would risk stranding someone mid-flow if that
          animation stalls or is skipped (reduced motion, a slow device).
          Default mode mounts the next step immediately. */}
      <AnimatePresence>
        {step === "cover" && (
          <motion.div key="cover" {...STEP_TRANSITION}>
            <p className="text-2xl text-black">but what about</p>
            <FitHeadline
              className="font-display leading-none text-lt-yellow"
              minFontSize={20}
              maxFontSize={48}
            >
              PRICING?
            </FitHeadline>

            <p className="mt-6 max-w-xs text-lg text-black">
              Find out how much it will cost for your requirement
            </p>

            <button
              type="button"
              onClick={() => setStep("tool")}
              className={`${PRIMARY_BUTTON_CLASS} mt-8`}
            >
              Click here
            </button>
          </motion.div>
        )}

        {step === "tool" && (
          <motion.div key="tool" {...STEP_TRANSITION}>
            <p className="font-gothic text-3xl leading-none text-black">
              Build your quote
            </p>
            <p className="mt-2 text-sm text-black/70">
              Reels and carousels, priced live.
            </p>

            <div className="mt-8 flex flex-col gap-5">
              <Stepper
                label="Reels"
                value={reels}
                onIncrement={incrementReels}
                onDecrement={() => setReels((prev) => Math.max(0, prev - 1))}
                disableIncrement={atCapacity}
              />
              <Stepper
                label="Carousels"
                value={carousels}
                onIncrement={incrementCarousels}
                onDecrement={() => setCarousels((prev) => Math.max(0, prev - 1))}
                disableIncrement={atCapacity}
              />
              <Stepper
                label="Production boost"
                value={boosts}
                onIncrement={incrementBoosts}
                onDecrement={() => setBoosts((prev) => Math.max(0, prev - 1))}
                disableIncrement={boosts >= MAX_BOOSTS}
              />
            </div>

            {canAddOperator && (
              <button
                type="button"
                onClick={() => setExtraOperator(true)}
                className="comic-border-sm mt-6 w-full rounded-squircle-md bg-lt-dark px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white"
              >
                + Add a creative operator
              </button>
            )}

            {extraOperator && atCapacity && (
              <p className="mt-4 text-xs text-black/60">
                {`You've hit our monthly cap (${TIER_2_MAX_PIECES} pieces) — quality over quantity.`}
              </p>
            )}

            <div className="mt-8 border-t border-black/10 pt-6">
              <p className="text-sm text-black/60">Estimated monthly retainer</p>
              <p
                className="font-display text-5xl leading-none text-lt-yellow"
                style={{ textShadow: "3px 3px 0 #000" }}
              >
                {formatRupees(total)}
              </p>

              <dl className="mt-6 flex flex-col gap-1.5 text-xs text-black/70">
                <div className="flex justify-between">
                  <dt>Creative operator</dt>
                  <dd>{formatRupees(OPERATOR_BASE)}</dd>
                </div>
                {extraOperator && (
                  <div className="flex justify-between">
                    <dt>Additional creative operator</dt>
                    <dd>{formatRupees(OPERATOR_ADDITIONAL)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Production ({totalPieces} pieces)</dt>
                  <dd>{formatRupees(productionCost)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Reels ({reels})</dt>
                  <dd>{formatRupees(reelsCost)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Carousels ({carousels})</dt>
                  <dd>{formatRupees(carouselsCost)}</dd>
                </div>
                {boosts > 0 && (
                  <div className="flex justify-between">
                    <dt>Production boost ×{boosts}</dt>
                    <dd>{formatRupees(boostCost)}</dd>
                  </div>
                )}
              </dl>
            </div>

            <button
              type="button"
              onClick={() => setStep("terms")}
              className={`${PRIMARY_BUTTON_CLASS} mt-8 w-full`}
            >
              What next?
            </button>
          </motion.div>
        )}

        {step === "terms" && (
          <motion.div key="terms" {...STEP_TRANSITION}>
            <p className="font-gothic text-3xl leading-none text-black">
              Good to know
            </p>

            <p className="mt-6 text-sm leading-relaxed text-black/80">
              This is just a tool to give you an approximation of the costs —
              based on your requirement, the costing will change. Please
              remember all brands are different, so it&rsquo;s not a
              one-stop-shop solution for all.
            </p>

            <button
              type="button"
              onClick={scrollToGetInTouch}
              className={`${PRIMARY_BUTTON_CLASS} mt-8`}
            >
              Get in touch
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
