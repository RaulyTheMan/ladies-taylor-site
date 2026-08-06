"use client";

import { useState } from "react";

export default function NewsletterSignup({ source }: { source: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="mt-4 text-xs font-semibold text-black">
        You&rsquo;re on the list. 🤙
      </p>
    );
  }

  return (
    <form className="contents" onSubmit={handleSubmit}>
      <label
        htmlFor="press-subscribe-email"
        className="mt-4 block text-xs font-bold text-black"
      >
        Email Address
      </label>
      <input
        id="press-subscribe-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="mt-2 w-full rounded-squircle-sm border border-black/20 bg-white px-3 py-2 text-xs text-black placeholder:text-black/50"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="comic-border-sm mt-3 w-full rounded-squircle-md bg-lt-red px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-60"
      >
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="mt-2 text-xs font-semibold text-lt-red">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
