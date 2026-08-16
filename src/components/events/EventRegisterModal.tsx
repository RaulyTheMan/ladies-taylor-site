"use client";

import { useEffect, useRef, useState } from "react";

const FIELD_CLASS =
  "mt-1.5 w-full rounded-squircle-xs border border-black/15 bg-black/[0.06] px-3 py-2 text-sm text-black outline-none transition-colors placeholder:text-black/40 focus:border-black focus:bg-white";

const LABEL_CLASS = "block text-sm text-black";

type Result = "registered" | "waiting" | "error" | null;

export default function EventRegisterModal({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Escape-to-close plus a scroll lock, so the page behind the dimmed
  // backdrop can't be scrolled away while the dialog is up.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch(`/api/events/${slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          reason: formData.get("reason") || undefined,
          brandName: formData.get("brandName") || undefined,
          designation: formData.get("designation") || undefined,
        }),
      });
      const data = await res.json();
      setResult(res.ok ? data.status : "error");
    } catch {
      setResult("error");
    } finally {
      setSubmitting(false);
    }
  }

  const done = result === "registered" || result === "waiting";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="comic-border-sm mt-6 rounded-squircle-md bg-lt-red px-7 py-3 text-base font-bold uppercase tracking-wide text-white"
      >
        Join Guest List
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[10002] flex items-start justify-center overflow-y-auto bg-black/25 p-4 backdrop-blur-sm sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-modal-title"
            className="my-auto w-full max-w-md rounded-squircle-xl border border-black/10 bg-white p-7 shadow-2xl"
          >
            <h2
              id="register-modal-title"
              className="text-lg font-bold text-black"
            >
              Join The Waiting List
            </h2>

            {done ? (
              <>
                <p className="mt-4 text-sm leading-relaxed text-black/80">
                  {result === "registered"
                    ? "You're registered — see you there. 🤙"
                    : "You're on the waitlist — we'll reach out if a spot opens up."}
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="comic-border-sm mt-6 rounded-squircle-md bg-lt-yellow px-6 py-2.5 text-sm font-bold text-black"
                >
                  Done
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5">
                <div>
                  <label htmlFor="reg-name" className={LABEL_CLASS}>
                    Name<span aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={firstFieldRef}
                    id="reg-name"
                    name="name"
                    type="text"
                    required
                    className={FIELD_CLASS}
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className={LABEL_CLASS}>
                    Email<span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    className={FIELD_CLASS}
                  />
                </div>

                <div>
                  <label htmlFor="reg-phone" className={LABEL_CLASS}>
                    Mobile Number<span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    required
                    className={FIELD_CLASS}
                  />
                </div>

                <div>
                  <label htmlFor="reg-reason" className={LABEL_CLASS}>
                    Why do you want to take this workshop?
                  </label>
                  <textarea
                    id="reg-reason"
                    name="reason"
                    rows={3}
                    className={`${FIELD_CLASS} resize-y`}
                  />
                </div>

                <div>
                  <label htmlFor="reg-brand" className={LABEL_CLASS}>
                    Your Brand Name
                  </label>
                  <input
                    id="reg-brand"
                    name="brandName"
                    type="text"
                    className={FIELD_CLASS}
                  />
                </div>

                <div>
                  <label htmlFor="reg-designation" className={LABEL_CLASS}>
                    Designation
                  </label>
                  <input
                    id="reg-designation"
                    name="designation"
                    type="text"
                    className={FIELD_CLASS}
                  />
                </div>

                {result === "error" && (
                  <p className="text-sm font-semibold text-lt-red">
                    Something went wrong. Please try again.
                  </p>
                )}

                <div className="mt-3 flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="comic-border-sm rounded-squircle-xs bg-lt-yellow px-5 py-2 text-sm font-semibold text-black disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "Request To Join"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-sm text-black/60 hover:text-black"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
