"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRIMARY_BUTTON_CLASS } from "@/lib/ui";
import { captureMetaSignals, trackMetaPixelEventWithId } from "@/lib/metaPixel";
import {
  BUDGETS,
  BUDGET_LABELS,
  FUNNEL_STEPS,
  SERVICES,
  type FunnelStep,
} from "@/lib/augustQuery";

const TOTAL_STEPS = 4;
const ALL_SERVICES = "All of the above";
const AUTO_ADVANCE_MS = 260;
const LETTERS = "ABCDEFGH";

/**
 * Records how far someone got. Uses sendBeacon so the report survives the tab
 * being closed, which is precisely the moment worth capturing, and falls back
 * to a fire-and-forget fetch where sendBeacon is unavailable. Never awaited and
 * never throws: analytics must not be able to break the form.
 */
function reportStep(sessionId: string, step: FunnelStep) {
  try {
    const body = JSON.stringify({ sessionId, step });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/form-progress",
        new Blob([body], { type: "application/json" })
      );
      return;
    }
    void fetch("/api/form-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Ignore: a missing funnel row is never worth surfacing to the user.
  }
}

type FormState = {
  services: string[];
  budget: string;
  companyName: string;
  aboutCompany: string;
  name: string;
  phone: string;
  city: string;
};

const EMPTY_STATE: FormState = {
  services: [],
  budget: "",
  companyName: "",
  aboutCompany: "",
  name: "",
  phone: "",
  city: "",
};

const labelClass = "text-xs font-bold uppercase tracking-wide text-black/50";

const inputClass =
  "mt-2 w-full border-b-2 border-black/20 bg-transparent pb-2 text-xl text-black placeholder:text-black/25 focus:border-lt-red focus:outline-none md:text-2xl";

/** A lettered option row. Selected rows pick up the site's comic border. */
function ChoiceRow({
  letter,
  label,
  selected,
  multi,
  onSelect,
}: {
  letter: string;
  label: string;
  selected: boolean;
  multi: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      role={multi ? undefined : "radio"}
      aria-checked={multi ? undefined : selected}
      aria-pressed={multi ? selected : undefined}
      className={`flex w-full items-center gap-3 rounded-squircle-sm border-2 px-4 py-3.5 text-left transition-colors ${
        selected
          ? "comic-border-sm border-black bg-lt-yellow"
          : "border-black/15 bg-lt-panel hover:border-black/40"
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-squircle-xs border-2 text-micro font-bold ${
          selected ? "border-black bg-black text-white" : "border-black/30 text-black/50"
        }`}
      >
        {letter}
      </span>
      <span className="flex-1 text-base text-black md:text-lg">{label}</span>
      {selected && <Check className="h-5 w-5 shrink-0 text-black" strokeWidth={3} />}
    </button>
  );
}

/** Question index, prompt and optional helper line. */
function QuestionHead({
  step,
  question,
  helper,
}: {
  step: number;
  question: string;
  helper?: string;
}) {
  return (
    <div className="relative">
      <span className="mb-1 block text-xs font-bold text-lt-red md:absolute md:-ml-10 md:mb-0 md:mt-2 md:inline">
        {step + 1}
        <span aria-hidden="true"> →</span>
      </span>
      <h1 className="text-2xl leading-tight text-black md:text-4xl">{question}</h1>
      {helper && <p className="mt-2 text-sm text-black/50 md:text-base">{helper}</p>}
    </div>
  );
}

