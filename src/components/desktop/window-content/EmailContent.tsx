"use client";

import Image from "next/image";
import { useId, useState } from "react";
import {
  captureMetaSignals,
  trackMetaPixelEventWithId,
} from "@/lib/metaPixel";
import { PRIMARY_BUTTON_CLASS } from "@/lib/ui";

const FIELD_CLASS =
  "border-b border-black/30 bg-transparent pb-1.5 text-xs text-black placeholder:text-black/50 focus:border-black focus:outline-none";

export function EmailContent({
  from,
  subject,
  dateLabel,
  introBody,
  ctaLabel,
}: {
  from?: string;
  subject?: string;
  dateLabel?: string;
  introBody?: string;
  ctaLabel?: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const idPrefix = useId();

  return (
    <div className="flex h-full flex-col overflow-y-auto overscroll-contain bg-lt-cream">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-black/10 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white">
            <Image
              src="/images/logo/logo-mark.png"
              alt="Ladies Taylor"
              width={253}
              height={72}
              className="h-2.5 w-auto"
            />
          </div>
          <span className="truncate text-xs font-bold text-black">
            {from || "ladies.taylor"}
          </span>
        </div>
        {dateLabel && (
          <span className="shrink-0 text-micro text-black/50">{dateLabel}</span>
        )}
      </div>

      {subject && (
        <p className="shrink-0 px-4 pt-3 text-sm font-bold text-black">
          {subject}
        </p>
      )}

      <div className="flex-1 px-4 py-4">
        {submitted ? (
          <p className="py-10 text-center text-sm text-black">
            Thanks — we&rsquo;ll be in touch. 🤙
          </p>
        ) : (
          <form
            className="flex flex-col gap-4"
            aria-describedby={introBody ? `${idPrefix}-intro` : undefined}
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              setError(false);

              try {
                const meta = captureMetaSignals();
                const res = await fetch("/api/contact", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, phone, email, note, meta }),
                });
                if (res.ok) {
                  trackMetaPixelEventWithId("Lead", meta.eventId, {
                    content_name: "Desktop Email Window",
                  });
                  setSubmitted(true);
                } else {
                  setError(true);
                }
              } catch {
                setError(true);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {introBody && (
              <p
                id={`${idPrefix}-intro`}
                className="text-xs leading-relaxed text-black/70"
              >
                {introBody}
              </p>
            )}
            <div>
              <label htmlFor={`${idPrefix}-name`} className="sr-only">
                Name
              </label>
              <input
                id={`${idPrefix}-name`}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className={`${FIELD_CLASS} w-full`}
              />
            </div>
            <div>
              <label htmlFor={`${idPrefix}-phone`} className="sr-only">
                Phone
              </label>
              <input
                id={`${idPrefix}-phone`}
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className={`${FIELD_CLASS} w-full`}
              />
            </div>
            <div>
              <label htmlFor={`${idPrefix}-email`} className="sr-only">
                Email
              </label>
              <input
                id={`${idPrefix}-email`}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={`${FIELD_CLASS} w-full`}
              />
            </div>
            <div>
              <label htmlFor={`${idPrefix}-note`} className="sr-only">
                Note
              </label>
              <textarea
                id={`${idPrefix}-note`}
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Don't be a stranger, say something"
                className={`${FIELD_CLASS} w-full resize-none`}
              />
            </div>

            {error && (
              <p className="text-xs font-semibold text-lt-red">
                Something went wrong. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`${PRIMARY_BUTTON_CLASS} self-start disabled:opacity-60`}
            >
              {submitting ? "Sending..." : ctaLabel || "Send"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
