"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { PRIMARY_BUTTON_CLASS } from "@/lib/ui";

const STEP_TRANSITION = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

// Same anchor economics as the pricing tool (₹75,000 for 6 reels + 6
// carousels, split 50/20/20/10) — this quiz scores four quick questions
// into a recommended piece count, then prices it with the identical
// formula so the two tools never disagree with each other.
const OPERATOR_BASE = 37_500;
const OPERATOR_ADDITIONAL = 25_000;
const TIER_1_MAX_PIECES = 12;
const TIER_2_MAX_PIECES = 24;
const PRODUCTION_PER_PIECE = 1_250;
const REEL_RATE = 2_500;
const CAROUSEL_RATE = 1_250;

function formatRupees(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

type Lean = "reel" | "balanced" | "carousel";
type IndustryOption = { label: string; lean: Lean };
type ScoredOption = { label: string; points: number };

const QUESTION_ORDER = ["industry", "goal", "problem", "existing"] as const;
type QuestionKey = (typeof QUESTION_ORDER)[number];

const QUESTION_PROMPTS: Record<QuestionKey, string> = {
  industry: "What industry are you in?",
  goal: "What's your main goal right now?",
  problem: "What's your biggest content problem?",
  existing: "Do you already have a content routine?",
};

// Industry carries no score — it only sets the reel:carousel mix via
// `lean`. Goal/Problem/Existing drive the volume score. Point values and
// lean assignments are a first-pass judgment call, tune once there's real
// data on how answers map to what clients actually need.
const QUESTIONS: {
  industry: IndustryOption[];
  goal: ScoredOption[];
  problem: ScoredOption[];
  existing: ScoredOption[];
} = {
  industry: [
    { label: "Food & beverage", lean: "reel" },
    { label: "Cafe & restaurant", lean: "reel" },
    { label: "Retail", lean: "balanced" },
    { label: "Fashion", lean: "reel" },
    { label: "Other", lean: "balanced" },
  ],
  goal: [
    { label: "Build brand awareness", points: 4 },
    { label: "Drive sales & leads", points: 6 },
    { label: "Get more foot traffic in store", points: 8 },
    { label: "Build an engaged community", points: 4 },
  ],
  problem: [
    { label: "We're inconsistent, we post occasionally", points: 4 },
    { label: "We don't know what actually performs", points: 2 },
    { label: "Our content doesn't convert into sales", points: 3 },
    { label: "We have zero content, starting from scratch", points: 6 },
    { label: "We're growing too fast to keep up", points: 5 },
  ],
  existing: [
    { label: "Yes, we already post regularly", points: 2 },
    { label: "No, we're just starting out", points: 5 },
  ],
};

type QuizAnswers = {
  industry: IndustryOption;
  goal: ScoredOption;
  problem: ScoredOption;
  existing: ScoredOption;
};

// Score range across all real answer combinations is 8 (calmest) to 19
// (most demanding) — maps to a volume tier with a total piece count.
function tierForScore(score: number) {
  if (score <= 10) return { name: "Starter", total: 8 };
  if (score <= 13) return { name: "Growth", total: TIER_1_MAX_PIECES };
  if (score <= 16) return { name: "Scale", total: 18 };
  return { name: "Max", total: TIER_2_MAX_PIECES };
}

function mixForLean(total: number, lean: Lean) {
  const reelPct = lean === "reel" ? 0.7 : lean === "carousel" ? 0.4 : 0.5;
  const reels = Math.round(total * reelPct);
  const carousels = total - reels;
  return { reels, carousels };
}

// How many creative operators a given piece count needs, and their
// budget line — one operator runs up to 12 pieces, a 2nd takes it to 24
// (which is also the quiz's own ceiling, so this never needs a 3rd).
function operatorInfoFor(deliverables: number) {
  if (deliverables <= TIER_1_MAX_PIECES) {
    return { operators: 1, budget: OPERATOR_BASE };
  }
  return { operators: 2, budget: OPERATOR_BASE + OPERATOR_ADDITIONAL };
}

function computePrice(reels: number, carousels: number) {
  const total = reels + carousels;
  const operator = operatorInfoFor(total);
  const production = total * PRODUCTION_PER_PIECE;
  const reelsCost = reels * REEL_RATE;
  const carouselsCost = carousels * CAROUSEL_RATE;
  const price = operator.budget + production + reelsCost + carouselsCost;
  return {
    reels,
    carousels,
    total,
    operatorBudget: operator.budget,
    operators: operator.operators,
    production,
    reelsCost,
    carouselsCost,
    price,
  };
}

function getRecommendation(answers: QuizAnswers) {
  const score =
    answers.goal.points + answers.problem.points + answers.existing.points;
  const tier = tierForScore(score);
  const mix = mixForLean(tier.total, answers.industry.lean);
  const price = computePrice(mix.reels, mix.carousels);
  return { score, tier, mix, price };
}

const PAGE_MIN_HEIGHT = "min-h-[520px]";

type Step = "cover" | "quiz" | "result";

export default function QuizCard() {
  const [step, setStep] = useState<Step>("cover");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});

  const currentKey = QUESTION_ORDER[questionIndex];

  const selectAnswer = (option: IndustryOption | ScoredOption) => {
    const nextAnswers = {
      ...answers,
      [currentKey]: option,
    } as Partial<QuizAnswers>;
    setAnswers(nextAnswers);

    if (questionIndex < QUESTION_ORDER.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      setStep("result");
    }
  };

  const recommendation = useMemo(() => {
    if (!answers.industry || !answers.goal || !answers.problem || !answers.existing) {
      return null;
    }
    return getRecommendation(answers as QuizAnswers);
  }, [answers]);

  const restart = () => {
    setAnswers({});
    setQuestionIndex(0);
    setStep("cover");
  };

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

      <div className={`overflow-hidden bg-lt-purple px-6 py-16 ${PAGE_MIN_HEIGHT}`}>
      {/* Not `mode="wait"` — gating the next question/result on the previous
          step's exit animation finishing would risk stranding someone
          mid-quiz if that animation stalls or is skipped (reduced motion,
          a slow device). Default mode mounts the next step immediately. */}
      <AnimatePresence>
        {step === "cover" && (
          <motion.div key="cover" {...STEP_TRANSITION} className="flex flex-col items-center gap-8 text-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-white">
                What do you need
              </p>
              <p
                className="font-display text-6xl text-lt-yellow"
                style={{ textShadow: "4px 4px 0 #000" }}
              >
                QUIZ
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep("quiz")}
              aria-label="Start here"
              className="flex flex-col items-center gap-2"
            >
              <span className="comic-border flex h-20 w-20 items-center justify-center rounded-squircle-lg bg-lt-red">
                <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8">
                  <path d="M8 5v14l11-7-11-7z" />
                </svg>
              </span>
              <span className="text-sm font-bold uppercase tracking-wide text-white">
                Start here
              </span>
            </button>

            <p className="text-sm font-semibold text-white/90">
              Find out what services you will need
            </p>
          </motion.div>
        )}

        {step === "quiz" && (
          <motion.div key={`quiz-${questionIndex}`} {...STEP_TRANSITION}>
            <p className="text-xs font-bold uppercase tracking-wide text-white/60">
              Question {questionIndex + 1} of {QUESTION_ORDER.length}
            </p>
            <p className="mt-2 font-gothic text-3xl leading-none text-white">
              {QUESTION_PROMPTS[currentKey]}
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {QUESTIONS[currentKey].map((option) => (
                <motion.button
                  key={option.label}
                  type="button"
                  onClick={() => selectAnswer(option)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="comic-border-sm rounded-squircle-md bg-lt-yellow px-5 py-3 text-left text-sm font-bold text-black"
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "result" && recommendation && (
          <motion.div key="result" {...STEP_TRANSITION}>
            <p className="text-xs font-bold uppercase tracking-wide text-white/60">
              Your recommendation
            </p>
            <p className="mt-2 font-gothic text-3xl leading-none text-white">
              {recommendation.tier.name} plan
            </p>
            <p className="mt-3 text-sm text-white/80">
              Based on your answers, here&rsquo;s what we&rsquo;d recommend to
              hit your goals.
            </p>

            <div className="mt-8 border-t border-white/20 pt-6">
              <p className="text-sm text-white/60">Estimated monthly retainer</p>
              <p
                className="font-display text-5xl leading-none text-lt-yellow"
                style={{ textShadow: "3px 3px 0 #000" }}
              >
                {formatRupees(recommendation.price.price)}
              </p>

              <dl className="mt-6 flex flex-col gap-1.5 text-xs text-white/80">
                <div className="flex justify-between">
                  <dt>Creative operator</dt>
                  <dd>{formatRupees(OPERATOR_BASE)}</dd>
                </div>
                {recommendation.price.operators > 1 && (
                  <div className="flex justify-between">
                    <dt>Additional creative operator</dt>
                    <dd>{formatRupees(OPERATOR_ADDITIONAL)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Production ({recommendation.price.total} pieces)</dt>
                  <dd>{formatRupees(recommendation.price.production)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Reels ({recommendation.mix.reels})</dt>
                  <dd>{formatRupees(recommendation.price.reelsCost)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Carousels ({recommendation.mix.carousels})</dt>
                  <dd>{formatRupees(recommendation.price.carouselsCost)}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 flex items-center gap-5">
              <button
                type="button"
                onClick={scrollToGetInTouch}
                className={PRIMARY_BUTTON_CLASS}
              >
                Get in touch
              </button>
              <button
                type="button"
                onClick={restart}
                className="text-xs font-semibold text-white underline decoration-dashed underline-offset-4"
              >
                Retake quiz
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
