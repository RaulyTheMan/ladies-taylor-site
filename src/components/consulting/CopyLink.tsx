"use client";

import { useState } from "react";

/**
 * With no confirmation email, this link IS the guest's copy of the booking.
 * It is shown as selectable text rather than hidden behind an icon, because
 * someone who loses it has paid and has no way back.
 */
export default function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-squircle-xs border border-black/15 bg-black/[0.04] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
        Save this link — it&apos;s how you get back to this booking
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 break-all text-xs text-black/80">{url}</code>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              // Clipboard can be blocked; the text above is selectable anyway.
            }
          }}
          className="comic-border-sm shrink-0 rounded-squircle-xs bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-black"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
