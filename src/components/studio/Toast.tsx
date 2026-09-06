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
      className="admin-root fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-admin-md bg-admin-fg px-3.5 py-2.5 text-[13px] font-medium text-white shadow-lg"
    >
      {message}
      <button
        type="button"
        onClick={() => setMessage(null)}
        aria-label="Dismiss notification"
        className="ml-1 rounded-admin-sm px-1 text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline"
      >
        ×
      </button>
    </div>
  );
}
