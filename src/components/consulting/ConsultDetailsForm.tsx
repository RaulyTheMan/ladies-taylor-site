"use client";

import { useEffect, useRef } from "react";
import { formatRupees } from "@/lib/consulting/time";

const FIELD_CLASS =
  "mt-1.5 w-full rounded-squircle-xs border border-black/15 bg-black/[0.06] px-3 py-2 text-sm text-black outline-none transition-colors placeholder:text-black/40 focus:border-black focus:bg-white";
const LABEL_CLASS = "block text-sm text-black";

export default function ConsultDetailsForm({
  priceInr,
  submitting,
  error,
  onBack,
  onSubmit,
}: {
  priceInr: number;
  submitting: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: (values: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  }) => void;
}) {
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  return (
    <form
      className="flex flex-col gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        onSubmit({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          notes: String(data.get("notes") ?? ""),
        });
      }}
    >
      <div>
        <h2 className="text-lg font-extrabold text-black">Your details</h2>
        <p className="mt-1 text-sm text-black/60">
          We&apos;ll use these to reach you about the call.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={LABEL_CLASS}>
          Name <span aria-hidden="true">*</span>
          <input ref={firstFieldRef} name="name" required maxLength={200} className={FIELD_CLASS} />
        </label>

        <label className={LABEL_CLASS}>
          Email <span aria-hidden="true">*</span>
          <input name="email" type="email" required maxLength={200} className={FIELD_CLASS} />
        </label>
      </div>

      <label className={LABEL_CLASS}>
        Phone <span aria-hidden="true">*</span>
        <input name="phone" type="tel" required maxLength={50} className={FIELD_CLASS} />
      </label>

      <label className={LABEL_CLASS}>
        What do you want to cover?
        <textarea name="notes" rows={3} maxLength={2000} className={FIELD_CLASS} />
      </label>

      {error && (
        <p role="alert" className="text-sm font-semibold text-lt-red">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="comic-border-sm rounded-squircle-md bg-lt-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-60"
        >
          {submitting
            ? "Taking you to payment..."
            : priceInr === 0
              ? "Confirm booking"
              : `Continue to pay ${formatRupees(priceInr)}`}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-black underline underline-offset-2"
        >
          Pick another time
        </button>
      </div>

      <p className="text-xs text-black/50">
        {priceInr === 0
          ? "We'll confirm straight away."
          : "You'll pay on Razorpay's secure page, then come back here. Your slot is held for 20 minutes."}
      </p>
    </form>
  );
}
