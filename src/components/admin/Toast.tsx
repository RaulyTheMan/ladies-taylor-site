"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Reads a one-time `?flash=` message left by a Server Action's redirect
// (see src/lib/admin/flash.ts), shows it, then strips the param from the
// URL so refreshing or going back doesn't re-show it.
export default function Toast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const flash = searchParams.get("flash");

  // Derived at render time (compared against the previous flash value)
  // rather than via a setState-in-effect, per React's guidance for
  // resetting state when a prop changes.
  const [prevFlash, setPrevFlash] = useState(flash);
  const [message, setMessage] = useState<string | null>(flash);
  if (flash !== prevFlash) {
    setPrevFlash(flash);
    setMessage(flash);
  }

  useEffect(() => {
    if (!flash) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("flash");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });

    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flash]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-lg border border-black/10 bg-black px-4 py-3 text-sm font-medium text-white shadow-lg"
    >
      {message}
      <button
        type="button"
        onClick={() => setMessage(null)}
        aria-label="Dismiss notification"
        className="ml-2 text-white/60 hover:text-white"
      >
        ×
      </button>
    </div>
  );
}