export default function AugustQueryForm() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormState>(EMPTY_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [challenge, setChallenge] = useState<{ prompt: string; token: string } | null>(
    null
  );
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const firstFieldRef = useRef<HTMLInputElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackedSteps = useRef(new Set<number>());
  // Anonymous, per-visit, and never rendered, so the server and client
  // generating different values is harmless.
  const [sessionId] = useState(() =>
    typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const reduceMotion = useReducedMotion();

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setData((d) => ({ ...d, [key]: value })),
    []
  );

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return challengeAnswer.trim().length > 0 && challenge !== null;
      case 1:
        return data.services.length > 0;
      case 2:
        return data.budget.length > 0;
      case 3:
        return (
          data.name.trim().length > 0 &&
          data.phone.trim().length > 0 &&
          data.city.trim().length > 0 &&
          data.companyName.trim().length > 0
        );
      default:
        return false;
    }
  }, [step, data, challengeAnswer, challenge]);

  // Records the furthest point each visitor reached, so drop-off is visible
  // per question instead of only "submitted or not". Fires once per screen:
  // navigating back and forward again must not count twice.
  useEffect(() => {
    if (trackedSteps.current.has(step)) return;
    trackedSteps.current.add(step);
    reportStep(sessionId, FUNNEL_STEPS[step]);
  }, [step, sessionId]);

  const fetchChallenge = useCallback(async (excludeToken?: string) => {
    const url = excludeToken
      ? `/api/form-challenge?exclude=${encodeURIComponent(excludeToken)}`
      : "/api/form-challenge";
    const res = await fetch(url);
    if (!res.ok) throw new Error("challenge unavailable");
    return (await res.json()) as { prompt: string; token: string };
  }, []);

  /** Swap in a new question. Used by the refresh button and by an expired token. */
  const swapChallenge = useCallback(
    async (excludeToken?: string) => {
      setChallengeLoading(true);
      setChallengeError(null);
      try {
        setChallenge(await fetchChallenge(excludeToken));
        setChallengeAnswer("");
        // The field is focused when the step animates in; after a swap the
        // question arrives later, so put the caret back.
        firstFieldRef.current?.focus();
      } catch {
        setChallenge(null);
        setChallengeError("Couldn't load a question. Try refreshing it.");
      } finally {
        setChallengeLoading(false);
      }
    },
    [fetchChallenge]
  );

  // Load the question up front rather than on the last step: it costs one
  // cheap GET, the token is good for 45 minutes, and it means the final screen
  // never shows a loading state or depends on a transition having completed.
  useEffect(() => {
    let cancelled = false;
    fetchChallenge()
      .then((next) => {
        if (!cancelled) setChallenge(next);
      })
      .catch(() => {
        if (!cancelled) {
          setChallengeError("Couldn't load a question. Try refreshing it.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fetchChallenge]);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  /**
   * Advance only if we're still on `from`. A queued auto-advance timer, or a
   * second click landing on the outgoing screen while it animates out, must
   * not push the user past the next question unanswered.
   */
  const advanceFrom = useCallback((from: number) => {
    setDirection(1);
    setStep((s) => (s === from ? Math.min(s + 1, TOTAL_STEPS - 1) : s));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  /** Single-selects commit and move on, so the click is the whole interaction. */
  const selectAndAdvance = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      const from = step;
      set(key, value);
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => advanceFrom(from), AUTO_ADVANCE_MS);
    },
    [set, advanceFrom, step]
  );

  const toggleService = useCallback((service: string) => {
    setData((d) => {
      if (service === ALL_SERVICES) {
        return { ...d, services: d.services.includes(ALL_SERVICES) ? [] : [ALL_SERVICES] };
      }
      const without = d.services.filter((s) => s !== ALL_SERVICES && s !== service);
      return {
        ...d,
        services: d.services.includes(service) ? without : [...without, service],
      };
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!stepValid || !challenge || submitting) return;
    setSubmitting(true);
    setError(false);
    setChallengeError(null);
    try {
      // Captured before the request so the ad-click identifiers reach the
      // server, which reports the same Lead event via the Conversions API,
      // that copy still lands when an ad blocker suppresses fbq below.
      const meta = captureMetaSignals();

      const res = await fetch("/api/august-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services: data.services,
          budget: data.budget,
          companyName: data.companyName,
          name: data.name,
          phone: data.phone,
          city: data.city,
          aboutCompany: data.aboutCompany || undefined,
          challengeToken: challenge.token,
          challengeAnswer,
          meta,
        }),
      });

      if (res.ok) {
        // Only ever fires on a stored, human-verified submission.
        trackMetaPixelEventWithId("Lead", meta.eventId, {
          content_name: "August Query Form",
        });
        reportStep(sessionId, "submitted");
        setSubmitted(true);
      } else if (res.status === 422) {
        const body = await res.json().catch(() => null);
        if (body?.error === "challenge_expired") {
          // They sat on the form too long. Not their mistake, so hand them a
          // fresh question instead of a wrong-answer message.
          setChallengeError("That question timed out. Here's a new one.");
          void swapChallenge(challenge.token);
        } else {
          // Counted separately from a plain drop-off: people bouncing off the
          // trivia gate means the filter is too tight, not that the form is
          // too long.
          reportStep(sessionId, "challenge_failed");
          setChallengeError("Not quite. Try again, or refresh for a different question.");
        }
        // The gate lives on the first screen, so send them back to it rather
        // than showing an error beside a question that isn't on screen.
        setDirection(-1);
        setStep(0);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }, [stepValid, challenge, submitting, data, challengeAnswer, swapChallenge, sessionId]);

  /**
   * Checks the gate answer before moving on. A network failure lets them
   * through rather than blocking a real person: the submit route re-checks it
   * anyway, so the worst case is finding out later instead of now.
   */
  const verifyGate = useCallback(async () => {
    if (!challenge || verifying) return;
    setVerifying(true);
    setChallengeError(null);
    try {
      const res = await fetch("/api/form-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: challenge.token, answer: challengeAnswer }),
      });
      const body = await res.json().catch(() => null);
      if (body?.ok) {
        goNext();
      } else if (body?.error === "expired") {
        setChallengeError("That question timed out. Here's a new one.");
        void swapChallenge(challenge.token);
      } else {
        reportStep(sessionId, "challenge_failed");
        setChallengeError("Not quite. Try again, or refresh for a different question.");
      }
    } catch {
      goNext();
    } finally {
      setVerifying(false);
    }
  }, [challenge, verifying, challengeAnswer, goNext, swapChallenge, sessionId]);

  const advance = useCallback(() => {
    if (!stepValid) return;
    if (step === TOTAL_STEPS - 1) {
      void handleSubmit();
      return;
    }
    if (step === 0) {
      void verifyGate();
      return;
    }
    goNext();
  }, [stepValid, step, handleSubmit, goNext, verifyGate]);

  // Keyboard: Enter advances, Shift+Enter goes back, letters pick an option.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (submitted) return;
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

      if (event.key === "Enter") {
        event.preventDefault();
        if (event.shiftKey) goBack();
        else advance();
        return;
      }

      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;

      const index = LETTERS.indexOf(event.key.toUpperCase());
      if (index === -1) return;

      const pick = (options: readonly string[], key: keyof FormState) => {
        if (index >= options.length) return;
        event.preventDefault();
        selectAndAdvance(key, options[index] as never);
      };

      if (step === 1 && index < SERVICES.length) {
        event.preventDefault();
        toggleService(SERVICES[index]);
      } else if (step === 2) pick(BUDGETS, "budget");
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step, submitted, advance, goBack, selectAndAdvance, toggleService]);

  const variants = reduceMotion
    ? {
        enter: { opacity: 0, y: 0 },
        center: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 0 },
      }
    : {
        enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 28 : -28 }),
        center: { opacity: 1, y: 0 },
        exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -28 : 28 }),
      };

  const progress = submitted ? 1 : (step + 1) / TOTAL_STEPS;

  function renderChoices(
    options: readonly string[],
    selectedValue: string,
    key: keyof FormState,
    labelFor?: (option: string) => string
  ) {
    return (
      <div role="radiogroup" className="mt-8 flex flex-col gap-2.5">
        {options.map((option, i) => (
          <ChoiceRow
            key={option}
            letter={LETTERS[i]}
            label={labelFor ? labelFor(option) : option}
            selected={selectedValue === option}
            multi={false}
            onSelect={() => selectAndAdvance(key, option as never)}
          />
        ))}
      </div>
    );
  }

  function ContinueRow({
    label = "Continue",
    disabled,
  }: {
    label?: string;
    disabled?: boolean;
  }) {
    return (
      <div className="mt-9 flex items-center gap-4">
        <motion.button
          type="button"
          onClick={advance}
          disabled={disabled ?? !stepValid}
          whileHover={{ scale: disabled ?? !stepValid ? 1 : 1.03 }}
          whileTap={{ scale: disabled ?? !stepValid ? 1 : 0.97 }}
          className={`${PRIMARY_BUTTON_CLASS} inline-flex items-center gap-2 disabled:opacity-30`}
        >
          {label}
          <Check className="h-4 w-4" strokeWidth={3} />
        </motion.button>
        <span className="hidden text-xs text-black/40 md:inline">
          press <span className="font-bold">Enter ↵</span>
        </span>
      </div>
    );
  }

  function renderStep() {
    switch (step) {
      // The gate goes first on purpose. It is the only screen a willing person
      // can fail, so failing it should cost them nothing they have already done.
      case 0:
        return (
          <>
            <QuestionHead
              step={step}
              question={challenge?.prompt ?? "Loading a question..."}
              helper="Quick check that you're a person. Refresh for a different question if this one's no good."
            />
            <div className="mt-8">
              <input
                ref={firstFieldRef}
                type="text"
                value={challengeAnswer}
                onChange={(e) => {
                  setChallengeAnswer(e.target.value);
                  if (challengeError) setChallengeError(null);
                }}
                placeholder="Type your answer here..."
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => void swapChallenge(challenge?.token)}
                disabled={challengeLoading}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-black/40 hover:text-black disabled:opacity-40"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${challengeLoading ? "animate-spin" : ""}`}
                  strokeWidth={3}
                />
                Different question
              </button>
              {challengeError && (
                <p className="mt-3 text-sm font-semibold text-lt-red">{challengeError}</p>
              )}
            </div>
            <ContinueRow
              label={verifying ? "Checking..." : "Continue"}
              disabled={!stepValid || verifying}
            />
          </>
        );
      case 1:
        return (
          <>
            <QuestionHead
              step={step}
              question="What do you need help with?"
              helper="Pick as many as apply."
            />
            <div className="mt-8 flex flex-col gap-2.5">
              {SERVICES.map((service, i) => (
                <ChoiceRow
                  key={service}
                  letter={LETTERS[i]}
                  label={service}
                  selected={data.services.includes(service)}
                  multi
                  onSelect={() => toggleService(service)}
                />
              ))}
            </div>
            <ContinueRow />
          </>
        );
      case 2:
        return (
          <>
            <QuestionHead step={step} question="What's your budget?" />
            {renderChoices(
              BUDGETS,
              data.budget,
              "budget",
              (option) => BUDGET_LABELS[option as keyof typeof BUDGET_LABELS]
            )}
          </>
        );
      case 3:
        return (
          <>
            <QuestionHead
              step={step}
              question="Last bit. Who are you?"
              helper="So we know who to get back to."
            />
            <div className="mt-6 flex flex-col gap-5 md:mt-8 md:gap-6">
              <label className="block">
                <span className={labelClass}>Your Name</span>
                <input
                  ref={firstFieldRef}
                  type="text"
                  value={data.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Full name"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Number</span>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="(+91) Phone number"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>City</span>
                <input
                  type="text"
                  value={data.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Where are you based?"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Company Name</span>
                <input
                  type="text"
                  value={data.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  placeholder="Company name"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>About the company (optional)</span>
                <textarea
                  value={data.aboutCompany}
                  onChange={(e) => set("aboutCompany", e.target.value)}
                  placeholder="Anything that helps us understand what you do."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </label>
            </div>
            {error && (
              <p className="mt-4 text-sm font-semibold text-lt-red">
                Something went wrong. Please try again.
              </p>
            )}
            <ContinueRow
              label={submitting ? "Sending..." : "Send it"}
              disabled={!stepValid || submitting}
            />
          </>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo/logo-mark.png"
            alt="Ladies Taylor"
            width={253}
            height={72}
            className="h-6 w-auto"
          />
        </Link>
        {!submitted && (
          <span className="text-xs font-bold uppercase tracking-wide text-black/50">
            {step + 1} of {TOTAL_STEPS}
          </span>
        )}
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-wide text-black/40 hover:text-black"
        >
          Close
        </Link>
      </header>

      <div className="h-1 w-full bg-black/10">
        {/* scaleX rather than width: animating width from `auto` on a
            full-width bar has no defined start value and stalls. */}
        <motion.div
          className="h-full w-full origin-left bg-lt-red"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-8 md:px-10 md:py-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-center"
              >
                <p className="text-sm font-semibold text-black/60 line-through decoration-lt-red decoration-2">
                  logged.
                </p>
                <h1 className="mt-2 text-4xl font-bold leading-none text-black md:text-5xl">
                  Thanks, we&rsquo;re on it.
                </h1>
                <p className="mx-auto mt-6 max-w-md text-base text-black/70">
                  Someone from the team will reach out shortly. In the meantime, go check
                  out the rest of the site.
                </p>
                <Link href="/" className={`${PRIMARY_BUTTON_CLASS} mt-8 inline-block`}>
                  Back home
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
                // Runs once the incoming screen has settled. Focusing on step
                // change instead would focus the *outgoing* field, which is
                // still mounted while AnimatePresence waits for its exit.
                onAnimationComplete={() => {
                  // The gate and the details screen are the text ones.
                  if (step === 0 || step === TOTAL_STEPS - 1) {
                    firstFieldRef.current?.focus();
                  }
                }}
              >
                {renderStep()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!submitted && (
        <div // Right-hand side at every width: the site's floating badge sits
          // bottom-left and the two would overlap on mobile.
          className="pointer-events-none fixed bottom-5 right-5 flex gap-px md:right-8">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            aria-label="Previous question"
            className="pointer-events-auto comic-border-sm rounded-l-squircle-sm bg-lt-red px-3 py-2 text-white disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" strokeWidth={3} />
          </button>
          <button
            type="button"
            onClick={advance}
            disabled={!stepValid || step === TOTAL_STEPS - 1}
            aria-label="Next question"
            className="pointer-events-auto comic-border-sm rounded-r-squircle-sm bg-lt-red px-3 py-2 text-white disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
}
