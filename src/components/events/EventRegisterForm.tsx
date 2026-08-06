"use client";

import { useState } from "react";
import { PRIMARY_BUTTON_CLASS } from "@/lib/ui";

export default function EventRegisterForm({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"registered" | "waiting" | "error" | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch(`/api/events/${slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email }),
      });
      const data = await res.json();
      setResult(res.ok ? data.status : "error");
    } catch {
      setResult("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (result === "registered" || result === "waiting") {
    return (
      <p className="mt-4 text-sm font-bold text-black">
        {result === "registered"
          ? "You're registered — see you there. 🤙"
          : "You're on the waitlist — we'll reach out if a spot opens up."}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-3 sm:max-w-sm"
    >
      <label htmlFor="register-name" className="sr-only">
        Full Name
      </label>
      <input
        id="register-name"
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
        className="rounded-squircle-sm border border-black/20 bg-white px-3 py-2 text-sm text-black placeholder:text-black/50"
      />
      <label htmlFor="register-phone" className="sr-only">
        Phone Number
      </label>
      <input
        id="register-phone"
        type="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone Number"
        className="rounded-squircle-sm border border-black/20 bg-white px-3 py-2 text-sm text-black placeholder:text-black/50"
      />
      <label htmlFor="register-email" className="sr-only">
        Email
      </label>
      <input
        id="register-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="rounded-squircle-sm border border-black/20 bg-white px-3 py-2 text-sm text-black placeholder:text-black/50"
      />

      {result === "error" && (
        <p className="text-sm font-semibold text-lt-red">
          Something went wrong. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={`${PRIMARY_BUTTON_CLASS} mt-1 self-start disabled:opacity-60`}
      >
        {submitting ? "Joining..." : "Join Guest List"}
      </button>
    </form>
  );
}
