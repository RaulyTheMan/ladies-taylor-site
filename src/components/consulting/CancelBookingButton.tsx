"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelBookingButton({ token }: { token: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/consulting/booking/${token}/cancel`, {
        method: "POST",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message ?? "Couldn't cancel. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Couldn't cancel. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm font-semibold text-black/60 underline underline-offset-2 hover:text-black"
      >
        Cancel this booking
      </button>
    );
  }

  return (
    <div className="comic-border-sm rounded-squircle-xs bg-lt-yellow p-4">
      <p className="text-sm font-semibold text-black">Cancel this booking?</p>
      <p className="mt-1 text-sm text-black/70">
        The time is released straight away. Any refund is handled separately — we&apos;ll
        be in touch.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-lt-red">
          {error}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={cancel}
          disabled={busy}
          className="comic-border-sm rounded-squircle-md bg-lt-red px-5 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-60"
        >
          {busy ? "Cancelling..." : "Yes, cancel"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-sm font-semibold text-black underline underline-offset-2"
        >
          Keep it
        </button>
      </div>
    </div>
  );
}
