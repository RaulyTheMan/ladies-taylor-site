"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Shown to someone who has just come back from paying, while the webhook
 * catches up.
 *
 * Razorpay usually fires within a second or two, but the customer's browser gets
 * back here immediately, so without this they would read "we haven't received
 * your payment yet" the instant after paying. Refreshes the server component a
 * few times, then stops and tells them plainly rather than spinning forever.
 */
export default function AwaitingConfirmation() {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (elapsed >= 30) return;
    const timer = setTimeout(() => {
      setElapsed((value) => value + 3);
      router.refresh();
    }, 3000);
    return () => clearTimeout(timer);
  }, [elapsed, router]);

  if (elapsed >= 30) {
    return (
      <div className="comic-border-sm mt-5 rounded-squircle-xs bg-lt-yellow p-4">
        <p className="text-sm font-semibold text-black">
          Still waiting on the payment to clear.
        </p>
        <p className="mt-1 text-sm text-black/70">
          This sometimes takes a few minutes with UPI and netbanking. Your time is
          held — refresh this page shortly. If it hasn&apos;t changed in an hour,
          send us the payment reference and we&apos;ll sort it out.
        </p>
      </div>
    );
  }

  return (
    <div className="comic-border-sm mt-5 rounded-squircle-xs bg-lt-yellow p-4">
      <p className="text-sm font-semibold text-black">Confirming your payment…</p>
      <p className="mt-1 text-sm text-black/70">
        This page updates itself. Your time is held while we check.
      </p>
    </div>
  );
}
