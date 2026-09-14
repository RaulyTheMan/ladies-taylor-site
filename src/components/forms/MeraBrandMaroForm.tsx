"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRIMARY_BUTTON_CLASS } from "@/lib/ui";
import { TERMS, TERMS_VERSION } from "@/lib/meraBrandMaro";

const TOTAL_STEPS = 3;
// Loose on purpose: the server does the real check. This only stops the
// Continue button lighting up for something that's obviously not an email.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = {
  name: string;
  phone: string;
  email: string;
  website: string;
  brandName: string;
  aboutBrand: string;
  whyNoBudget: string;
  terms: boolean[];
};

const EMPTY_STATE: FormState = {
  name: "",
  phone: "",
  email: "",
  website: "",
  brandName: "",
  aboutBrand: "",
  whyNoBudget: "",
  terms: TERMS.map(() => false),
};

const labelClass = "text-xs font-bold uppercase tracking-wide text-black/50";

const inputClass =
  "mt-2 w-full border-b-2 border-black/20 bg-transparent pb-2 text-xl text-black placeholder:text-black/25 focus:border-lt-red focus:outline-none md:text-2xl";

/** Same autofill opt-outs as the August query form; see the note there. */
function noAutofill(field: string) {
  return {
    autoComplete: `off-${field}`,
    "data-1p-ignore": true,
    "data-lpignore": "true",
    "data-form-type": "other",
  } as const;
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

/** A tickable agreement row. Checked rows pick up the site's comic border. */
function TermRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={`flex w-full items-start gap-3 rounded-squircle-sm border-2 px-4 py-3.5 text-left transition-colors ${
        checked
          ? "comic-border-sm border-black bg-lt-yellow"
          : "border-black/15 bg-lt-panel hover:border-black/40"
      }`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-squircle-xs border-2 ${
          checked ? "border-black bg-black text-white" : "border-black/30"
        }`}
      >
        {checked && <Check className="h-4 w-4" strokeWidth={3} />}
      </span>
      <span className="flex-1 text-sm leading-snug text-black md:text-base">{label}</span>
    </button>
  );
}

export default function MeraBrandMaroForm() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormState>(EMPTY_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const firstFieldRefs = useRef<(HTMLInputElement | null)[]>([]);
  const reduceMotion = useReducedMotion();

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setData((d) => ({ ...d, [key]: value })),
    []
  );

  const toggleTerm = useCallback((index: number) => {
    setData((d) => ({
      ...d,
      terms: d.terms.map((value, i) => (i === index ? !value : value)),
    }));
  }, []);

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return (
          data.name.trim().length > 0 &&
          data.phone.trim().length > 0 &&
          EMAIL_PATTERN.test(data.email.trim())
        );
      case 1:
        return (
          data.brandName.trim().length > 0 &&
          data.aboutBrand.trim().length > 0 &&
          data.whyNoBudget.trim().length > 0
        );
      case 2:
        return data.terms.every(Boolean);
      default:
        return false;
    }
  }, [step, data]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!stepValid || submitting) return;
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/mera-brand-maro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email.trim(),
          website: data.website.trim() || undefined,
          brandName: data.brandName,
          aboutBrand: data.aboutBrand,
          whyNoBudget: data.whyNoBudget,
          terms: data.terms,
          termsVersion: TERMS_VERSION,
        }),
      });
      if (res.ok) setSubmitted(true);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }, [stepValid, submitting, data]);

  const advance = useCallback(() => {
    if (!stepValid) return;
    if (step === TOTAL_STEPS - 1) {
      void handleSubmit();
      return;
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, [stepValid, step, handleSubmit]);

  // Enter advances and Shift+Enter goes back, except inside the long-answer
  // boxes, where Enter has to stay a newline.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (submitted || event.key !== "Enter") return;
      if (event.target instanceof HTMLTextAreaElement) return;
      event.preventDefault();
      if (event.shiftKey) goBack();
      else advance();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [submitted, advance, goBack]);

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

  function ContinueRow({ label = "Continue", disabled }: { label?: string; disabled?: boolean }) {
    const off = disabled ?? !stepValid;
    return (
      <div className="mt-9 flex items-center gap-4">
        <motion.button
          type="button"
          onClick={advance}
          disabled={off}
          whileHover={{ scale: off ? 1 : 1.03 }}
          whileTap={{ scale: off ? 1 : 0.97 }}
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
      case 0:
        return (
          <>
            <QuestionHead
              step={step}
              question="First up, who are you?"
              helper="So we know who's behind the brand."
            />
            <div className="mt-6 flex flex-col gap-5 md:mt-8 md:gap-6">
              <label className="block">
                <span className={labelClass}>Your Name</span>
                <input
                  ref={(el) => {
                    firstFieldRefs.current[0] = el;
                  }}
                  type="text"
                  value={data.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Full name"
                  {...noAutofill("name")}
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
                  {...noAutofill("phone")}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Email ID</span>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                  {...noAutofill("email")}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Website (optional)</span>
                <input
                  type="text"
                  inputMode="url"
                  value={data.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="yourbrand.com"
                  {...noAutofill("website")}
                  className={inputClass}
                />
              </label>
            </div>
            <ContinueRow />
          </>
        );
      case 1:
        return (
          <>
            <QuestionHead step={step} question="Now, the brand." />
            <div className="mt-6 flex flex-col gap-5 md:mt-8 md:gap-6">
              <label className="block">
                <span className={labelClass}>Brand Name</span>
                <input
                  ref={(el) => {
                    firstFieldRefs.current[1] = el;
                  }}
                  type="text"
                  value={data.brandName}
                  onChange={(e) => set("brandName", e.target.value)}
                  placeholder="Brand name"
                  {...noAutofill("brand")}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Tell us about your brand</span>
                <textarea
                  value={data.aboutBrand}
                  onChange={(e) => set("aboutBrand", e.target.value)}
                  placeholder="What you make, who it's for, what makes it yours."
                  {...noAutofill("about")}
                  rows={5}
                  maxLength={4000}
                  className={`${inputClass} resize-none text-lg md:text-xl`}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Why can&rsquo;t you spend money on branding?</span>
                <textarea
                  value={data.whyNoBudget}
                  onChange={(e) => set("whyNoBudget", e.target.value)}
                  placeholder="Be honest, we've heard it all."
                  {...noAutofill("why")}
                  rows={3}
                  maxLength={4000}
                  className={`${inputClass} resize-none text-lg md:text-xl`}
                />
              </label>
            </div>
            <ContinueRow />
          </>
        );
      case 2:
        return (
          <>
            <QuestionHead
              step={step}
              question="The fine print."
              helper="All four are required. Read them, they matter."
            />
            <div className="mt-8 flex flex-col gap-2.5">
              {TERMS.map((term, i) => (
                <TermRow
                  key={term}
                  label={term}
                  checked={data.terms[i]}
                  onToggle={() => toggleTerm(i)}
                />
              ))}
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
                  Your brand&rsquo;s in the pile.
                </h1>
                <p className="mx-auto mt-6 max-w-md text-base text-black/70">
                  If we pick it up, you&rsquo;ll see it on our socials first. Keep an eye out.
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
                onAnimationComplete={() => firstFieldRefs.current[step]?.focus()}
              >
                {renderStep()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!submitted && (
        <div className="pointer-events-none fixed bottom-5 right-5 flex gap-px md:right-8">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            aria-label="Previous section"
            className="pointer-events-auto comic-border-sm rounded-l-squircle-sm bg-lt-red px-3 py-2 text-white disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" strokeWidth={3} />
          </button>
          <button
            type="button"
            onClick={advance}
            disabled={!stepValid || step === TOTAL_STEPS - 1}
            aria-label="Next section"
            className="pointer-events-auto comic-border-sm rounded-r-squircle-sm bg-lt-red px-3 py-2 text-white disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
}
